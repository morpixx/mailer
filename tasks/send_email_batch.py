from celery import Celery
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URL
from services.batch_manager import get_pending_recipients, get_gmail_account
from services.gmail_sender import send_email
import os

celery_app = Celery("tasks", broker=os.getenv("REDIS_BROKER_URL", "redis://localhost:6379/0"))

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

@celery_app.task
def send_email_batch():
    session = Session()
    recipients = get_pending_recipients(session)
    print(f"Знайдено {len(recipients)} email-ів для розсилки")  # Додаємо лог
    for recipient in recipients:
        account = get_gmail_account(session)
        if not account:
            print("Немає доступних акаунтів для відправки")
            break
        print(f"Відправляю на {recipient.email} з акаунта {account.email}")  # Додаємо лог
        status = send_email(recipient, account, session)
        print(f"Результат для {recipient.email}: {status}")  # Додаємо лог
    session.close()