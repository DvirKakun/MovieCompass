from pydantic import BaseModel
from typing import List, Optional


class Movie(BaseModel):
    id: int
    title: str
    overview: Optional[str] = None
    popularity: Optional[float] = None
    poster_path: Optional[str] = None
    vote_average: Optional[float] = None
    vote_count: Optional[int] = None
    genre_ids: Optional[List] = None
    genres: Optional[List] = None
    release_date: Optional[str] = None


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
    id: str
    author: str
    content: str
    created_at: str


class MovieReviewsResponse(BaseModel):
    movie_id: int
    reviews: List[MovieReview]
    total_results: int


class MovieTrailerResponse(BaseModel):
    movie_id: int
    title: Optional[str] = None
    embed_url: Optional[str] = None
