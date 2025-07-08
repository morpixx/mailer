import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.email_recipient import EmailRecipient, EmailStatus
from config import DATABASE_URL

def add_emails_from_file(filename):
    print(f"Відкриваю файл: {filename}")  # Додаємо цей рядок для перевірки
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    with open(filename, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            emails = [email.strip() for email in line.split(":") if email.strip()]
            for email in emails:
                exists = session.query(EmailRecipient).filter_by(email=email).first()
                if not exists:
                    session.add(EmailRecipient(email=email, status=EmailStatus.pending))
    session.commit()
    session.close()

def add_emails_from_env():
    emails_env = os.getenv("EMAIL_RECIPIENTS", "")
    if not emails_env:
        print("EMAIL_RECIPIENTS env var is empty")
        return
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    for line in emails_env.strip().splitlines():
        line = line.strip()
        if not line:
            continue
        emails = [email.strip() for email in line.split(":") if email.strip()]
        for email in emails:
            exists = session.query(EmailRecipient).filter_by(email=email).first()
            if not exists:
                session.add(EmailRecipient(email=email, status=EmailStatus.pending))
    session.commit()
    session.close()
    print("Імпорт email-ів з env завершено.")

if __name__ == "__main__":
    # Якщо EMAIL_RECIPIENTS є у змінних середовища — читаємо з env, інакше з файлу
    if os.getenv("EMAIL_RECIPIENTS"):
        add_emails_from_env()
    else:
        if len(sys.argv) == 2:
            filename = sys.argv[1]
        else:
            filename = os.path.join(os.path.dirname(__file__), "emails.txt")
            print(f"Аргумент не передано, використовую файл за замовчуванням: {filename}")
        add_emails_from_file(filename)