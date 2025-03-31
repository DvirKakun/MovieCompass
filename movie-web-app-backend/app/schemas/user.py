from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from app.schemas.rating import RatingEntry
from datetime import datetime, timezone

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=20, pattern="^[a-zA-Z0-9_]+$") #Username must be alphanumeric and can contain underscores
    password: str = Field(..., min_length=8, max_length=100, pattern="[A-Z]")
    email: EmailStr
    first_name: str = Field(..., min_length=2, max_length=30)
    last_name: str = Field(..., min_length=2, max_length=30)
    phone_number: str = Field(..., pattern=r"^\+?\d{9,15}$")

class GoogleUserCreate(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    google_id: str
    is_verified: bool = True

class User(BaseModel):
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

    class Config:
        orm_mode: True

class UserTokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

class UserResponse(BaseModel):
    user: User
    message: str = ""