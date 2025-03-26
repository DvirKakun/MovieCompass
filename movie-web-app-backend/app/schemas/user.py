from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict
from app.schemas.comment import CommentEntry
from app.schemas.rating import RatingEntry

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=20, pattern="^[a-zA-Z0-9_]+$") #Username must be alphanumeric and can contain underscores
    password: str = Field(..., min_length=8, max_length=100, pattern="[A-Z]")
    email: EmailStr
    first_name: str = Field(..., min_length=2, max_length=30)
    last_name: str = Field(..., min_length=2, max_length=30)
    phone_number: str = Field(..., pattern=r"^\+?\d{9,15}$")

class User(BaseModel):
    username: str
    email : EmailStr
    first_name: str
    last_name : str
    phone_number: str
    hashed_password: str
    favorite_movies: List[int] = []
    watchlist: List[int] = []
    ratings: List[RatingEntry] = []
    comments: List[CommentEntry] = []

    class Config:
        orm_mode: True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None