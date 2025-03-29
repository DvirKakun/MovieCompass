from fastapi import HTTPException
import httpx
from app.core.config import settings
from app.schemas.movie import Movie, MovieCast, MovieCastResponse, MovieReview, MovieReviewsResponse
from app.schemas.genre import Genre
import aiohttp
import asyncio

async def fetch_popular_movies():
    url = f"{settings.BASE_URL}/movie/popular?api_key={settings.TMDB_API_KEY}&language=en-US"
    movies_data = await make_request(url)
    movies = [Movie(**movie) for movie in movies_data.get("results", [])]
            
    return movies  


async def search_movies(query: str):
    url = f"{settings.BASE_URL}/search/movie?api_key={settings.TMDB_API_KEY}&query={query}&language=en-US"
    movies_data = await make_request(url)
    movies = [Movie(**movie) for movie in movies_data.get("results", [])]

    return movies

async def fetch_movies_genres():
    url = f"{settings.BASE_URL}/genre/movie/list?api_key={settings.TMDB_API_KEY}&language=en-US"
    genres_data = await make_request(url)
    genres = [Genre(**genre) for genre in genres_data.get("genres", [])]

    return genres

async def fetch_movies_by_genre(genre_id: int):
    url = f"{settings.BASE_URL}/discover/movie?api_key={settings.TMDB_API_KEY}&with_genres={genre_id}"
    movies_data = await make_request(url)
    movies = [Movie(**movie) for movie in movies_data.get("results", [])]

    return movies

async def fetch_movie_details(movie_id: int):
    url = f"{settings.BASE_URL}/movie/{movie_id}?api_key={settings.TMDB_API_KEY}&language=en-US"
    movie_data = await make_request(url)

    return Movie(**movie_data)

async def fetch_movie_cast(movie_id: int) -> MovieCastResponse:
    url = f"{settings.BASE_URL}/movie/{movie_id}/credits?api_key={settings.TMDB_API_KEY}"
    cast_data = await make_request(url)
    cast = [MovieCast(id=actor["id"], name=actor["name"], character=actor["character"], profile_path=actor.get("profile_path")) for actor in cast_data["cast"]]
    
    return MovieCastResponse(movie_id=movie_id, cast=cast)

async def fetch_reviews(movie_id, page):
    url = f"{settings.BASE_URL}/movie/{movie_id}/reviews?api_key={settings.TMDB_API_KEY}&language=en-US&page={page}"

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()

async def fetch_movie_reviews(movie_id: int):
    first_page_reviews = await fetch_reviews(movie_id, 1)    
    total_pages = first_page_reviews.get("total_pages", 0)
    total_results = first_page_reviews.get("total_results", 0)

    tasks = [fetch_reviews(movie_id, page) for page in range(2, total_pages + 1)]
    results = await asyncio.gather(*tasks)
    reviews_data = [first_page_reviews] + results

    reviews = [
        MovieReview(author=review["author"], content=review["content"], created_at=review["created_at"])
        for page in reviews_data  
        for review in page.get("results", [])
        ]

    return MovieReviewsResponse(movie_id=movie_id, reviews=reviews, total_results=total_results)
        
async def make_request(url: str, method: str = "GET"):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()

            if method == "HEAD":
                return response.status_code
            
            return response.json()  
        
    except httpx.HTTPStatusError as e:
        error_details = e.response.json()
        status_code = error_details.get("status_code", e.response.status_code)
        status_message = error_details.get("status_message", "Unknown error")
        raise HTTPException(status_code=e.response.status_code, detail={"status_code": status_code, "status_message": status_message})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))