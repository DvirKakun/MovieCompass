from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta, timezone
from pymongo import MongoClient
from app.core.config import settings
from app.utils.app_instance import application
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Replace with your actual connection string:
client = MongoClient(settings.MONGO_CONNECTION_STRING)
db = client.get_database(settings.MONGO_DATABASE_NAME)
users_collection = db.get_collection(settings.MONGO_COLLECTION_NAME)

def delete_unverified_users():
    """
    Deletes any user whose:
      - isVerified == False
      - created_at < now - 24 hours
    """
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    result = users_collection.delete_many({
        "is_verified": False,
        "created_at": {"$lt": cutoff}
    })

    logger.info(f"Deleted {result.deleted_count} unverified user(s) older than 24h.")

# Initialize the scheduler
scheduler = BackgroundScheduler()

@application.on_event("startup")
def startup_event():
    # Schedule the job to run daily at 2:00 AM
    scheduler.add_job(delete_unverified_users, 'cron', hour=3)

    scheduler.start()

@application.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()
