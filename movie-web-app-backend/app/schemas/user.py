from pydantic import BaseModel, EmailStr, Field, Extra
from typing import Optional, List
from app.schemas.rating import RatingEntry
from datetime import datetime, timezone
from uuid import uuid4

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=20, pattern="^[a-zA-Z0-9_]+$") #Username must be alphanumeric and can contain underscores
    password: str = Field(..., min_length=8, max_length=100, pattern="[A-Z]")
    email: EmailStr
    first_name: str = Field(..., min_length=2, max_length=30)
    last_name: str = Field(..., min_length=2, max_length=30)
    phone_number: str = Field(..., pattern=r"^\+?\d{9,15}$")
    
    class Config:
        extra = Extra.forbid  

class GoogleUserCreate(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    google_id: str
    is_verified: bool = True

    class Config:
        extra = Extra.forbid  

class UpdateUserProfile(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=20, pattern="^[a-zA-Z0-9_]+$")
    old_password: Optional[str] = Field(None, min_length=8, max_length=100)
    new_password: Optional[str] = Field(None, min_length=8, max_length=100, pattern="[A-Z]")
    new_password_confirm: Optional[str] = Field(None, min_length=8, max_length=100)
    first_name: Optional[str] = Field(None, min_length=2, max_length=30)
    last_name: Optional[str] = Field(None, min_length=2, max_length=30)
    phone_number: Optional[str] = Field(None, pattern=r"^\+?\d{9,15}$")
    new_email: Optional[EmailStr] = None

    class Config:
        extra = Extra.forbid  

class User(BaseModel):
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

    class Config:
        orm_mode: True
        validate_by_name = True

class UserTokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

class UserResponse(BaseModel):
    user: User
    message: str = ""