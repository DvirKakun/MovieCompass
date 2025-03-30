from typing import Optional
from pymongo import MongoClient, ReturnDocument
from app.schemas.user import UserCreate, User, GoogleUserCreate, UserTokenResponse
from app.schemas.rating import RatingEntry
from app.core.config import settings
from fastapi import HTTPException, status, BackgroundTasks
from app.services.tmdb import make_request
from app.services.security import get_password_hash, create_access_token
from app.services.email import send_verification_email
from datetime import timedelta

client = MongoClient(settings.MONGO_CONNECTION_STRING)
db = client.get_database(settings.MONGO_DATABASE_NAME)
users_collection = db.get_collection(settings.MONGO_COLLECTION_NAME)

def find_user_by_email(email: str) -> Optional[User]:
    user_data = users_collection.find_one({"email": email})

    if not user_data:
        return None
    
    return User(**user_data)

def find_user_by_username(username: str) -> Optional[User]:
    user_data = users_collection.find_one({"username": username})

    if not user_data:
        return None
    
    return User(**user_data)

def get_user(identifier: str) -> User:
    if "@" in identifier:
        user = find_user_by_email(identifier)
    else:
        user = find_user_by_username(identifier)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "username", "message" :"User not found"},
        )
    
    return user

def create_user(user: UserCreate, background_tasks: BackgroundTasks) -> User:
    existing_user = find_user_by_username(user.username) or find_user_by_email(user.email)
    
    if existing_user:
        if existing_user.username == user.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail={"field":"username", "message": "Username already taken"}
            )
        if existing_user.email == user.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail={"field": "email", "message": "Email already registered"}
            )
    
    user_dict = user.dict()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))

    try:
        new_user = User(**user_dict)
        users_collection.insert_one(new_user.dict())

        access_token = create_access_token(
        data={"sub": user.email}, expires_delta=timedelta(hours=1)
            )
        
        verification_link = f"{settings.DEPLOYMENT_URL}/auth/verify-email?token={access_token}"
        background_tasks.add_task(send_verification_email, user.email, verification_link)

        return new_user
    
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"User creation failed: {str(e)}")
    
def create_google_user(google_data: GoogleUserCreate) -> User:
    user_dict = google_data.dict()

    user_dict["auth_provider"] = "google"
    # Optionally set a default username
    user_dict["username"] = user_dict["email"].split("@")[0]
    
    new_user = User(**user_dict)
    users_collection.insert_one(new_user.dict())
    
    return new_user    

def update_user(user : User) -> User:
    user_dict = user.dict()

    updated_user = users_collection.find_one_and_update(
        {"username": user.username},
        {"$set": user_dict},
        return_document=ReturnDocument.AFTER
    )

    if not updated_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"field": "username", "message": "User not found"})

    return User(**updated_user)

def verify_user_email(email: str) -> User:
    updated_user = users_collection.find_one_and_update(
        {"email": email},
        {"$set": {"is_verified": True}},
        return_document=ReturnDocument.AFTER
    )

    if not updated_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"field": "email", "message": "User not found"})
    
    return User(**updated_user)

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