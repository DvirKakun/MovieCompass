from fastapi import APIRouter, Depends
import asyncio
import itertools
from app.schemas.user import User
from app.schemas.movie import MovieResponse 
from app.api.dependencies import get_current_user
from app.services.tmdb import fetch_movie_details, search_movies
from app.services.ollama import generate_movie_recommendations  
from app.services.user import add_movie_to_favorites, remove_movie_from_favorites

router = APIRouter()

@router.post("/users/me/recommendations", response_model=MovieResponse)
async def recommend_movies(current_user: User = Depends(get_current_user)): 
    favorite_movies = current_user.favorite_movies 

    favorite_movies_names = await asyncio.gather(*(fetch_movie_details(movie_id) for movie_id in favorite_movies))
    favorite_movies_names = [movie.title for movie in favorite_movies_names]

    recommendations = await generate_movie_recommendations(favorite_movies_names)
    match_movies = list(itertools.chain(*await asyncio.gather(*(search_movies(movie) for movie in recommendations))))

    return MovieResponse(movies=match_movies)


@router.put("/users/me/favorite/{movie_id}")
async def add_favorite_movie(movie_id: int, current_user: User = Depends(get_current_user)): 
    updated_favorite_movies = await add_movie_to_favorites(current_user, movie_id)    

    return {"message": "Movie added to favorites", "favorite_movies": updated_favorite_movies}

@router.delete("/users/me/favorite/{movie_id}")
async def remove_favorite_movie(movie_id: int, current_user: User = Depends(get_current_user)): 
    updated_favorite_movies = remove_movie_from_favorites(current_user, movie_id)    

    return {"message": "Movie removed from favorites", "favorite_movies": updated_favorite_movies}