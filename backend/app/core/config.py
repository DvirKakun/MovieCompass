from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    TMDB_API_KEY: str
    BASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    EMAIL_ACCESS_TOKEN_EXPIRE_HOURS: int
    MONGO_CONNECTION_STRING: str
    MONGO_DATABASE_NAME: str
    MONGO_COLLECTION_NAME: str
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str
    GOOGLE_AUTHORIZATION_ENDPOINT: str
    GOOGLE_TOKEN_ENDPOINT: str
    GOOGLE_USERINFO_ENDPOINT: str
    EMAIL_FROM: str
    EMAIL_USERNAME: str
    EMAIL_PASSWORD: str
    SMTP_SERVER: str
    SMTP_PORT: int
    MODEL_ID: str
    OLLAMA_SERVER_ENDPOINT: str
    FRONTEND_URL: str

    class Config:
        env_file = ".env"


settings = Settings()
