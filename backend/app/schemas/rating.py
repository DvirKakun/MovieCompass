from pydantic import BaseModel

class RatingEntry(BaseModel):
    movie_id: int
    rating: int
