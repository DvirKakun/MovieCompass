from fastapi import APIRouter
from app.schemas.movie import MovieResponse, Movie, MovieCastResponse, MovieReviewsResponse
from app.schemas.genre import GenreResponse
from app.services.tmdb import fetch_movie_details, search_movies, fetch_movies_by_genre, fetch_popular_movies, fetch_movies_genres, fetch_movie_cast, fetch_movie_reviews

router = APIRouter()

@router.get("/popular", response_model=MovieResponse)
async def get_popular_movies():
    movies = await fetch_popular_movies()

    return MovieResponse(movies=movies)

@router.get("/search", response_model=MovieResponse)
async def search_movie(query: str):
    movies = await search_movies(query)
    print(movies)

    return MovieResponse(movies=movies)

@router.get("/genres", response_model=GenreResponse)
async def get_movies_genres():
    genres = await fetch_movies_genres()

    return GenreResponse(genres=genres)

@router.get("/genre/{genre_id}", response_model=MovieResponse)
async def get_movies_by_genre(genre_id: int):
    movies = await fetch_movies_by_genre(genre_id)

    return MovieResponse(movies=movies)

@router.get("/{movie_id}/cast", response_model=MovieCastResponse)
async def get_movie_cast(movie_id: int):
    cast = await fetch_movie_cast(movie_id)
    
    return cast

@router.get("/{movie_id}/reviews", response_model=MovieReviewsResponse)
async def get_movie_reviews(movie_id: int):
    reviews = await fetch_movie_reviews(movie_id)
    
    return reviews

@router.get("/{movie_id}", response_model=Movie)
async def get_movie(movie_id: int):
    movie = await fetch_movie_details(movie_id)

    return movie