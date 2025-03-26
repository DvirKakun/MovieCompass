from pydantic import BaseModel
from typing import List

class CommentEntry(BaseModel):
    movie_id: int
    comments: List[str]