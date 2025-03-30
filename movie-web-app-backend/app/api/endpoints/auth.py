from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from datetime import timedelta
from app.services.user import create_user, find_user_by_email, create_google_user, update_user_by_google
from app.services.auth import authenticate_user, create_access_token, get_user_from_google
from app.schemas.user import UserCreate, User, Token, GoogleUserCreate
from app.core.config import settings

ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

@router.get("/google/login")
async def google_login():
    scope = "openid email profile"
    # Construct the URL with required query parameters
    url = (
        f"{settings.GOOGLE_AUTHORIZATION_ENDPOINT}?response_type=code"
        f"&client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
        f"&scope={scope}"
        f"&access_type=offline"
    )

    return RedirectResponse(url)

@router.get("/google/callback")
async def google_callback(code: str):
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
            
            user = update_user_by_google(user)
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/signup", response_model=User)
async def signup(user: UserCreate):
    new_user = create_user(user)

    return new_user

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password) 
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer", "user": user}