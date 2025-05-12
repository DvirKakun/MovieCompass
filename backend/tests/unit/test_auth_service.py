import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi import HTTPException, status
from datetime import timedelta

from app.schemas.user import User, UserTokenResponse, ForgotPasswordRequest
from app.services import auth as auth_svc
from app.core import config as config_mod
from app.services.security import pwd_context


########################
# Helpers / test data
########################

hashed = pwd_context.hash('secret')

FAKE_USER = User(
    id="u1",
    username="alice",
    email="alice@example.com",
    first_name="Alice",
    last_name="Liddell",
    phone_number="+972524334898",
    hashed_password=hashed,
    is_verified=True,
    favorite_movies=[],
    watchlist=[],
    ratings=[],
)

NOT_VERIFIED_USER = FAKE_USER.copy()
NOT_VERIFIED_USER.is_verified = False


def _token_payload(uid: str, new_email: str = None):
    payload = {"id": uid}
    if new_email:
        payload["new_email"] = new_email
    return payload


########################
# authenticate_user
########################
@patch("app.services.auth.create_access_token", return_value="jwt123")
@patch("app.services.auth.verify_password", return_value=True)
@patch("app.services.auth.get_user", return_value=FAKE_USER)
def test_authenticate_user_success(mock_get, mock_verify, mock_token):
    res: UserTokenResponse = auth_svc.authenticate_user("alice", "secret")

    mock_get.assert_called_once_with("alice")
    mock_verify.assert_called_once_with("secret", FAKE_USER.hashed_password)
    assert res.access_token == "jwt123"
    assert res.user.username == "alice"


@patch("app.services.auth.verify_password", return_value=False)
@patch("app.services.auth.get_user", return_value=FAKE_USER)
def test_authenticate_user_bad_password(mock_get, mock_verify):
    with pytest.raises(HTTPException) as exc:
        auth_svc.authenticate_user("alice", "wrong")
    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc.value.detail["field"] == "username"


@patch("app.services.auth.get_user", return_value=NOT_VERIFIED_USER)
def test_authenticate_user_not_verified(mock_get):
    with pytest.raises(HTTPException) as exc:
        auth_svc.authenticate_user("alice", "secret")
    assert exc.value.status_code == status.HTTP_403_FORBIDDEN
    assert exc.value.detail["field"] == "verification"


########################
# authenticate_email
########################
@patch("app.services.auth.find_user_by_id", return_value=FAKE_USER)
@patch("app.services.auth.verify_user_email_token",
       return_value=_token_payload("u1", "new@example.com"))
def test_authenticate_email_success(mock_verify, mock_find):
    user = auth_svc.authenticate_email("token123")

    mock_verify.assert_called_once_with("token123")
    assert user.email == "new@example.com"


@patch("app.services.auth.find_user_by_id", return_value=None)
@patch("app.services.auth.verify_user_email_token",
       return_value=_token_payload("bad"))
def test_authenticate_email_user_not_found(mock_verify, mock_find):
    with pytest.raises(HTTPException) as exc:
        auth_svc.authenticate_email("token123")
    assert exc.value.status_code == status.HTTP_404_NOT_FOUND


########################
# authenticate_user_reset_password
########################
@patch("app.services.auth.find_user_by_id", return_value=FAKE_USER)
@patch("app.services.auth.verify_user_token", return_value="u1")
def test_authenticate_reset_success(mock_v, mock_find):
    assert auth_svc.authenticate_user_reset_password("resetToken").id == "u1"


@patch("app.services.auth.find_user_by_id", return_value=None)
@patch("app.services.auth.verify_user_token", return_value="u1")
def test_authenticate_reset_user_missing(mock_v, mock_find):
    with pytest.raises(HTTPException) as exc:
        auth_svc.authenticate_user_reset_password("resetToken")
    assert exc.value.status_code == status.HTTP_404_NOT_FOUND


########################
# resend_verification_email
########################
@patch("app.services.auth.auth_email_create_token_and_send_email")
@patch("app.services.auth.find_user_by_email", return_value=NOT_VERIFIED_USER)
def test_resend_verification_ok(mock_find, mock_email, monkeypatch):
    bt = MagicMock()  # fake BackgroundTasks
    resp = auth_svc.resend_verification_email("alice@example.com", bt)

    mock_email.assert_called_once()
    assert resp.message.startswith("Verification email")


@patch("app.services.auth.find_user_by_email", return_value=None)
def test_resend_verification_user_missing(mock_find):
    with pytest.raises(HTTPException) as exc:
        auth_svc.resend_verification_email("no@example.com", MagicMock())
    assert exc.value.status_code == 404


@patch("app.services.auth.find_user_by_email", return_value=FAKE_USER)
def test_resend_verification_already_ok(mock_find):
    with pytest.raises(HTTPException):
        auth_svc.resend_verification_email("alice@example.com", MagicMock())


########################
# forgot_password_handler
########################
@patch("app.services.auth.forgot_password_create_token_and_send_email")
@patch("app.services.auth.find_user_by_email", return_value=FAKE_USER)
def test_forgot_password_ok(mock_find, mock_send):
    req = ForgotPasswordRequest(email="alice@example.com")
    resp = auth_svc.forgot_password_handler(req, MagicMock())

    mock_send.assert_called_once()
    assert resp.message.startswith("Password reset")


@patch("app.services.auth.find_user_by_email", return_value=None)
def test_forgot_password_user_missing(mock_find):
    req = ForgotPasswordRequest(email="none@x.com")
    with pytest.raises(HTTPException):
        auth_svc.forgot_password_handler(req, MagicMock())


########################
# get_user_from_google
########################
@pytest.mark.asyncio
async def test_get_user_from_google_success(monkeypatch):
    # Mock token endpoint response
    token_json = {"access_token": "tok123"}
    async_post = AsyncMock(return_value=MagicMock(json=lambda: token_json))
    async_get = AsyncMock(return_value=MagicMock(json=lambda: {"email": "alice@gmail"}))
    monkeypatch.setattr(auth_svc.httpx, "AsyncClient", lambda: MagicMock(
        __aenter__=AsyncMock(return_value=MagicMock(post=async_post, get=async_get)),
        __aexit__=AsyncMock(return_value=None),
    ))

    info = await auth_svc.get_user_from_google("authcode")
    assert info["email"] == "alice@gmail"


@pytest.mark.asyncio
async def test_get_user_from_google_token_error(monkeypatch):
    token_json = {"error": "bad_code"}
    async_post = AsyncMock(return_value=MagicMock(json=lambda: token_json))
    monkeypatch.setattr(auth_svc.httpx, "AsyncClient", lambda: MagicMock(
        __aenter__=AsyncMock(return_value=MagicMock(post=async_post)),
        __aexit__=AsyncMock(return_value=None),
    ))

    with pytest.raises(HTTPException) as exc:
        await auth_svc.get_user_from_google("badcode")
    assert exc.value.status_code == 400
