from fastapi import APIRouter, Depends, BackgroundTasks, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from app.services.user import create_user, verify_user_email, reset_user_password
from app.services.auth import (
    authenticate_user,
    authenticate_email,
    resend_verification_email,
    authenticate_google_user,
    forgot_password_handler,
    authenticate_user_reset_password,
)
from app.schemas.user import (
    UserCreate,
    UserTokenResponse,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.schemas.email import EmailRequest
from app.core.config import settings
from fastapi.templating import Jinja2Templates

ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")


@router.get("/google/login", response_class=RedirectResponse)
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


@router.get("/google/callback", response_model=UserTokenResponse)
async def google_callback(code: str):
    user_token_response = await authenticate_google_user(code)

    return user_token_response


@router.post("/signup", response_model=UserResponse)
async def signup(user: UserCreate, background_tasks: BackgroundTasks):
    new_user = create_user(user, background_tasks)

    return UserResponse(
        message="User created. Please verify your email.", user=new_user
    )


@router.post("/token", response_model=UserTokenResponse)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user_token_response = authenticate_user(form_data.username, form_data.password)

    return user_token_response


@router.get("/verify-email")
async def verify_email(request: Request, token: str):
    user = authenticate_email(token)
    user = verify_user_email(user.id, user.email)

    return templates.TemplateResponse("verify_success.html", {"request": request})


@router.post("/resend-verification", response_model=UserResponse)
async def resend_verification(request: EmailRequest, background_tasks: BackgroundTasks):
    user_response = resend_verification_email(request.email, background_tasks)

    return user_response


@router.post("/forgot-password", response_model=UserResponse)
def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    user_response = forgot_password_handler(request, background_tasks)

    return user_response


@router.post("/reset-password", response_model=UserResponse)
def reset_password(request: ResetPasswordRequest):
    user = authenticate_user_reset_password(request.token)
    user_response = reset_user_password(
        user, request.new_password, request.new_password_confirm
    )

    return user_response
