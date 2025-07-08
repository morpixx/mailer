import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.gmail_account import GmailAccount
from config import DATABASE_URL

def import_accounts_from_env():
    accounts = os.getenv("GMAIL_ACCOUNTS", "")
    if not accounts:
        print("GMAIL_ACCOUNTS env var is empty")
        return
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    for line in accounts.strip().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or ":" not in line:
            continue
        parts = line.split(":")
        if len(parts) != 4:
            print(f"Пропущено рядок (неправильний формат): {line}")
            continue
        email, refresh_token, client_id, client_secret = [p.strip() for p in parts]
        exists = session.query(GmailAccount).filter_by(email=email).first()
        if not exists:
            session.add(GmailAccount(
                email=email,
                refresh_token=refresh_token,
                client_id=client_id,
                client_secret=client_secret
            ))
    session.commit()
    session.close()
    print("Імпорт завершено.")

if __name__ == "__main__":
    import_accounts_from_env()