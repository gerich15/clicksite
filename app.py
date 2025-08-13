from flask import Flask, request, jsonify, render_template, redirect, url_for, session, flash, abort
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
from dotenv import load_dotenv
import requests
from flask_sqlalchemy import SQLAlchemy
from functools import wraps
from sqlalchemy import or_

# Инициализация приложения
app = Flask(__name__)  # Исправлено: name → __name__
load_dotenv()

# Конфигурация приложения
app.config.update({
    'SECRET_KEY': os.getenv('SECRET_KEY', 'your_secret_key_here'),
    'SQLALCHEMY_DATABASE_URI': 'sqlite:///services.db',
    'SQLALCHEMY_TRACK_MODIFICATIONS': False,
    'UPLOAD_FOLDER': 'static/uploads',
    'MAX_CONTENT_LENGTH': 16 * 1024 * 1024,  # Макс. размер файла — 16MB
    'YANDEX_API_KEY': os.getenv('YANDEX_API_KEY'),
    'YANDEX_GEOCODER_KEY': os.getenv('YANDEX_GEOCODER_KEY')
})

# Инициализация базы данных
db = SQLAlchemy(app)

# Поддерживаемые расширения файлов
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# --- Модели ---

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    avatar = db.Column(db.String(100), default='default.jpg')
    phone = db.Column(db.String(20))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    phone = db.Column(db.String(20))
    services = db.Column(db.String(200))  # Например: "ТО|ремонт|шиномонтаж"
    rating = db.Column(db.Float, default=0.0)
    description = db.Column(db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'lat': self.lat,
            'lng': self.lng,
            'phone': self.phone,
            'services': self.services.split('|') if self.services else [],
            'rating': self.rating,
            'description': self.description
        }


# --- Вспомогательные функции ---

def yandex_geocode(address):
    """Геокодирование через API Яндекса"""
    try:
        url = f"https://geocode-maps.yandex.ru/1.x/?apikey={app.config['YANDEX_GEOCODER_KEY']}&format=json&geocode={address}"
        response = requests.get(url, timeout=5)
        response.raise_for_status()

        data = response.json()
        feature = data['response']['GeoObjectCollection']['featureMember'][0]
        pos = feature['GeoObject']['Point']['pos']
        full_address = feature['GeoObject']['metaDataProperty']['GeocoderMetaData']['text']

        coords = list(map(float, pos.split()))
        return {
            'coords': coords,
            'address': full_address
        }
    except Exception as e:
        app.logger.error(f"Geocoding error: {str(e)}")
        return None


def notify_new_service(service):
    """Функция для уведомлений (можно заменить на email, Telegram и т.д.)"""
    app.logger.info(f"New service added: {service.name}")


# --- Декораторы ---

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_email' not in session:
            flash('Пожалуйста, войдите в систему.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function


# --- Маршруты ---

@app.route('/')
def index():
    """Главная страница"""
    return render_template('index.html', yandex_api_key=app.config['YANDEX_API_KEY'])


@app.route('/api/services', methods=['GET'])
def get_services():
    """API для получения списка сервисов с фильтрацией и пагинацией"""
    try:
        search = request.args.get('search', '')
        bbox = request.args.get('bbox')
        service_type = request.args.get('service_type')
        page = int(request.args.get('page', 1))
        per_page = 20

        query = Service.query

        if search:
            query = query.filter(
                or_(
                    Service.name.ilike(f'%{search}%'),
                    Service.address.ilike(f'%{search}%'),
                    Service.services.ilike(f'%{search}%')
                )
            )

        if bbox:
            coords = list(map(float, bbox.split(',')))
            query = query.filter(
                Service.lat.between(coords[1], coords[3]),  # lat: y1, y2
                Service.lng.between(coords[0], coords[2])   # lng: x1, x2
            )

        if service_type:
            query = query.filter(Service.services.ilike(f'%{service_type}%'))

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        services = pagination.items

        return jsonify({
            'services': [s.to_dict() for s in services],
            'has_next': pagination.has_next,
            'page': page,
            'total': pagination.total
        })

    except Exception as e:
        app.logger.error(f"Service search error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/services', methods=['POST'])
@login_required
def add_service():
    """API для добавления нового сервиса (только для авторизованных)"""
    try:
        data = request.get_json()

        required_fields = ['name', 'address']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        geocode_result = yandex_geocode(data['address'])
        if not geocode_result:
            return jsonify({'error': 'Geocoding failed. Check address.'}), 500

        new_service = Service(
            name=data['name'],
            address=geocode_result['address'],
            lat=geocode_result['coords'][1],  # Y — широта
            lng=geocode_result['coords'][0],  # X — долгота
            phone=data.get('phone'),
            services='|'.join(data.get('services', [])),
            rating=data.get('rating', 0),
            description=data.get('description', '')
        )

        db.session.add(new_service)
        db.session.commit()

        notify_new_service(new_service)
        return jsonify(new_service.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Add service error: {str(e)}")
        return jsonify({'error': 'Failed to add service'}), 500


# --- Аутентификация ---

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Регистрация пользователя"""
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email'].lower()
        password = request.form['password']
        phone = request.form['phone']

        if len(password) < 6:
            flash('Пароль должен быть не менее 6 символов.', 'error')
            return redirect(url_for('register'))

        if User.query.filter_by(email=email).first():
            flash('Email уже зарегистрирован.', 'error')
            return redirect(url_for('register'))

        avatar = 'default.jpg'
        if 'avatar' in request.files:
            file = request.files['avatar']
            if file and file.filename != '' and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                avatar = filename
            elif file.filename != '':
                flash('Недопустимый формат файла.', 'error')
                return redirect(url_for('register'))

        user = User(name=name, email=email, phone=phone, avatar=avatar)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        session['user_email'] = email
        flash('Регистрация успешна!', 'success')
        return redirect(url_for('profile'))

    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    """Вход пользователя"""
    if request.method == 'POST':
        email = request.form['email'].lower()
        password = request.form['password']

        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            session['user_email'] = email
            flash('Вы успешно вошли.', 'success')
            return redirect(url_for('profile'))
        else:
            flash('Неверный email или пароль.', 'error')

    return render_template('login.html')


@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    """Профиль пользователя"""
    user = User.query.filter_by(email=session['user_email']).first()
    if not user:
        abort(404)

    if request.method == 'POST':
        user.name = request.form['name']
        user.phone = request.form['phone']

        if 'avatar' in request.files:
            file = request.files['avatar']
            if file and file.filename != '' and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                user.avatar = filename

        db.session.commit()
        flash('Профиль обновлён!', 'success')

    return render_template('profile.html', user=user)


@app.route('/logout')
def logout():
    """Выход из системы"""
    session.pop('user_email', None)
    flash('Вы вышли из системы.', 'info')
    return redirect(url_for('index'))


# --- API для отзывов и бронирования ---

@app.route('/api/reviews')
def get_reviews():
    """API для получения отзывов"""
    reviews = [
        {
            "author": "Александр К.",
            "rating": 5,
            "date": "12.05.2023",
            "text": "Отличный сервис, быстро сделали ТО"
        },
        {
            "author": "Марина П.",
            "rating": 4,
            "date": "05.06.2023",
            "text": "Хорошее обслуживание, но немного дорого"
        }
    ]
    return jsonify(reviews)


@app.route('/api/book', methods=['POST'])
@login_required
def book_service():
    """API для записи на сервис"""
    data = request.get_json()
    required = ['service_id', 'datetime']
    if not all(k in data for k in required):
        return jsonify({'error': 'Missing required fields'}), 400

    # Здесь можно добавить логику сохранения в БД
    return jsonify({"status": "success", "message": "Запись успешно создана", "booking_id": 123})


# --- Обработка ошибок ---

@app.errorhandler(404)
def not_found(e):
    return render_template('404.html'), 404


@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500


# --- Запуск приложения ---

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        # Создание админа по умолчанию (для тестов)
        if not User.query.filter_by(email='admin@example.com').first():
            admin = User(name='Admin', email='admin@example.com', phone='+79001234567')
            admin.set_password('123456')
            db.session.add(admin)
            db.session.commit()
            app.logger.info("Admin user created: admin@example.com")

    app.run(host='0.0.0.0', port=5000, debug=True)
