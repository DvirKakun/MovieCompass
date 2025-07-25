from app.core.config import settings
from app.schemas.movie import (
    Movie,
    MovieCast,
    MovieCastResponse,
    MovieReview,
    MovieReviewsResponse,
    MovieTrailerResponse,
)
from app.schemas.genre import Genre
import aiohttp
import asyncio
from fastapi import HTTPException
from .tmdb_constants import tmdb_to_http_map
from typing import List


async def fetch_popular_movies(page: int = 1):
    url = f"{settings.BASE_URL}/movie/popular?api_key={settings.TMDB_API_KEY}&language=en-US&page={page}"
    movies_data = await make_request(url)
    movies = [Movie(**movie) for movie in movies_data.get("results", [])]

    return movies


async def search_movies(query: str, page: int = 1):
    url = f"{settings.BASE_URL}/search/movie?api_key={settings.TMDB_API_KEY}&query={query}&language=en-US&page={page}"
    movies_data = await make_request(url)
    movies = [Movie(**movie) for movie in movies_data.get("results", [])]

    return movies


async def fetch_movies_genres():
    url = f"{settings.BASE_URL}/genre/movie/list?api_key={settings.TMDB_API_KEY}&language=en-US"
    genres_data = await make_request(url)
    genres = [Genre(**genre) for genre in genres_data.get("genres", [])]

    return genres


async def fetch_movies_by_genre(genre_id: int, page: int = 1):
    url = f"{settings.BASE_URL}/discover/movie?api_key={settings.TMDB_API_KEY}&with_genres={genre_id}&page={page}"
    movies_data = await make_request(url)
    movies = [Movie(**movie) for movie in movies_data.get("results", [])]

    return movies


async def fetch_multiple_movies_details(movie_ids: List[int]) -> List[Movie]:
    tasks = [fetch_movie_details(movie_id) for movie_id in movie_ids]
    movies = await asyncio.gather(*tasks, return_exceptions=True)

    return [movie for movie in movies if isinstance(movie, Movie)]


async def fetch_movie_details(movie_id: int):
    url = f"{settings.BASE_URL}/movie/{movie_id}?api_key={settings.TMDB_API_KEY}&language=en-US"
    movie_data = await make_request(url)

    return Movie(**movie_data)


async def fetch_movie_cast(movie_id: int) -> MovieCastResponse:
    url = (
        f"{settings.BASE_URL}/movie/{movie_id}/credits?api_key={settings.TMDB_API_KEY}"
    )
    cast_data = await make_request(url)
    cast = [
        MovieCast(
            id=actor.get("id"),
            name=actor.get("name"),
            character=actor.get("character"),
            profile_path=actor.get("profile_path"),
        )
        for actor in cast_data["cast"]
    ]

    return MovieCastResponse(movie_id=movie_id, cast=cast)


async def fetch_movie_reviews(movie_id: int, page: int = 1):
    url = f"{settings.BASE_URL}/movie/{movie_id}/reviews?api_key={settings.TMDB_API_KEY}&language=en-US&page={page}"

    response = await make_request(url, "GET")

    reviews = [
        MovieReview(
            id=review.get("id"),
            author=review.get("author"),
            content=review.get("content"),
            created_at=review.get("created_at"),
        )
        for review in response.get("results", [])
    ]

    return MovieReviewsResponse(
        movie_id=movie_id,
        reviews=reviews,
        total_results=response.get("total_results", 0),
    )


async def fetch_movie_trailer(movie_id: int) -> MovieTrailerResponse:
    url = (
        f"{settings.BASE_URL}/movie/{movie_id}/videos"
        f"?api_key={settings.TMDB_API_KEY}&language=en-US"
    )
    trailers_data = await make_request(url)

    videos = trailers_data.get("results", [])

    yt_trailers = [
        video
        for video in videos
        if video.get("site") == "YouTube" and video.get("type") == "Trailer"
    ]

    yt_trailers.sort(
        key=lambda video: (
            not video.get("official", False),  # official first
            -(video.get("size") or 0),  # bigger resolution first
        )
    )

    trailer = yt_trailers[0] if yt_trailers else None

    return MovieTrailerResponse(
        movie_id=movie_id,
        title=trailer.get("name") if trailer else None,
        embed_url=(
            f"https://www.youtube.com/embed/{trailer['key']}" if trailer else None
        ),
    )


async def make_request(url: str, method: str = "GET"):
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url) as response:
                if response.status >= 400:
                    try:
                        error_data = await response.json()
                        tmdb_code = error_data.get("status_code", response.status)
                        status_message = error_data.get(
                            "status_message", "Unknown error"
                        )

                        http_status = tmdb_to_http_map.get(tmdb_code, response.status)

                        raise HTTPException(
                            status_code=http_status, detail=status_message
                        )
                    except aiohttp.ContentTypeError:
                        raise HTTPException(
                            status_code=response.status, detail="Unknown error"
                        )

                if method == "HEAD":
                    return response.status

                return await response.json()

        except aiohttp.ClientConnectionError as e:
            raise HTTPException(status_code=503, detail=f"Connection error: {e}")
