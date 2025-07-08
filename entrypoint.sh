#!/bin/sh
set -e

# Міграції БД
alembic upgrade head

# Імпорт акаунтів (якщо треба)
python cli/import_gmail_accounts_txt.py || true

# Імпорт email-ів (якщо треба)
python cli/add_emails_from_file.py || true

# Запуск celery worker
celery -A tasks.send_email_batch worker --loglevel=info