# tests/services/test_tmdb_service.py
import asyncio
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException

import app.services.tmdb as tmdb_mod


# ---------------------------------------------------------------------------
# Helper dummy classes so we don’t depend on the real Pydantic schemas
# ---------------------------------------------------------------------------
class DummyMovie(dict):
    """Acts like a simple Movie object for isinstance checks"""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.__dict__.update(kwargs)


class DummyGenre(dict):
    pass


class DummyCast(dict):
    pass


# ---------------------------------------------------------------------------
# Auto-patch Pydantic models so we can treat them as simple dicts
# ---------------------------------------------------------------------------
@pytest.fixture(autouse=True)
def _patch_schema_classes(monkeypatch):
    monkeypatch.setattr(tmdb_mod, "Movie", DummyMovie, raising=False)
    monkeypatch.setattr(tmdb_mod, "Genre", DummyGenre, raising=False)
    monkeypatch.setattr(tmdb_mod, "MovieCast", DummyCast, raising=False)
    monkeypatch.setattr(tmdb_mod, "MovieCastResponse", lambda **kw: kw, raising=False)
    monkeypatch.setattr(tmdb_mod, "MovieReview", lambda **kw: kw, raising=False)
    monkeypatch.setattr(
        tmdb_mod, "MovieReviewsResponse", lambda **kw: kw, raising=False
    )
    monkeypatch.setattr(
        tmdb_mod, "MovieTrailerResponse", lambda **kw: kw, raising=False
    )


# ---------------------------------------------------------------------------
# Minimal fake aiohttp session / response helpers
# ---------------------------------------------------------------------------
class _FakeResp:
    def __init__(self, status: int, payload: dict):
        self.status = status
        self._payload = payload

    async def json(self):
        return self._payload


class _FakeGetCtx:
    def __init__(self, resp: _FakeResp):
        self._resp = resp

    async def __aenter__(self):
        return self._resp

    async def __aexit__(self, exc_type, exc_val, tb):
        pass


class _FakeSession:
    def __init__(self, resp: _FakeResp = None, raise_exc: Exception = None):
        self._resp = resp
        self._exc = raise_exc

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, tb):
        pass

    def get(self, _url):
        if self._exc:
            raise self._exc
        return _FakeGetCtx(self._resp)


# ---------------------------------------------------------------------------
# make_request helper tests
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_make_request_success(monkeypatch):
    """Happy path – status 200, returns JSON"""
    fake_resp = _FakeResp(200, {"ok": True})
    monkeypatch.setattr(
        tmdb_mod.aiohttp, "ClientSession", lambda *a, **kw: _FakeSession(resp=fake_resp)
    )

    data = await tmdb_mod.make_request("http://example.com")
    assert data == {"ok": True}


@pytest.mark.asyncio
async def test_make_request_tmdb_error(monkeypatch):
    """Status >= 400 with TMDB error payload → mapped HTTPException"""
    err_payload = {"status_code": 34, "status_message": "Not found"}
    fake_resp = _FakeResp(404, err_payload)
    monkeypatch.setattr(
        tmdb_mod.aiohttp, "ClientSession", lambda *a, **kw: _FakeSession(resp=fake_resp)
    )
    monkeypatch.setattr(tmdb_mod, "tmdb_to_http_map", {34: 404}, raising=False)

    with pytest.raises(HTTPException) as exc:
        await tmdb_mod.make_request("http://x")

    assert exc.value.status_code == 404
    assert "Not found" in exc.value.detail


@pytest.mark.asyncio
async def test_make_request_connection_error(monkeypatch):
    """aiohttp.ClientConnectionError → HTTP 503"""
    import aiohttp

    monkeypatch.setattr(
        tmdb_mod.aiohttp,
        "ClientSession",
        lambda *a, **kw: _FakeSession(raise_exc=aiohttp.ClientConnectionError("boom")),
    )

    with pytest.raises(HTTPException) as exc:
        await tmdb_mod.make_request("http://x")

    assert exc.value.status_code == 503


# ---------------------------------------------------------------------------
# fetch_* wrappers (they rely on make_request)
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
@patch.object(tmdb_mod, "make_request", new_callable=AsyncMock)
async def test_fetch_popular_movies_builds_movie_objects(mock_req):
    mock_req.return_value = {"results": [{"id": 1, "title": "Pop"}]}
    movies = await tmdb_mod.fetch_popular_movies(page=2)

    assert len(movies) == 1 and isinstance(movies[0], DummyMovie)
    called_url = mock_req.call_args.args[0]
    assert "/movie/popular" in called_url and "page=2" in called_url


@pytest.mark.asyncio
@patch.object(tmdb_mod, "make_request", new_callable=AsyncMock)
async def test_search_movies(mock_req):
    mock_req.return_value = {"results": [{"id": 7, "title": "Found"}]}
    movies = await tmdb_mod.search_movies("matrix", page=3)

    assert movies[0]["title"] == "Found"
    assert "query=matrix" in mock_req.call_args.args[0]
    assert "page=3" in mock_req.call_args.args[0]


@pytest.mark.asyncio
@patch.object(tmdb_mod, "make_request", new_callable=AsyncMock)
async def test_fetch_movies_genres(mock_req):
    mock_req.return_value = {"genres": [{"id": 10, "name": "Comedy"}]}
    genres = await tmdb_mod.fetch_movies_genres()

    assert isinstance(genres[0], DummyGenre)


@pytest.mark.asyncio
@patch.object(tmdb_mod, "make_request", new_callable=AsyncMock)
async def test_fetch_movie_details(mock_req):
    mock_req.return_value = {"id": 42, "title": "Life"}
    movie = await tmdb_mod.fetch_movie_details(42)

    assert movie["id"] == 42
    assert "/movie/42" in mock_req.call_args.args[0]


# ---------------------------------------------------------------------------
# fetch_multiple_movies_details
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_fetch_multiple_movies_details(monkeypatch):
    async def fake_details(mid):
        return DummyMovie(id=mid)

    monkeypatch.setattr(
        tmdb_mod, "fetch_movie_details", AsyncMock(side_effect=fake_details)
    )
    res = await tmdb_mod.fetch_multiple_movies_details([1, 2, 3])
    assert [m["id"] for m in res] == [1, 2, 3]


# ---------------------------------------------------------------------------
# fetch_movie_trailer – pick best trailer
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
@patch.object(tmdb_mod, "make_request", new_callable=AsyncMock)
async def test_fetch_movie_trailer_selects_highest_quality(mock_req):
    mock_req.return_value = {
        "results": [
            {
                "site": "YouTube",
                "type": "Trailer",
                "name": "Bad",
                "key": "zzz",
                "official": False,
                "size": 720,
            },
            {
                "site": "YouTube",
                "type": "Trailer",
                "name": "Good",
                "key": "xxx",
                "official": True,
                "size": 1080,
            },
        ]
    }
    trailer = await tmdb_mod.fetch_movie_trailer(99)
    assert trailer["title"] == "Good"
    assert trailer["embed_url"].endswith("/xxx")
    assert trailer["movie_id"] == 99
