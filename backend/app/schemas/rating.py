from pydantic import BaseModel, Extra

class RatingEntry(BaseModel):
    movie_id: int
    rating: int
