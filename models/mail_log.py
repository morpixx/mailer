from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from datetime import datetime
from .base import Base

class MailLog(Base):
    __tablename__ = "mail_log"
    id = Column(Integer, primary_key=True)
    recipient_id = Column(Integer, ForeignKey("email_recipient.id"))
    gmail_account_id = Column(Integer, ForeignKey("gmail_account.id"))
    status = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    response = Column(Text)
    error = Column(String, nullable=True)