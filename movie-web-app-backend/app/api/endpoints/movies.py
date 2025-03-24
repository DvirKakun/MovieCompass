from fastapi import APIRouter, Depends, status
from app.api.dependencies import get_current_user
from app.schemas.user import User
from app.schemas.movie import MovieResponse, Movie, MovieCastResponse
from app.schemas.genre import GenreResponse
from app.services.tmdb import fetch_movie_details, search_movies, fetch_movies_by_genre, fetch_popular_movies, fetch_movies_genres, fetch_movie_cast
from app.services.ollama import generate_movie_recommendations
from app.services.user import add_movie_to_favorites, remove_movie_from_favorites
import asyncio, itertools

router = APIRouter()


@router.get("/movies/popular", response_model=MovieResponse)
async def get_popular_movies():
    movies = await fetch_popular_movies()

    return MovieResponse(movies=movies)

@router.get("/movies/search", response_model=MovieResponse)
async def search_movie(query: str):
    movies = await search_movies(query)
    print(movies)

    return MovieResponse(movies=movies)

@router.get("/movies/genres", response_model=GenreResponse)
async def get_movies_genres():
    genres = await fetch_movies_genres()

    return GenreResponse(genres=genres)

@router.get("/movies/genre/{genre_id}", response_model=MovieResponse)
async def get_movies_by_genre(genre_id: int):
    movies = await fetch_movies_by_genre(genre_id)

    return MovieResponse(movies=movies)

@router.post("/movies/recommendations", response_model=MovieResponse)
async def recommend_movies(current_user: User = Depends(get_current_user)): 
    favorite_movies = current_user.favorite_movies 

    favorite_movies_names = await asyncio.gather(*(get_movie(movie_id) for movie_id in favorite_movies))
    favorite_movies_names = [movie.title for movie in favorite_movies_names]

    recommendations = await generate_movie_recommendations(favorite_movies_names)
    match_movies = list(itertools.chain(*await asyncio.gather(*(search_movies(movie) for movie in recommendations))))

    return MovieResponse(movies=match_movies)

@router.get("/movies/{movie_id}/cast", response_model=MovieCastResponse)
async def get_movie_cast(movie_id: int):
    cast = await fetch_movie_cast(movie_id)
    
    return cast

@router.get("/movies/{movie_id}", response_model=Movie)
async def get_movie(movie_id: int):
    movie = await fetch_movie_details(movie_id)

    return movie

@router.put("/movies/favorite/{movie_id}", status_code=status.HTTP_200_OK)
async def add_favorite_movie(movie_id: int, current_user: User = Depends(get_current_user)): 
    updated_favorite_movies = add_movie_to_favorites(current_user, movie_id)    

    return {"message": "Movie added to favorites", "favorite_movies": updated_favorite_movies}

@router.delete("/movies/favorite/{movie_id}", status_code=status.HTTP_200_OK)
async def remove_favorite_movie(movie_id: int, current_user: User = Depends(get_current_user)): 
    updated_favorite_movies = remove_movie_from_favorites(current_user, movie_id)    

    return {"message": "Movie removed from favorites", "favorite_movies": updated_favorite_movies}