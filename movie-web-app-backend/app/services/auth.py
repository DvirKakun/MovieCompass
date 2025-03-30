from fastapi import HTTPException, status
from app.schemas.user import User
from app.services.user import get_user
from app.services.security import verify_password
from app.core.config import settings
from jose import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
import httpx

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt

def authenticate_user(username: str, plain_password: str) -> User:
    user = get_user(username)

    if not verify_password(plain_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user 

async def get_user_from_google(code: str):
    # Prepare the payload to exchange code for an access token
    data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }

    async with httpx.AsyncClient() as client:
        token_response = await client.post(settings.GOOGLE_TOKEN_ENDPOINT, data=data)
    
    token_json = token_response.json()

    if "error" in token_json:
        raise HTTPException(status_code=400, detail="Error retrieving access token")

    access_token = token_json.get("access_token")
    
    userinfo_endpoint = settings.GOOGLE_USERINFO_ENDPOINT
    headers = {"Authorization": f"Bearer {access_token}"}
    
    async with httpx.AsyncClient() as client:
        userinfo_response = await client.get(userinfo_endpoint, headers=headers)
    
    user_info = userinfo_response.json()

    return user_info