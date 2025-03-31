from app.utils.app_instance import application
from app.api.endpoints import movies, auth, users
import app.services.scheduler

application.include_router(movies.router, prefix="/movies")
application.include_router(auth.router, prefix="/auth")
application.include_router(users.router, prefix="/users")

@application.get("/")
async def read_root():
    return {"message": "Welcome to the MovieCompass App API!"}
