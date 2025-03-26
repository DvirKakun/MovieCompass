from typing import Optional
from passlib.context import CryptContext
from pymongo import MongoClient
from app.schemas.user import UserCreate, User
from app.schemas.rating import RatingEntry
from app.core.config import settings
from fastapi import HTTPException, status
from typing import Dict
from app.services.tmdb import make_request

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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

async def add_movie_to_favorites(user: User, movie_id: int):
    if movie_id in user.favorite_movies:
        raise HTTPException(status_code=400, detail="Movie already in favorites")

    try:
        url = f"{settings.BASE_URL}/movie/{movie_id}?api_key={settings.TMDB_API_KEY}"

        await make_request(url, method="HEAD")
    except HTTPException:
        raise HTTPException(status_code=404, detail="Movie not found") 
    
    user.favorite_movies.append(movie_id)
    updated_user = update_user(user, {"favorite_movies": user.favorite_movies})

    return updated_user.favorite_movies

def remove_movie_from_favorites(user: User, movie_id: int):
    if movie_id not in user.favorite_movies:
        raise HTTPException(status_code=404, detail="Movie not found in favorites")
    
    user.favorite_movies.remove(movie_id)
    updated_user = update_user(user, {"favorite_movies": user.favorite_movies})

    return updated_user.favorite_movies

async def add_movie_to_watchlist(user: User, movie_id: int):
    if movie_id in user.watchlist:
        raise HTTPException(status_code=400, detail="Movie already in watchlist")

    try:
        url = f"{settings.BASE_URL}/movie/{movie_id}?api_key={settings.TMDB_API_KEY}"

        await make_request(url, method="HEAD")
    except HTTPException:
        raise HTTPException(status_code=404, detail="Movie not found") 
    
    user.watchlist.append(movie_id)
    updated_user =  update_user(user, {"watchlist": user.watchlist})

    return updated_user.watchlist

def remove_movie_from_watchlist(user: User, movie_id: int):
    if movie_id not in user.watchlist:
        raise HTTPException(status_code=404, detail="Movie not found in watchlist")
    
    user.watchlist.remove(movie_id)
    updated_user = update_user(user, {"watchlist": user.watchlist})

    return updated_user.watchlist

async def add_movie_rating(user: User, movie_id: int, rating: int):
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating should be between 1 and 5")
    
    try:
        url = f"{settings.BASE_URL}/movie/{movie_id}?api_key={settings.TMDB_API_KEY}"

        await make_request(url, method="HEAD")
    except HTTPException:    
        raise HTTPException(status_code=404, detail="Movie not found")
    
    for entry in user.ratings:
        if entry.movie_id == movie_id:
            entry.rating = rating 
            break
    else:
        newRatingEntry = RatingEntry(movie_id=movie_id, rating=rating)
        user.ratings.append(newRatingEntry)

    updated_user = update_user(user, {"ratings": [entry.model_dump() for entry in user.ratings]})

    return updated_user.ratings

def update_user(user: User, update_fields: Dict) -> User:
    updated_user_data = users_collection.find_one_and_update(
        {"username": user.username},  
        {"$set": update_fields},
        return_document=True
    )

    if not updated_user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(**updated_user_data)