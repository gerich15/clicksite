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
