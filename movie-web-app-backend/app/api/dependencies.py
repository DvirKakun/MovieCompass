from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.schemas.user import User
from app.services.user import get_user  
from app.services.security import verify_user_login_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    username = verify_user_login_token(token)
    user = get_user(username)  # Fetch user from database

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"field": "verification" ,"message": "Please verify your email before logging in."}
        )

    return user  # Return user object