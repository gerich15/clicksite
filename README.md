# ClickCar 🚗💨

**Сервис поиска и бронирования автосервисов с геолокацией**

![ClickCar Screenshot](/static/cc.png)

## 📌 О проекте
ClickCar — это веб-приложение для:
- Поиска автосервисов по локации и типу услуг
- Просмотра рейтингов и отзывов
- Онлайн-записи на обслуживание
- Управления профилями (для клиентов и сервисов)

## 🌟 Особенности
- Интеграция с Yandex Maps API
- Фильтрация по специализации (ТО, кузовной ремонт и др.)
- Система оценок и отзывов
- Личные кабинеты пользователей

## 🛠 Технологии
- **Backend**: Python + Flask
- **Frontend**: HTML5, CSS3, JavaScript
- **База данных**: SQLite (с возможностью перехода на PostgreSQL)
- **Дополнительно**: 
  - Flask-SQLAlchemy (ORM)
  - python-dotenv (переменные окружения)
  - Yandex Geocoder API

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
git clone git@github.com:gerich15/clicksite.git
cd clicksite
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

## File Tree: ClickCar

`/home/****/Рабочий стол/ClickCar `
```
├── 📁 .git/ 🚫 (auto-hidden)
├── 📁 images/
│   └── 📁 registr/
│       └── 📁 png/
│           ├── 🖼️ ava .png
│           ├── 🖼️ premium.jpg
│           └── 🖼️ serviceee.jpg
├── 📁 instance/
│   └── 🗄️ services.db
├── 📁 static/
│   ├── 📁 css/
│   │   ├── 🎨 auth.css
│   │   ├── 🎨 cards.css
│   │   ├── 🎨 profile.css
│   │   └── 🎨 style.css
│   ├── 📁 js/
│   │   ├── 📄 cards.js
│   │   ├── 📄 map.js
│   │   ├── 📄 profile.js
│   │   ├── 📄 registr.js
│   │   └── 📄 script.js
│   ├── 📁 uploads/
│   └── 🖼️ cc.png
├── 📁 templates/
│   ├── 🌐 cards.html
│   ├── 🌐 index.html
│   ├── 🌐 login.html
│   └── 🌐 profile.html
├── 🔒 .env 🚫 (auto-hidden)
├── 🚫 .gitignore
├── 📖 README.md
└── 🐍 app.py
```
