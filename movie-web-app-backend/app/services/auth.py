from fastapi import HTTPException, status, BackgroundTasks
from app.schemas.user import User, UserTokenResponse, GoogleUserCreate, UserResponse
from app.services.user import get_user, find_user_by_email, create_google_user, update_user
from app.services.security import verify_password
from app.core.config import settings
from datetime import timedelta
from app.services.security import create_access_token, verify_token
from app.services.email import send_verification_email
import httpx

async def authenticate_google_user(code: str) -> UserTokenResponse:
    user_info = await get_user_from_google(code)
    
    # Extract relevant user details (e.g., email, name, sub is the Google unique user ID)
    email = user_info.get("email")
    google_id = user_info.get("sub")
    first_name = user_info.get("given_name")
    last_name = user_info.get("family_name")

    user = find_user_by_email(email)
    
    if not user:
        user = create_google_user(GoogleUserCreate(
            email=email,
            first_name=first_name,
            last_name=last_name,
            google_id=google_id,
        ))
    else:
        # Update user information if necessary
        if not user.google_id:
            user.first_name = first_name
            user.last_name = last_name
            user.google_id = google_id
            user.auth_provider = "both"
            user.is_verified = True
            
            user = update_user(user)
        
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return UserTokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

def authenticate_user(username: str, plain_password: str) -> UserTokenResponse:
    user = get_user(username)

    if not verify_password(plain_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"field":"username", "message": "Incorrect username or password"},
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"field": "verification" ,"message": "Please verify your email before logging in."}
        )
    
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return UserTokenResponse(user=user, access_token=access_token, token_type="bearer")

def authenticate_email(token: str) -> User:
    email = verify_token(token)
    user = get_user(email)

    if user is None:
        raise HTTPException(status_code=404, detail={"field": "username", "message" :"User not found"})
    
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
        raise HTTPException(status_code=400, detail={"field": "token", "message" :"Error retrieving access token"})

    access_token = token_json.get("access_token")
    
    userinfo_endpoint = settings.GOOGLE_USERINFO_ENDPOINT
    headers = {"Authorization": f"Bearer {access_token}"}
    
    async with httpx.AsyncClient() as client:
        userinfo_response = await client.get(userinfo_endpoint, headers=headers)
    
    user_info = userinfo_response.json()

    return user_info

def resend_verification_email(email: str, background_tasks: BackgroundTasks) -> UserResponse:
    user = find_user_by_email(email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "email", "message": "User not found"}
        )

    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"field": "email", "message": "Email already verified"}
        )

    token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(hours=1)
    )

    verification_link = f"{settings.DEPLOYMENT_URL}/auth/verify-email?token={token}"

    background_tasks.add_task(send_verification_email, user.email, verification_link)

    return UserResponse(message="Verification email has been resent.", user=user)