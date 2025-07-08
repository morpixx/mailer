import time
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import base64
from config import GMAIL_DAILY_LIMIT
from services.template_renderer import render_template

def build_gmail_service(account):
    creds = Credentials(
        None,
        refresh_token=account.refresh_token,
        client_id=account.client_id,
        client_secret=account.client_secret,
        token_uri="https://oauth2.googleapis.com/token"
    )
    return build("gmail", "v1", credentials=creds)

def send_email(recipient, account, session):
    print(f"Починаю відправку на {recipient.email} через {account.email}")
    service = build_gmail_service(account)
    context = {"email": recipient.email}
    html = render_template("airdrop.html", context)
    text = render_template("airdrop.txt", context)
    message = MIMEMultipart("alternative")
    message["Subject"] = "Airdrop"
    message["From"] = account.email
    message["To"] = recipient.email
    message.attach(MIMEText(text, "plain"))
    message.attach(MIMEText(html, "html"))
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    try:
        response = service.users().messages().send(
            userId="me", body={"raw": raw}
        ).execute()
        status = "sent"
        error = None
    except Exception as e:
        response = str(e)
        status = "failed"
        error = str(e)
    # Логування
    from models.mail_log import MailLog
    from datetime import datetime
    log = MailLog(
        recipient_id=recipient.id,
        gmail_account_id=account.id,
        status=status,
        timestamp=datetime.utcnow(),
        response=str(response),
        error=error
    )
    session.add(log)
    # Оновлення статусу
    recipient.status = status if status == "sent" else recipient.status
    recipient.tries += 1
    recipient.last_try = datetime.utcnow()
    recipient.gmail_account_id = account.id
    if status == "failed" and recipient.tries > 3:
        recipient.status = "failed"
    session.commit()
    time.sleep(2)
    print(f"Відправка завершена для {recipient.email}, статус: {status}")
    return status