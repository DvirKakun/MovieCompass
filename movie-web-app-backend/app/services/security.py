from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt, JWTError
from fastapi import HTTPException, status
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    return encoded_jwt

def verify_user_login_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")

        if not username:
            raise HTTPException(status_code=400, detail={"field": "token", "message": "Invalid token payload"})
    except JWTError:
        raise HTTPException(status_code=400, detail={"field": "token", "message": "Invalid or expired token"})
    
    return username


def verify_user_email_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        new_email = payload.get("new_email")
        

        if not username or not new_email:
            raise HTTPException(status_code=400, detail={"field": "token", "message": "Invalid token payload"})
        
        data = {"username": username, "new_email" : new_email}

    except JWTError:
        raise HTTPException(status_code=400, detail={"field": "token", "message": "Invalid or expired token"})
    
    return data