from pydantic import BaseModel
from typing import List, Optional


class Movie(BaseModel):
    id: int
    title: str
    overview: str
    popularity: float
    poster_path: Optional[str] = None
    vote_average: float
    vote_count: int

class MovieResponse(BaseModel):
    movies: List[Movie]

class MovieCast(BaseModel):
    id: int
    name: str
    character: str
    profile_path: Optional[str] = None

class MovieCastResponse(BaseModel):
    movie_id: int
    cast: List[MovieCast]

class MovieReview(BaseModel):
    author: str
    content: str
    created_at: str

class MovieReviewsResponse(BaseModel):
    movie_id: int
    reviews: List[MovieReview]
    total_results: int
