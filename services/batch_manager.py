from sqlalchemy.orm import Session
from models.email_recipient import EmailRecipient, EmailStatus
from models.gmail_account import GmailAccount
from models.mail_log import MailLog
from datetime import datetime, date
from config import GMAIL_DAILY_LIMIT, BATCH_SIZE

def get_gmail_account(session: Session):
    # Повертає акаунт, який сьогодні надіслав менше GMAIL_DAILY_LIMIT листів
    accounts = session.query(GmailAccount).all()
    for acc in accounts:
        today = date.today()
        sent_today = session.query(MailLog).filter(
            MailLog.gmail_account_id == acc.id,
            MailLog.timestamp >= datetime(today.year, today.month, today.day),
            MailLog.status == "sent"
        ).count()
        if sent_today < GMAIL_DAILY_LIMIT:
            return acc
    return None

def get_pending_recipients(session: Session):
    return session.query(EmailRecipient).filter(
        EmailRecipient.status == EmailStatus.pending
    ).limit(BATCH_SIZE).all()