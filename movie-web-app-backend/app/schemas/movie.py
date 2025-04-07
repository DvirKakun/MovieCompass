from pydantic import BaseModel, Extra
from typing import List, Optional


class Movie(BaseModel):
    id: int
    title: str
    overview: Optional[str] = None
    popularity: Optional[float] = None
    poster_path: Optional[str] = None
    vote_average: Optional[float] = None
    vote_count: Optional[int] = None

    class Config:
        extra = Extra.forbid 

class MovieResponse(BaseModel):
    movies: List[Movie]

    class Config:
        extra = Extra.forbid 

class MovieCast(BaseModel):
    id: int
    name: str
    character: str
    profile_path: Optional[str] = None

    class Config:
        extra = Extra.forbid 

class MovieCastResponse(BaseModel):
    movie_id: int
    cast: List[MovieCast]

    class Config:
        extra = Extra.forbid 

class MovieReview(BaseModel):
    author: str
    content: str
    created_at: str

    class Config:
        extra = Extra.forbid 

class MovieReviewsResponse(BaseModel):
    movie_id: int
    reviews: List[MovieReview]
    total_results: int

    class Config:
        extra = Extra.forbid 
