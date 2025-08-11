from flask import Flask, request, jsonify, render_template, redirect, url_for, session, flash
from werkzeug.utils import secure_filename
import os
from dotenv import load_dotenv
import requests
from flask_sqlalchemy import SQLAlchemy

# Инициализация приложения
app = Flask(__name__)
load_dotenv()

# Конфигурация приложения
app.config.update({
    'SECRET_KEY': os.getenv('SECRET_KEY', 'your_secret_key_here'),
    'SQLALCHEMY_DATABASE_URI': 'sqlite:///services.db',
    'SQLALCHEMY_TRACK_MODIFICATIONS': False,
    'UPLOAD_FOLDER': 'static/uploads',
    'YANDEX_API_KEY': os.getenv('YANDEX_API_KEY'),
    'YANDEX_GEOCODER_KEY': os.getenv('YANDEX_GEOCODER_KEY')
})

# Инициализация базы данных
db = SQLAlchemy(app)

# Модель данных


class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    phone = db.Column(db.String(20))
    services = db.Column(db.String(200))
    rating = db.Column(db.Float)
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


# Моковые данные для демонстрации
users = {
    "admin@example.com": {
        "name": "Admin",
        "password": "123456",
        "avatar": "default.jpg",
        "phone": "+79001234567"
    }
}

# Вспомогательные функции


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

        return {
            'coords': list(map(float, pos.split())),
            'address': full_address
        }
    except Exception as e:
        app.logger.error(f"Geocoding error: {str(e)}")
        return None


def notify_new_service(service):
    """Функция для уведомлений"""
    app.logger.info(f"New service added: {service.name}")

# Маршруты приложения


@app.route('/')
def index():
    """Главная страница"""
    return render_template('index.html',
                           yandex_api_key=app.config['YANDEX_API_KEY'],
                           service=service_data)


@app.route('/api/services', methods=['GET'])
def get_services():
    """API для получения списка сервисов"""
    try:
        search = request.args.get('search')
        bbox = request.args.get('bbox')
        service_type = request.args.get('service_type')

        query = Service.query

        if search:
            query = query.filter(
                db.or_(
                    Service.name.ilike(f'%{search}%'),
                    Service.address.ilike(f'%{search}%'),
                    Service.services.ilike(f'%{search}%')
                )
            )

        if bbox:
            coords = list(map(float, bbox.split(',')))
            query = query.filter(
                Service.lat.between(coords[0], coords[2]),
                Service.lng.between(coords[1], coords[3])
            )

        if service_type:
            query = query.filter(Service.services.ilike(f'%{service_type}%'))

        services = query.limit(100).all()
        return jsonify([s.to_dict() for s in services])

    except Exception as e:
        app.logger.error(f"Service search error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/services', methods=['POST'])
def add_service():
    """API для добавления нового сервиса"""
    try:
        data = request.get_json()

        # Валидация данных
        required_fields = ['name', 'address']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Геокодирование
        geocode_result = yandex_geocode(data['address'])
        if not geocode_result:
            return jsonify({'error': 'Geocoding failed'}), 500

        # Создание сервиса
        new_service = Service(
            name=data['name'],
            address=geocode_result['address'],
            lat=geocode_result['coords'][0],
            lng=geocode_result['coords'][1],
            phone=data.get('phone'),
            services='|'.join(data.get('services', [])),
            rating=data.get('rating', 0),
            description=data.get('description', '')
        )

        db.session.add(new_service)
        db.session.commit()

        notify_new_service(new_service)
        return jsonify(new_service.to_dict())

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Add service error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Маршруты для аутентификации


@app.route('/register', methods=['GET', 'POST'])
def register():
    """Регистрация пользователя"""
    if request.method == 'POST':
        email = request.form['email']
        if email in users:
            flash('Email already registered!', 'error')
            return redirect(url_for('register'))

        # Сохранение аватара
        avatar = 'default.jpg'
        if 'avatar' in request.files:
            file = request.files['avatar']
            if file.filename != '':
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                avatar = filename

        # Создание пользователя
        users[email] = {
            "name": request.form['name'],
            "password": request.form['password'],
            "avatar": avatar,
            "phone": request.form['phone']
        }

        session['user_email'] = email
        return redirect(url_for('profile'))

    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    """Аутентификация пользователя"""
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        if email in users and users[email]['password'] == password:
            session['user_email'] = email
            return redirect(url_for('profile'))
        else:
            flash('Invalid email or password', 'error')

    return render_template('login.html')


@app.route('/profile', methods=['GET', 'POST'])
def profile():
    """Профиль пользователя"""
    if 'user_email' not in session:
        return redirect(url_for('login'))

    user = users[session['user_email']]

    if request.method == 'POST':
        # Обновление профиля
        user['name'] = request.form['name']
        user['phone'] = request.form['phone']

        if 'avatar' in request.files:
            file = request.files['avatar']
            if file.filename != '':
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                user['avatar'] = filename

        flash('Profile updated successfully!', 'success')

    return render_template('profile.html', user=user)


@app.route('/logout')
def logout():
    """Выход из системы"""
    session.pop('user_email', None)
    return redirect(url_for('index'))


# Моковые данные для демонстрации
service_data = {
    "name": "Автосервис \"МоторМастер\"",
    "rating": 4.7,
    "reviews_count": 128,
    "address": "Москва, ул. Автозаводская, 23к1",
    "phone": "+74951234567",
    "working_hours": {
        "weekdays": "9:00-21:00",
        "weekend": "10:00-18:00"
    },
    "specialization": "Немецкие автомобили, ТО, диагностика",
    "description": "Профессиональный ремонт и обслуживание автомобилей",
    "features": [
        "Бесплатная диагностика",
        "Гарантия на работы",
        "Собственный склад запчастей"
    ],
    "services": [
        {"name": "Замена масла", "price": "от 1 500 ₽"},
        {"name": "Диагностика подвески", "price": "от 2 000 ₽"}
    ],
    "photos": [
        "service-main.jpg",
        "photo2.jpg"
    ]
}


@app.route('/api/reviews')
def get_reviews():
    """API для получения отзывов"""
    reviews = [
        {
            "author": "Александр К.",
            "rating": 5,
            "date": "12.05.2023",
            "text": "Отличный сервис, быстро сделали ТО"
        }
    ]
    return jsonify(reviews)


@app.route('/api/book', methods=['POST'])
def book_service():
    """API для записи на сервис"""
    data = request.json
    return jsonify({"status": "success", "message": "Запись успешно создана"})


# Запуск приложения
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)
