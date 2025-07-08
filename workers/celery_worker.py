from tasks.send_email_batch import celery_app
from celery.schedules import crontab
from config import SEND_EVERY_SECONDS

celery_app.conf.beat_schedule = {
    "send-email-batch": {
        "task": "tasks.send_email_batch.send_email_batch",
        "schedule": SEND_EVERY_SECONDS,
    }
}
celery_app.conf.timezone = "UTC"

if __name__ == "__main__":
    celery_app.start()