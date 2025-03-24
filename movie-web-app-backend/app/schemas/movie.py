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
