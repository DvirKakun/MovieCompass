from fastapi import FastAPI
from app.api.endpoints import movies, auth, users

app = FastAPI()

app.include_router(movies.router, prefix="/movies")
app.include_router(auth.router, prefix="/auth")
app.include_router(users.router, prefix="/users")

@app.get("/")
async def read_root():
    return {"message": "Welcome to the MovieCompass App API!"}
