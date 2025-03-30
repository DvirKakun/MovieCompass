from fastapi import APIRouter, Depends, BackgroundTasks, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from datetime import timedelta
from app.services.user import create_user, find_user_by_email, create_google_user, update_user, verify_user_email
from app.services.auth import authenticate_user, authenticate_email ,create_access_token, get_user_from_google
from app.services.email import send_verification_email
from app.schemas.user import UserCreate, GoogleUserCreate
from app.core.config import settings
from fastapi.templating import Jinja2Templates

ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

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
            user.is_verified = True
            
            user = update_user(user)
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/signup")
async def signup(user: UserCreate, background_tasks: BackgroundTasks):
    new_user = create_user(user)

    access_token_expires = timedelta(hours=1)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    verification_link = f"{settings.DEPLOYMENT_URL}/auth/verify-email?token={access_token}"
    background_tasks.add_task(send_verification_email, user.email, verification_link)

    return {"message": "User created. Please verify your email.", "user": new_user}

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password) 
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/verify-email")
async def verify_email(request: Request, token: str):
    user = authenticate_email(token)
    user = verify_user_email(user.email)
    
    return templates.TemplateResponse("verify_success.html", {"request": request})