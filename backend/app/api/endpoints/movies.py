from fastapi import APIRouter, Query
from app.schemas.movie import (
    MovieResponse,
    Movie,
    MovieCastResponse,
    MovieReviewsResponse,
    MovieTrailerResponse,
)
from app.schemas.genre import GenreResponse
from app.services.tmdb import (
    fetch_multiple_movies_details,
    search_movies,
    fetch_movies_by_genre,
    fetch_popular_movies,
    fetch_movies_genres,
    fetch_movie_cast,
    fetch_movie_reviews,
    fetch_movie_trailer,
)
from typing import List

router = APIRouter()


@router.get("/popular", response_model=MovieResponse)
async def get_popular_movies(
    page: int = Query(1, ge=1, description="Page number for pagination")
):
    movies = await fetch_popular_movies(page)

    return MovieResponse(movies=movies)


@router.get("/search", response_model=MovieResponse)
async def search_movie(
    query: str,
    page: int = Query(1, ge=1, description="Page number for pagination"),
    genre: int = Query(None, description="Filter by genre ID"),
    min_rating: float = Query(None, ge=0, le=10, description="Minimum rating"),
    max_rating: float = Query(None, ge=0, le=10, description="Maximum rating"),
    min_year: int = Query(None, ge=1900, description="Minimum release year"),
    max_year: int = Query(None, description="Maximum release year"),
):
    """
    Search movies with optional filters
    """

    movies = await search_movies(
        query=query,
        page=page,
    )

    return MovieResponse(movies=movies)


@router.get("/genres", response_model=GenreResponse)
async def get_movies_genres():
    genres = await fetch_movies_genres()

    return GenreResponse(genres=genres)


@router.get("/genre/{genre_id}", response_model=MovieResponse)
async def get_movies_by_genre(
    genre_id: int, page: int = Query(1, ge=1, description="Page number for pagination")
):
    movies = await fetch_movies_by_genre(genre_id, page)

    return MovieResponse(movies=movies)


@router.get("/{movie_id}/cast", response_model=MovieCastResponse)
async def get_movie_cast(movie_id: int):
    cast = await fetch_movie_cast(movie_id)

    return cast


@router.get("/{movie_id}/reviews", response_model=MovieReviewsResponse)
async def get_movie_reviews(
    movie_id: int, page: int = Query(1, ge=1, description="Page number for pagination")
):
    reviews = await fetch_movie_reviews(movie_id, page)

    return reviews


@router.get("/{movie_id}/trailer", response_model=MovieTrailerResponse)
async def get_movie_trailer(movie_id: int):
    trailer = await fetch_movie_trailer(movie_id)

    return trailer


# @router.get("/{movie_id}", response_model=Movie)
# async def get_movie(movie_id: int):
#     movie = await fetch_movie_details(movie_id)

#     return movie


@router.get("/", response_model=List[Movie])
async def get_movies_by_ids(
    ids: List[int] = Query(..., description="List of TMDB movie IDs")
):
    movies = await fetch_multiple_movies_details(ids)

    return movies
