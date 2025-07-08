import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///mailer.db")
REDIS_BROKER_URL = os.getenv("REDIS_BROKER_URL", "redis://localhost:6379/0")
SEND_EVERY_SECONDS = int(os.getenv("SEND_EVERY_SECONDS", 60))
BATCH_SIZE = int(os.getenv("BATCH_SIZE", 10))
GMAIL_DAILY_LIMIT = int(os.getenv("GMAIL_DAILY_LIMIT", 500))