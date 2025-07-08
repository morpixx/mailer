from sqlalchemy import Column, Integer, String, DateTime
from .base import Base

class GmailAccount(Base):
    __tablename__ = "gmail_account"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    refresh_token = Column(String, nullable=False)
    client_id = Column(String, nullable=False)
    client_secret = Column(String, nullable=False)
    last_used = Column(DateTime, default=None)