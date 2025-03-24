from typing import List
from fastapi import APIRouter, HTTPException
from app.schemas.movie import MovieResponse, Movie, MovieCastResponse
from app.schemas.genre import GenreResponse
from app.services.tmdb import fetch_movie_details, search_movies, fetch_movies_by_genre, fetch_popular_movies, fetch_movies_genres, fetch_movie_cast
from app.services.ollama import generate_movie_recommendations

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
async def recommend_movies(favorite_movies: List[str]): 
    recommendations = await generate_movie_recommendations(favorite_movies)
    match_movies = []

    for movie in recommendations:
        match_movies.extend(await search_movies(movie)) 
    
    return MovieResponse(movies=match_movies)

@router.get("/movies/{movie_id}/cast", response_model=MovieCastResponse)
async def get_movie_cast(movie_id: int):
    cast = await fetch_movie_cast(movie_id)
    
    return cast

@router.get("/movies/{movie_id}", response_model=Movie)
async def get_movie(movie_id: int):
    movie = await fetch_movie_details(movie_id)

    return movie