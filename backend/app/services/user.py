from typing import Optional
from pymongo import MongoClient, ReturnDocument
from app.schemas.user import (
    UserCreate,
    User,
    GoogleUserCreate,
    UpdateUserProfile,
    UserResponse,
)
from app.schemas.rating import RatingEntry
from app.core.config import settings
from fastapi import HTTPException, status, BackgroundTasks
from app.services.tmdb import make_request
from app.services.security import get_password_hash, verify_password, get_password_hash
from app.services.email import auth_email_create_token_and_send_email

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


def find_user_by_id(user_id: str) -> Optional[User]:
    user_data = users_collection.find_one({"id": user_id})

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
            detail={"field": "username", "message": "Incorrect username or password"},
        )

    return user


def create_user(user: UserCreate, background_tasks: BackgroundTasks) -> User:
    user_data = user.model_dump()

    if user_data.get("password") != user_data.get("confirm_password"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "field": "confirm_password",
                "message": "Password and confirm password do not match",
            },
        )

    existing_user = find_user_by_username(
        user_data.get("username")
    ) or find_user_by_email(user_data.get("email"))
    existing_user_data = existing_user.model_dump() if existing_user else None

    if existing_user_data:
        if existing_user_data.get("username") == user_data.get("username"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"field": "username", "message": "Username already taken"},
            )
        if existing_user_data.get("email") == user_data.get("email"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"field": "email", "message": "Email already registered"},
            )

    user_data.pop("confirm_password")
    user_data["hashed_password"] = get_password_hash(user_data.pop("password"))

    try:
        new_user = User(**user_data)
        users_collection.insert_one(new_user.model_dump())

        auth_email_create_token_and_send_email(
            new_user.id, new_user.email, background_tasks
        )

        return new_user

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"User creation failed: {str(e)}",
        )


def create_or_update_google_user(user_info) -> User:
    email = user_info.get("email")
    google_id = user_info.get("sub")
    first_name = user_info.get("given_name")
    last_name = user_info.get("family_name")

    user = find_user_by_email(email)

    if not user:
        user_dict = GoogleUserCreate(
            email=email,
            first_name=first_name,
            last_name=last_name,
            google_id=google_id,
        ).model_dump()

        user_dict["auth_provider"] = "google"
        # Optionally set a default username
        user_dict["username"] = user_dict.get("email").split("@")[0]

        user = User(**user_dict)
        users_collection.insert_one(user.model_dump())

    else:
        if not user.google_id:
            user.first_name = first_name
            user.last_name = last_name
            user.google_id = google_id
            user.auth_provider = "both"
            user.is_verified = True

            user = update_user(user)

    return user


def update_user(user: User) -> User:
    user_dict = user.model_dump()

    updated_user = users_collection.find_one_and_update(
        {"id": user.id}, {"$set": user_dict}, return_document=ReturnDocument.AFTER
    )

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "username", "message": "User not found"},
        )

    return User(**updated_user)


def validate_password_confirmation(new_pass: str, new_pass_confirm: str):
    if not (new_pass and new_pass_confirm):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "field": "password",
                "message": "Must provide new password and confirm it.",
            },
        )

    if new_pass:
        if not new_pass_confirm:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "field": "new_password_confirm",
                    "message": "Confirm password is required",
                },
            )
        if new_pass != new_pass_confirm:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "field": "new_password_confirm",
                    "message": "New password and confirmation do not match",
                },
            )


def _handle_username(current_user: User, update_data: dict) -> dict:
    if "username" not in update_data:
        return {}

    new_username = update_data.get("username")
    existing_user = find_user_by_username(new_username)

    if existing_user and existing_user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"field": "username", "message": "Username already taken"},
        )

    return {"username": new_username}


def _handle_password_change(current_user: User, update_data: dict) -> dict:
    if not any(
        k in update_data
        for k in ("old_password", "new_password", "new_password_confirm")
    ):
        return {}

    old_pass = update_data.get("old_password")
    new_pass = update_data.get("new_password")
    new_pass_confirm = update_data.get("new_password_confirm")

    validate_password_confirmation(new_pass, new_pass_confirm)

    if current_user.hashed_password:
        if not old_pass:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "field": "password",
                    "message": "Must provide old password to change an existing password.",
                },
            )

        if not verify_password(old_pass, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"field": "password", "message": "Old password is incorrect"},
            )

    return {"hashed_password": get_password_hash(new_pass)}


def _handle_email_change(
    current_user: User, update_data: dict, background_tasks: BackgroundTasks
) -> dict:
    if "new_email" not in update_data:
        return {}

    new_email = update_data.get("new_email")
    existing_email_user = find_user_by_email(new_email)

    if existing_email_user and existing_email_user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"field": "email", "message": "Email already in use"},
        )

    auth_email_create_token_and_send_email(current_user.id, new_email, background_tasks)

    return UserResponse(
        message="Verification email has been resent.", user=current_user
    )


def _handle_other_profile_fields(update_data: dict) -> dict:
    db_updates = {}

    for field in ("first_name", "last_name", "phone_number"):
        if field in update_data:
            db_updates[field] = update_data[field]

    return db_updates


def update_user_profile(
    current_user: User, updates: UpdateUserProfile, background_tasks: BackgroundTasks
) -> UserResponse:
    update_data = updates.model_dump(exclude_unset=True)

    db_updates_username = _handle_username(current_user, update_data)
    db_updates_password = _handle_password_change(current_user, update_data)
    db_updates_profile = _handle_other_profile_fields(update_data)
    user_email_response = _handle_email_change(
        current_user, update_data, background_tasks
    )

    db_updates = {**db_updates_username, **db_updates_password, **db_updates_profile}

    if not db_updates and not user_email_response:
        return UserResponse(user=current_user, message="No changes")

    elif not db_updates and user_email_response:
        return UserResponse(user=current_user, message=user_email_response.message)

    updated_user = users_collection.find_one_and_update(
        {"id": current_user.id},
        {"$set": db_updates},
        return_document=ReturnDocument.AFTER,
    )

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    if db_updates and user_email_response:
        return UserResponse(
            user=User(**updated_user),
            message=f"Profile updated. {user_email_response.message}",
        )

    return UserResponse(user=User(**updated_user), message="Profile updated")


def verify_user_email(user_id: str, email: str) -> User:
    updated_user = users_collection.find_one_and_update(
        {"id": user_id},
        {"$set": {"email": email, "is_verified": True}},
        return_document=ReturnDocument.AFTER,
    )

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "email", "message": "User not found"},
        )

    return User(**updated_user)


def reset_user_password(
    current_user: User, new_password: str, confirm_new_password: str
) -> UserResponse:
    validate_password_confirmation(new_password, confirm_new_password)

    updated_user = users_collection.find_one_and_update(
        {"id": current_user.id},
        {"$set": {"hashed_password": get_password_hash(new_password)}},
        return_document=ReturnDocument.AFTER,
    )

    return UserResponse(
        user=User(**updated_user), message="Password has been reset successfully"
    )


async def add_movie_to_favorites(user: User, movie_id: int):
    if movie_id in user.favorite_movies:
        raise HTTPException(status_code=400, detail="Movie already in favorites")

    try:
        url = f"{settings.BASE_URL}/movie/{movie_id}?api_key={settings.TMDB_API_KEY}"

        await make_request(url, method="HEAD")
    except HTTPException:
        raise HTTPException(status_code=404, detail="Movie not found")

    updated_user = users_collection.find_one_and_update(
        {"id": user.id},
        {"$addToSet": {"favorite_movies": movie_id}},
        return_document=ReturnDocument.AFTER,
    )

    return updated_user.get("favorite_movies")


def remove_movie_from_favorites(user: User, movie_id: int):
    if movie_id not in user.favorite_movies:
        raise HTTPException(status_code=404, detail="Movie not found in favorites")

    updated_user = users_collection.find_one_and_update(
        {"id": user.id},
        {"$pull": {"favorite_movies": movie_id}},
        return_document=ReturnDocument.AFTER,
    )

    return updated_user.get("favorite_movies")


async def add_movie_to_watchlist(user: User, movie_id: int):
    if movie_id in user.watchlist:
        raise HTTPException(status_code=400, detail="Movie already in watchlist")

    try:
        url = f"{settings.BASE_URL}/movie/{movie_id}?api_key={settings.TMDB_API_KEY}"

        await make_request(url, method="HEAD")
    except HTTPException:
        raise HTTPException(status_code=404, detail="Movie not found")

    updated_user = users_collection.find_one_and_update(
        {"id": user.id},
        {"$addToSet": {"watchlist": movie_id}},
        return_document=ReturnDocument.AFTER,
    )

    return updated_user.get("watchlist")


def remove_movie_from_watchlist(user: User, movie_id: int):
    if movie_id not in user.watchlist:
        raise HTTPException(status_code=404, detail="Movie not found in watchlist")

    updated_user = users_collection.find_one_and_update(
        {"id": user.id},
        {"$pull": {"watchlist": movie_id}},
        return_document=ReturnDocument.AFTER,
    )

    return updated_user.get("watchlist")


async def add_movie_rating(user: User, movie_id: int, rating: int):
    if rating < 1 or rating > 10:
        raise HTTPException(status_code=400, detail="Rating should be between 1 and 10")

    try:
        url = f"{settings.BASE_URL}/movie/{movie_id}?api_key={settings.TMDB_API_KEY}"

        await make_request(url, method="HEAD")
    except HTTPException:
        raise HTTPException(status_code=404, detail="Movie not found")

    new_rating_entry = RatingEntry(movie_id=movie_id, rating=rating).model_dump()
    existing_rating = users_collection.find_one(
        {"id": user.id, "ratings.movie_id": new_rating_entry["movie_id"]}
    )

    if existing_rating:
        updated_user = users_collection.find_one_and_update(
            {"id": user.id, "ratings.movie_id": new_rating_entry["movie_id"]},
            {"$set": {"ratings.$.rating": new_rating_entry["rating"]}},
            return_document=ReturnDocument.AFTER,
        )
    else:
        updated_user = users_collection.find_one_and_update(
            {"id": user.id},
            {"$addToSet": {"ratings": new_rating_entry}},
            return_document=ReturnDocument.AFTER,
        )

    return updated_user.get("ratings")


def delete_movie_rating(user: User, movie_id: int):
    has_rating = any(r.movie_id == movie_id for r in user.ratings)

    if not has_rating:
        raise HTTPException(
            status_code=404,
            detail="Rating not found for this movie",
        )

    updated_user = users_collection.find_one_and_update(
        {"id": user.id},
        {"$pull": {"ratings": {"movie_id": movie_id}}},
        return_document=ReturnDocument.AFTER,
    )

    return updated_user.get("ratings")
