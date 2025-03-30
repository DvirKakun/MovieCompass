from typing import Optional
from pymongo import MongoClient, ReturnDocument
from app.schemas.user import UserCreate, User
from app.schemas.rating import RatingEntry
from app.core.config import settings
from fastapi import HTTPException, status
from app.services.tmdb import make_request
from app.services.auth import get_password_hash

client = MongoClient(settings.MONGO_CONNECTION_STRING)
db = client.get_database(settings.MONGO_DATABASE_NAME)
users_collection = db.get_collection(settings.MONGO_COLLECTION_NAME)


def get_user(username: str) -> Optional[User]:
    query = {"$or": [{"username": username}, {"email": username}]}
    user_data = users_collection.find_one(query)
    
    if not user_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    return User(**user_data)   


def create_user(user: UserCreate) -> User:
    query = {"$or": [{"username": user.username}, {"email": user.username}]}
    existing_user = users_collection.find_one(query)
    
    if existing_user:
        if existing_user.get("username") == user.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Username already taken"
            )
        if existing_user.get("email") == user.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Email already registered"
            )
    
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
    
    updated_user = users_collection.find_one_and_update(
    {"username": user.username},
    {
        "$addToSet": {"favorite_movies": movie_id}
    },
    return_document=ReturnDocument.AFTER
    )


    return updated_user["favorite_movies"]

def remove_movie_from_favorites(user: User, movie_id: int):
    if movie_id not in user.favorite_movies:
        raise HTTPException(status_code=404, detail="Movie not found in favorites")
    
    updated_user = users_collection.find_one_and_update(
    {"username": user.username},
    {
        "$pull": {"favorite_movies": movie_id}
    },
    return_document=ReturnDocument.AFTER
    )  

    return updated_user["favorite_movies"]

async def add_movie_to_watchlist(user: User, movie_id: int):
    if movie_id in user.watchlist:
        raise HTTPException(status_code=400, detail="Movie already in watchlist")

    try:
        url = f"{settings.BASE_URL}/movie/{movie_id}?api_key={settings.TMDB_API_KEY}"

        await make_request(url, method="HEAD")
    except HTTPException:
        raise HTTPException(status_code=404, detail="Movie not found") 
    
    updated_user = users_collection.find_one_and_update(
    {"username": user.username},
    {
        "$addToSet": {"watchlist": movie_id}
    },
    return_document=ReturnDocument.AFTER
    )  

    return updated_user["watchlist"]

def remove_movie_from_watchlist(user: User, movie_id: int):
    if movie_id not in user.watchlist:
        raise HTTPException(status_code=404, detail="Movie not found in watchlist")
    
    updated_user = users_collection.find_one_and_update(
    {"username": user.username},
    {
        "$pull": {"watchlist": movie_id}
    },
    return_document=ReturnDocument.AFTER
    )  

    return updated_user["watchlist"]

async def add_movie_rating(user: User, movie_id: int, rating: int):
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating should be between 1 and 5")
    
    try:
        url = f"{settings.BASE_URL}/movie/{movie_id}?api_key={settings.TMDB_API_KEY}"

        await make_request(url, method="HEAD")
    except HTTPException:    
        raise HTTPException(status_code=404, detail="Movie not found")

    new_rating_entry = RatingEntry(movie_id=movie_id, rating=rating).dict()
    existing_rating = users_collection.find_one({"username": user.username, "ratings.movie_id": new_rating_entry["movie_id"]})

    if existing_rating:
        updated_user = users_collection.find_one_and_update(
            {"username": user.username, "ratings.movie_id": new_rating_entry["movie_id"]},
            {"$set": {"ratings.$.rating": new_rating_entry["rating"]}},
            return_document=ReturnDocument.AFTER
        )
    else:
        updated_user = users_collection.find_one_and_update(
            {"username": user.username},
            {"$addToSet": {"ratings": new_rating_entry}},
            return_document=ReturnDocument.AFTER
        )

    return updated_user["ratings"]