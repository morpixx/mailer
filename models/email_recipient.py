from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from datetime import datetime
import enum
from .base import Base

class EmailStatus(enum.Enum):
    pending = "pending"
    sending = "sending"
    sent = "sent"
    failed = "failed"
    bounced = "bounced"
    blocked = "blocked"

class EmailRecipient(Base):
    __tablename__ = "email_recipient"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    status = Column(Enum(EmailStatus), default=EmailStatus.pending)
    last_try = Column(DateTime, default=None)
    gmail_account_id = Column(Integer, ForeignKey("gmail_account.id"), nullable=True)
    tries = Column(Integer, default=0)