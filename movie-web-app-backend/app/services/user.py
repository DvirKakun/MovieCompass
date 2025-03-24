from typing import Optional
from passlib.context import CryptContext
from pymongo import MongoClient
from app.schemas.user import UserCreate, User
from app.core.config import settings

# Initialize the password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# MongoDB client setup
client = MongoClient(settings.MONGO_CONNECTION_STRING)
db = client.get_database(settings.MONGO_DATABASE_NAME)
users_collection = db.get_collection(settings.MONGO_COLLECTION_NAME)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_user(username: str) -> Optional[User]:
    user_data = users_collection.find_one({"username": username})

    if user_data:
        return User(**user_data)
    
    return None

def create_user(user: UserCreate) -> User:
    user_dict = user.dict()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))

    new_user = User(**user_dict)
    users_collection.insert_one(new_user.dict())

    return new_user