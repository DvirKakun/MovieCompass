from fastapi import HTTPException, status, BackgroundTasks
from app.schemas.user import (
    User,
    UserTokenResponse,
    UserResponse,
    ForgotPasswordRequest,
)
from app.services.user import (
    get_user,
    find_user_by_email,
    create_or_update_google_user,
    find_user_by_id,
)
from app.services.email import (
    auth_email_create_token_and_send_email,
    forgot_password_create_token_and_send_email,
)
from app.core.config import settings
from datetime import timedelta
from app.services.security import (
    create_access_token,
    verify_user_email_token,
    verify_password,
    verify_user_token,
)
import httpx


async def authenticate_google_user(code: str) -> UserTokenResponse:
    user_info = await get_user_from_google(code)
    user = create_or_update_google_user(user_info)

    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return UserTokenResponse(access_token=access_token, token_type="bearer", user=user)


def authenticate_user(username: str, plain_password: str) -> UserTokenResponse:
    user = get_user(username)

    if not verify_password(plain_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"field": "username", "message": "Incorrect username or password"},
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "field": "verification",
                "message": "Please verify your email before logging in.",
            },
        )

    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return UserTokenResponse(user=user, access_token=access_token, token_type="bearer")


def authenticate_email(token: str) -> User:
    data = verify_user_email_token(token)
    user_id = data.get("id")
    verified_email = data.get("new_email")

    user = find_user_by_id(user_id)

    if user is None:
        raise HTTPException(
            status_code=404, detail={"field": "username", "message": "User not found"}
        )

    user.email = verified_email

    return user


def authenticate_user_reset_password(token: str) -> User:
    user_id = verify_user_token(token)
    user = find_user_by_id(user_id)

    if user is None:
        raise HTTPException(
            status_code=404, detail={"field": "username", "message": "User not found"}
        )

    return user


async def get_user_from_google(code: str):
    # Prepare the payload to exchange code for an access token
    data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient() as client:
        token_response = await client.post(settings.GOOGLE_TOKEN_ENDPOINT, data=data)

    token_json = token_response.json()

    if "error" in token_json:
        raise HTTPException(
            status_code=400,
            detail={"field": "token", "message": "Error retrieving access token"},
        )

    access_token = token_json.get("access_token")

    userinfo_endpoint = settings.GOOGLE_USERINFO_ENDPOINT
    headers = {"Authorization": f"Bearer {access_token}"}

    async with httpx.AsyncClient() as client:
        userinfo_response = await client.get(userinfo_endpoint, headers=headers)

    user_info = userinfo_response.json()

    return user_info


def resend_verification_email(
    email: str, background_tasks: BackgroundTasks
) -> UserResponse:
    user = find_user_by_email(email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "email", "message": "User not found"},
        )

    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"field": "email", "message": "Email already verified"},
        )

    auth_email_create_token_and_send_email(user.id, user.email, background_tasks)

    return UserResponse(message="Verification email has been resent.", user=user)


def forgot_password_handler(
    request: ForgotPasswordRequest, background_tasks: BackgroundTasks
) -> UserResponse:
    email = request.email
    existing_user = find_user_by_email(email)

    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    forgot_password_create_token_and_send_email(
        existing_user.id, existing_user.email, background_tasks
    )

    return UserResponse(
        message="Password reset email has been sent", user=existing_user
    )
