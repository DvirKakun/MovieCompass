from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from jose import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from app.services.user import create_user
from app.services.auth import authenticate_user, create_access_token
from app.schemas.user import UserCreate, User, Token
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

# @router.get("/google/callback")
# async def google_callback(code: str):
#     # Prepare the payload to exchange code for an access token
#     data = {
#         "code": code,
#         "client_id": settings.GOOGLE_CLIENT_ID,
#         "client_secret": settings.GOOGLE_CLIENT_SECRET,
#         "redirect_uri": settings.GOOGLE_REDIRECT_URI,
#         "grant_type": "authorization_code"
#     }
    
#     async with httpx.AsyncClient() as client:
#         token_response = await client.post(settings.GOOGLE_TOKEN_ENDPOINT, data=data)
    
#     token_json = token_response.json()

#     if "error" in token_json:
#         raise HTTPException(status_code=400, detail="Error retrieving access token")

#     access_token = token_json.get("access_token")
    
#     # Use the access token to retrieve the user profile information
#     userinfo_endpoint = "https://www.googleapis.com/oauth2/v3/userinfo"
#     headers = {"Authorization": f"Bearer {access_token}"}
    
#     async with httpx.AsyncClient() as client:
#         userinfo_response = await client.get(userinfo_endpoint, headers=headers)
    
#     user_info = userinfo_response.json()
    
#     # Extract relevant user details (e.g., email, name, sub is the Google unique user ID)
#     email = user_info.get("email")
#     google_id = user_info.get("sub")
#     first_name = user_info.get("given_name")
#     last_name = user_info.get("family_name")
    
#     # Here, implement your logic to check if the user exists.
#     # If not, create a new user in your database with these details.
#     # For example:
#     #
#     # user = get_user_by_email(email)
#     # if not user:
#     #     user = create_user({
#     #         "email": email,
#     #         "google_id": google_id,
#     #         "first_name": first_name,
#     #         "last_name": last_name,
#     #         "auth_provider": "google",
#     #         "profile_picture": profile_picture,
#     #         # 'hashed_password' can be left as None
#     #     })
#     # else:
#     #     # Optionally, update existing user details if necessary
#     #     pass

#     # Finally, generate a session token or JWT for the authenticated user
#     return {"message": "User successfully authenticated", "user": user_info}

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

    return {"access_token": access_token, "token_type": "bearer"}