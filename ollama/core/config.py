from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    OLLAMA_SERVER_ENDPOINT: str
    MODEL_ID: str

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), "..", ".env")

settings = Settings()