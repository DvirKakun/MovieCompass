# Contents of /movie-web-app-backend/movie-web-app-backend/app/api/__init__.py

from fastapi import APIRouter

router = APIRouter()

from .endpoints import movies  # Importing movie-related endpoints

router.include_router(movies.router, prefix="/movies", tags=["movies"])