from pydantic import BaseModel, Extra
from typing import List

class Genre(BaseModel):
    id: int
    name: str

class GenreResponse(BaseModel):
    genres: List[Genre]