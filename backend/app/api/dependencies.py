from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.schemas.user import User
from app.services.user import find_user_by_id  
from app.services.security import verify_user_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    user_id = verify_user_token(token)
    user = find_user_by_id(user_id)  # Fetch user from database

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"field": "verification" ,"message": "Please verify your email before logging in."}
        )

    return user  # Return user object