from app.utils.app_instance import application
from app.api.endpoints import movies, auth, users
from app.exceptions import validation_exception_handler, http_exception_handler
from fastapi.exceptions import RequestValidationError
from fastapi import HTTPException
import app.services.scheduler

application.include_router(movies.router, prefix="/movies")
application.include_router(auth.router, prefix="/auth")
application.include_router(users.router, prefix="/users")
application.add_exception_handler(RequestValidationError, validation_exception_handler)
application.add_exception_handler(HTTPException, http_exception_handler)

@application.get("/")
async def read_root():
    return {"message": "Welcome to the MovieCompass App API!"}
