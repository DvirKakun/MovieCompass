import pytest
from datetime import datetime, timedelta, timezone

from jose import jwt
from fastapi import HTTPException

from app.services import security


# ---------------------------------------------------------------------------
# Fixtures: override SECRET_KEY / ALGORITHM for deterministic tests
# ---------------------------------------------------------------------------
@pytest.fixture(autouse=True)
def _override_settings(monkeypatch):
    monkeypatch.setattr(
        security.settings, "SECRET_KEY", "unit-test-secret", raising=False
    )
    monkeypatch.setattr(security.settings, "ALGORITHM", "HS256", raising=False)


# ---------------------------------------------------------------------------
# Password hashing helpers
# ---------------------------------------------------------------------------
def test_password_hash_and_verify_success():
    password = "S0m3$ecret!"
    hashed = security.get_password_hash(password)

    assert hashed != password
    assert security.verify_password(password, hashed) is True


def test_verify_password_failure():
    password = "CorrectHorseBatteryStaple"
    hashed = security.get_password_hash(password)

    assert security.verify_password("wrong password", hashed) is False


# ---------------------------------------------------------------------------
# create_access_token + verify_user_token
# ---------------------------------------------------------------------------
def test_create_access_token_contains_sub_and_exp():
    token = security.create_access_token(
        {"sub": "user123"}, expires_delta=timedelta(minutes=10)
    )

    payload = jwt.decode(token, "unit-test-secret", algorithms=["HS256"])
    assert payload["sub"] == "user123"
    assert "exp" in payload
    # exp must be in the future (allow 5 s clock skew)
    assert datetime.fromtimestamp(payload["exp"], timezone.utc) > datetime.now(
        timezone.utc
    ) - timedelta(seconds=5)


def test_verify_user_token_happy_path():
    plain = {"sub": "abc", "exp": datetime.now(timezone.utc) + timedelta(minutes=1)}
    token = jwt.encode(plain, "unit-test-secret", algorithm="HS256")

    assert security.verify_user_token(token) == "abc"


def test_verify_user_token_expired_raises():
    expired = {"sub": "abc", "exp": datetime.now(timezone.utc) - timedelta(minutes=1)}
    token = jwt.encode(expired, "unit-test-secret", algorithm="HS256")

    with pytest.raises(HTTPException) as exc:
        security.verify_user_token(token)

    assert exc.value.status_code == 400
    assert "Invalid or expired token" in str(exc.value.detail)


def test_verify_user_token_missing_sub_raises():
    bad = {"exp": datetime.now(timezone.utc) + timedelta(minutes=1)}
    token = jwt.encode(bad, "unit-test-secret", algorithm="HS256")

    with pytest.raises(HTTPException) as exc:
        security.verify_user_token(token)

    assert exc.value.status_code == 400
    assert "Invalid token payload" in str(exc.value.detail)


# ---------------------------------------------------------------------------
# verify_user_email_token
# ---------------------------------------------------------------------------
def test_verify_user_email_token_success():
    data = {
        "sub": "userX",
        "new_email": "new@example.com",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=1),
    }
    token = jwt.encode(data, "unit-test-secret", algorithm="HS256")

    result = security.verify_user_email_token(token)
    assert result == {"id": "userX", "new_email": "new@example.com"}


def test_verify_user_email_token_missing_email_raises():
    bad = {
        "sub": "userX",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=1),
    }
    token = jwt.encode(bad, "unit-test-secret", algorithm="HS256")

    with pytest.raises(HTTPException) as exc:
        security.verify_user_email_token(token)

    assert exc.value.status_code == 400
    assert "Invalid token payload" in str(exc.value.detail)
