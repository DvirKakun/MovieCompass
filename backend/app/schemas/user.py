from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from app.schemas.rating import RatingEntry
from app.schemas.validator import SharedValidators
from datetime import datetime, timezone
from uuid import uuid4


class UserCreate(SharedValidators):
    username: str
    password: str
    confirm_password: str
    email: EmailStr
    first_name: str
    last_name: str
    phone_number: str

    model_config = ConfigDict(extra="forbid")


class GoogleUserCreate(SharedValidators):
    email: EmailStr
    first_name: str
    last_name: str
    google_id: str
    is_verified: bool = True

    model_config = ConfigDict(extra="forbid")


class UpdateUserProfile(SharedValidators):
    username: Optional[str] = None
    old_password: Optional[str] = None
    new_password: Optional[str] = None
    new_password_confirm: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    new_email: Optional[EmailStr] = None

    model_config = ConfigDict(extra="forbid")


class User(SharedValidators):
    id: str = Field(default_factory=lambda: str(uuid4()))
    username: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    google_id: Optional[str] = None
    auth_provider: str = "local"
    hashed_password: Optional[str] = None
    is_verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    favorite_movies: List[int] = []
    watchlist: List[int] = []
    ratings: List[RatingEntry] = []

    model_config = ConfigDict(from_attributes=True, validate_by_name=True)


class UserTokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

    model_config = ConfigDict(extra="forbid")


class UserResponse(BaseModel):
    user: User
    message: str = ""

    model_config = ConfigDict(extra="forbid")


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    model_config = ConfigDict(extra="forbid")


class ResetPasswordRequest(SharedValidators):
    token: str
    new_password: str
    new_password_confirm: str

    model_config = ConfigDict(extra="forbid")
