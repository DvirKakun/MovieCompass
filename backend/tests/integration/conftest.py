import pytest, mongomock, jwt
from fastapi.testclient import TestClient

# Import main to ensure all routes are loaded
import app.main
from app.utils.app_instance import application  # FastAPI app
import app.services.user as user_service  # swap collection
import app.services.email as email_service  # stub e-mails
import app.services.tmdb as tmdb_service  # stub TMDB
from app.core.config import settings


# -----------------------------------------------------------------------------
# Shared helpers ----------------------------------------------------------------
# -----------------------------------------------------------------------------
def _ensure_last_email_list():
    if not hasattr(email_service, "_LAST_EMAIL"):
        email_service._LAST_EMAIL = []  # global hook for tests


_ensure_last_email_list()


# -----------------------------------------------------------------------------
# MongoDB – use mongomock (in-memory)
# -----------------------------------------------------------------------------
@pytest.fixture(scope="session")
def mongo():
    client = mongomock.MongoClient()
    yield client
    client.close()


@pytest.fixture(autouse=True)
def _override_users_collection(monkeypatch, mongo):
    monkeypatch.setattr(user_service, "users_collection", mongo.db.users)


# -----------------------------------------------------------------------------
# Stub outgoing e-mail (verification & reset)
# -----------------------------------------------------------------------------
@pytest.fixture(autouse=True)
def _stub_email(monkeypatch):
    def _noop_send(recipient, link, *_, **__):
        email_service._LAST_EMAIL[:] = [recipient, link]

    monkeypatch.setattr(email_service, "send_verification_email", _noop_send)
    monkeypatch.setattr(email_service, "send_reset_password_email", _noop_send)


# -----------------------------------------------------------------------------
# Stub TMDB API calls with proper mock data
# -----------------------------------------------------------------------------
@pytest.fixture(autouse=True)
def _stub_tmdb(monkeypatch):

    # Sample movie data
    SAMPLE_MOVIES_RESPONSE = {
        "results": [
            {
                "id": 550,
                "title": "Fight Club",
                "overview": "A ticking-time-bomb insomniac and a slippery soap salesman...",
                "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                "backdrop_path": "/52AfXWuXCHn3UjD17rBruA9f5qb.jpg",
                "release_date": "1999-10-15",
                "vote_average": 8.433,
                "vote_count": 27000,
                "genre_ids": [18, 53],
                "popularity": 61.416,
            },
            {
                "id": 27205,
                "title": "Inception",
                "overview": "Dom Cobb is a skilled thief, the absolute best in the dangerous art...",
                "poster_path": "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
                "backdrop_path": "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
                "release_date": "2010-07-16",
                "vote_average": 8.367,
                "vote_count": 35000,
                "genre_ids": [28, 878, 53],
                "popularity": 85.123,
            },
            {
                "id": 155,
                "title": "The Dark Knight",
                "overview": "Batman raises the stakes in his war on crime...",
                "poster_path": "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
                "backdrop_path": "/hqkIcbrOHL86UncnHIsHVcVmzue.jpg",
                "release_date": "2008-07-18",
                "vote_average": 9.0,
                "vote_count": 32000,
                "genre_ids": [18, 28, 80, 53],
                "popularity": 123.456,
            },
        ],
        "total_pages": 100,
        "total_results": 2000,
    }

    SAMPLE_GENRES_RESPONSE = {
        "genres": [
            {"id": 28, "name": "Action"},
            {"id": 12, "name": "Adventure"},
            {"id": 16, "name": "Animation"},
            {"id": 35, "name": "Comedy"},
            {"id": 80, "name": "Crime"},
            {"id": 99, "name": "Documentary"},
            {"id": 18, "name": "Drama"},
            {"id": 10751, "name": "Family"},
            {"id": 14, "name": "Fantasy"},
            {"id": 36, "name": "History"},
            {"id": 27, "name": "Horror"},
            {"id": 10402, "name": "Music"},
            {"id": 9648, "name": "Mystery"},
            {"id": 10749, "name": "Romance"},
            {"id": 878, "name": "Science Fiction"},
            {"id": 10770, "name": "TV Movie"},
            {"id": 53, "name": "Thriller"},
            {"id": 10752, "name": "War"},
            {"id": 37, "name": "Western"},
        ]
    }

    SAMPLE_CAST_RESPONSE = {
        "id": 550,
        "cast": [
            {
                "id": 819,
                "name": "Edward Norton",
                "character": "The Narrator",
                "profile_path": "/5XBzD5WuTyVQZeS4VI25z2moMeY.jpg",
            },
            {
                "id": 287,
                "name": "Brad Pitt",
                "character": "Tyler Durden",
                "profile_path": "/ajNaPmXVVMJFg9GWmu6MJzTaXdV.jpg",
            },
        ],
    }

    SAMPLE_REVIEWS_RESPONSE = {
        "id": 550,
        "results": [
            {
                "id": "review1",
                "author": "reviewer1",
                "content": "Great movie with excellent performances...",
                "created_at": "2023-01-01T00:00:00.000Z",
            }
        ],
        "total_results": 1,
    }

    SAMPLE_TRAILER_RESPONSE = {
        "id": 550,
        "results": [{"key": "SUXWAEX2jlg", "site": "YouTube", "type": "Trailer"}],
    }

    SAMPLE_MOVIE_DETAILS = {
        "id": 550,
        "title": "Fight Club",
        "overview": "A ticking-time-bomb insomniac and a slippery soap salesman...",
        "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
        "backdrop_path": "/52AfXWuXCHn3UjD17rBruA9f5qb.jpg",
        "release_date": "1999-10-15",
        "vote_average": 8.433,
        "vote_count": 27000,
        "genre_ids": [18, 53],
        "popularity": 61.416,
    }

    async def _fake_tmdb_request(url: str, method: str = "GET"):
        """Mock TMDB API requests with proper response data"""

        # For HEAD requests (used by favorites/watchlist validation), return 200
        if method == "HEAD":
            return 200

        # For GET requests, return appropriate mock data based on URL
        if "popular" in url:
            return SAMPLE_MOVIES_RESPONSE
        elif "search" in url:
            return SAMPLE_MOVIES_RESPONSE  # Same sample data for search
        elif "genre" in url and "/movie" in url:
            return SAMPLE_GENRES_RESPONSE
        elif "/genre/" in url:
            return SAMPLE_MOVIES_RESPONSE  # Movies by genre
        elif "credits" in url:
            return SAMPLE_CAST_RESPONSE
        elif "reviews" in url:
            return SAMPLE_REVIEWS_RESPONSE
        elif "videos" in url:
            return SAMPLE_TRAILER_RESPONSE
        elif "/movie/" in url and url.endswith(url.split("/")[-1]):
            # Individual movie details
            movie_id = int(url.split("/")[-1].split("?")[0])
            details = SAMPLE_MOVIE_DETAILS.copy()
            details["id"] = movie_id
            return details
        else:
            # Default response for any other movie-related request
            return SAMPLE_MOVIES_RESPONSE

    monkeypatch.setattr(tmdb_service, "make_request", _fake_tmdb_request)


# -----------------------------------------------------------------------------
# FastAPI client
# -----------------------------------------------------------------------------
@pytest.fixture
def client():
    with TestClient(application) as c:
        yield c


# -----------------------------------------------------------------------------
# JWT helper used by tests
# -----------------------------------------------------------------------------
def make_jwt(user_id: str) -> str:
    return jwt.encode(
        {"sub": user_id}, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )


@pytest.fixture
def make_token():
    return make_jwt
