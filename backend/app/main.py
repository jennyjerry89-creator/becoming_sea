import os
import smtplib
from email.message import EmailMessage

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


class LeadRequest(BaseModel):
    name: str = Field(min_length=2)
    phone: str = Field(min_length=5)
    direction: str | None = None
    dates: str | None = None
    budget: str | None = None
    comment: str | None = None
    source: str
    consent: bool
    website: str = ''


app = FastAPI(title='Travel Landing Lead API')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*']
)


def format_message(lead: LeadRequest) -> str:
    return (
        f'Новая заявка ({lead.source})\\n'
        f'Имя: {lead.name}\\n'
        f'Телефон: {lead.phone}\\n'
        f'Направление: {lead.direction or "-"}\\n'
        f'Даты: {lead.dates or "-"}\\n'
        f'Бюджет: {lead.budget or "-"}\\n'
        f'Комментарий: {lead.comment or "-"}'
    )


async def send_to_telegram(text: str) -> bool:
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    chat_id = os.getenv('TELEGRAM_CHAT_ID')
    if not token or not chat_id:
        return False

    url = f'https://api.telegram.org/bot{token}/sendMessage'
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(url, json={'chat_id': chat_id, 'text': text})
    return response.status_code == 200


def send_to_email(text: str) -> bool:
    host = os.getenv('SMTP_HOST')
    port = int(os.getenv('SMTP_PORT', '587'))
    user = os.getenv('SMTP_USER')
    password = os.getenv('SMTP_PASSWORD')
    recipient = os.getenv('LEAD_EMAIL_TO')
    if not all([host, user, password, recipient]):
        return False

    message = EmailMessage()
    message['Subject'] = 'Новая заявка с лендинга'
    message['From'] = user
    message['To'] = recipient
    message.set_content(text)

    with smtplib.SMTP(host, port) as smtp:
        smtp.starttls()
        smtp.login(user, password)
        smtp.send_message(message)
    return True


@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}


@app.post('/api/leads')
async def create_lead(lead: LeadRequest) -> dict[str, str]:
    if lead.website:
        return {'status': 'ignored'}
    if not lead.consent:
        raise HTTPException(status_code=400, detail='Consent required')

    text = format_message(lead)
    telegram_ok = await send_to_telegram(text)
    email_ok = send_to_email(text)

    if not telegram_ok and not email_ok:
        raise HTTPException(status_code=500, detail='No delivery channel available')

    return {'status': 'ok'}
