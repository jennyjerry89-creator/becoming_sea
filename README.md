# Я, ты, море — старт реализации лендинга

Начальный этап реализации по ТЗ `TZ_landing_travel.md`.

## Что сделано
- Подготовлен фронтенд на **Next.js** (`frontend/`) с one-page структурой, якорной навигацией, CTA, формами и базовой адаптивностью.
- Подготовлен бэкенд на **FastAPI** (`backend/`) с endpoint для приема заявок и доставкой в Telegram + SMTP fallback.

## Быстрый запуск

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Переменные окружения backend
```bash
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
LEAD_EMAIL_TO=
```
