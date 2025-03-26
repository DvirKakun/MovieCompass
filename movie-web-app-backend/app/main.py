from fastapi import FastAPI
from app.api.endpoints import movies, auth, users

app = FastAPI()

app.include_router(movies.router)
app.include_router(auth.router)
app.include_router(users.router)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the MovieCompass App API!"}
