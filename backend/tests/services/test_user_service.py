from uuid import uuid4
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import BackgroundTasks, HTTPException, status

import app.services.user as user_mod


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
class DummyUser(SimpleNamespace):
    """Mimics a real Pydantic User enough for tests."""

    def model_dump(self):
        return self.__dict__


def _dummy_user(**overrides) -> DummyUser:
    base = dict(
        id=str(uuid4()),
        username="john",
        email="john@example.com",
        first_name="John",
        last_name="Doe",
        phone_number="+111",
        hashed_password="hashed-password",
        is_verified=False,
        google_id=None,
        auth_provider="local",
        favorite_movies=[],
        watchlist=[],
        ratings=[],
    )
    base.update(overrides)
    return DummyUser(**base)


class DummyUserCreate:
    """Fake Pydantic UserCreate with .model_dump()."""

    def __init__(self, **kw):
        self._d = kw

    def model_dump(self):
        return self._d


# ---------------------------------------------------------------------------
# Patching common dependencies
# ---------------------------------------------------------------------------
@pytest.fixture(autouse=True)
def _patch_hash(monkeypatch):
    monkeypatch.setattr(user_mod, "get_password_hash", lambda p: f"hashed-{p}")
    monkeypatch.setattr(
        user_mod,
        "verify_password",
        lambda plain, hashed: hashed == f"hashed-{plain}",
    )


@pytest.fixture(autouse=True)
def _patch_users_collection(monkeypatch):
    mock_coll = MagicMock()
    monkeypatch.setattr(user_mod, "users_collection", mock_coll)
    return mock_coll


# ---------------------------------------------------------------------------
# get_user
# ---------------------------------------------------------------------------
def test_get_user_success(monkeypatch):
    dummy = _dummy_user()
    monkeypatch.setattr(user_mod, "find_user_by_username", lambda u: dummy)
    monkeypatch.setattr(user_mod, "find_user_by_email", lambda e: None)

    assert user_mod.get_user("john") is dummy


def test_get_user_not_found(monkeypatch):
    monkeypatch.setattr(user_mod, "find_user_by_username", lambda u: None)
    monkeypatch.setattr(user_mod, "find_user_by_email", lambda e: None)

    with pytest.raises(HTTPException) as exc:
        user_mod.get_user("missing")
    assert exc.value.status_code == status.HTTP_404_NOT_FOUND


# ---------------------------------------------------------------------------
# create_user
# ---------------------------------------------------------------------------
@patch.object(user_mod, "auth_email_create_token_and_send_email")
def test_create_user_success(mock_send_mail, _patch_users_collection):
    uc = DummyUserCreate(
        username="newbie",
        email="new@example.com",
        password="pw",
        confirm_password="pw",
    )
    with patch.object(
        user_mod, "find_user_by_username", return_value=None
    ), patch.object(user_mod, "find_user_by_email", return_value=None):
        created = user_mod.create_user(uc, BackgroundTasks())

    assert created.username == "newbie"
    _patch_users_collection.insert_one.assert_called_once()
    mock_send_mail.assert_called_once()


def test_create_user_password_mismatch():
    uc = DummyUserCreate(
        username="x",
        email="a@b",
        password="a",
        confirm_password="b",
    )
    with pytest.raises(HTTPException):
        user_mod.create_user(uc, BackgroundTasks())


def test_create_user_username_taken(monkeypatch):
    uc = DummyUserCreate(
        username="john",
        email="john2@example.com",
        password="pw",
        confirm_password="pw",
    )
    monkeypatch.setattr(user_mod, "find_user_by_username", lambda u: _dummy_user())
    monkeypatch.setattr(user_mod, "find_user_by_email", lambda e: None)

    with pytest.raises(HTTPException) as exc:
        user_mod.create_user(uc, BackgroundTasks())

    assert "Username already taken" in str(exc.value.detail)


# ---------------------------------------------------------------------------
# create_or_update_google_user  – happy-path when email not yet in DB
# ---------------------------------------------------------------------------
def test_create_or_update_google_user_creates_new(_patch_users_collection, monkeypatch):
    monkeypatch.setattr(user_mod, "find_user_by_email", lambda e: None)

    info = {
        "email": "google@example.com",  # local-part 'google' ≥ 3 chars
        "sub": "g123",
        "given_name": "Google",
        "family_name": "Tester",
    }
    user = user_mod.create_or_update_google_user(info)

    assert user.google_id == "g123"
    _patch_users_collection.insert_one.assert_called_once()


# ---------------------------------------------------------------------------
# add_movie_to_favorites
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_add_movie_to_favorites_success(monkeypatch, _patch_users_collection):
    u = _dummy_user(favorite_movies=[])
    monkeypatch.setattr(user_mod, "make_request", AsyncMock(return_value=200))
    _patch_users_collection.find_one_and_update.return_value = {
        "favorite_movies": [999]
    }

    assert await user_mod.add_movie_to_favorites(u, 999) == [999]


@pytest.mark.asyncio
async def test_add_movie_to_favorites_already_present():
    u = _dummy_user(favorite_movies=[999])
    with pytest.raises(HTTPException):
        await user_mod.add_movie_to_favorites(u, 999)


@pytest.mark.asyncio
async def test_add_movie_to_favorites_movie_not_found(monkeypatch):
    u = _dummy_user(favorite_movies=[])
    monkeypatch.setattr(
        user_mod,
        "make_request",
        AsyncMock(side_effect=HTTPException(status_code=404, detail="NF")),
    )

    with pytest.raises(HTTPException):
        await user_mod.add_movie_to_favorites(u, 999)
