from typing import Optional
from passlib.context import CryptContext
from pymongo import MongoClient
from app.schemas.user import UserCreate, User
from app.core.config import settings
from fastapi import HTTPException, status
from typing import List, Dict

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

    if not user_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    return User(**user_data)   

def authenticate_user(username: str, plain_password: str) -> User:
    user = get_user(username)

    if not verify_password(plain_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user 

def create_user(user: UserCreate) -> User:
    existing_user = users_collection.find_one({"username": user.username})

    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")
    
    user_dict = user.dict()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))

    try:
        new_user = User(**user_dict)
        users_collection.insert_one(new_user.dict())

        return new_user
    
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"User creation failed: {str(e)}")

def update_user(user: User, update_fields: Dict) -> User:
    updated_user_data = users_collection.find_one_and_update(
        {"username": user.username},  
        {"$set": update_fields} 
    )

    if not updated_user_data:
        raise HTTPException(status_code=404, detail="User not found")

    return User(**updated_user_data)

def add_movie_to_favorites(user: User, movie_id: int):
    if movie_id in user.favorite_movies:
        raise HTTPException(status_code=400, detail="Movie already in favorites")
    
    user.favorite_movies.append(movie_id)
    update_user(user, {"favorite_movies": user.favorite_movies})

    return user.favorite_movies

def remove_movie_from_favorites(user: User, movie_id: int):
    if movie_id not in user.favorite_movies:
        raise HTTPException(status_code=404, detail="Movie not found in favorites")
    
    user.favorite_movies.remove(movie_id)
    update_user(user, {"favorite_movies": user.favorite_movies})

    return user.favorite_movies