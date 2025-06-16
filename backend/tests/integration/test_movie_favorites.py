from fastapi import status
import app.main  # Import main to load all routes


def test_user_movie_favorites_flow(client, mongo, make_token):
    """Test complete flow: signup -> login -> add/remove favorites"""

    # ---------- Setup: Create and verify user ----------
    payload = {
        "username": "moviefan",
        "email": "moviefan@example.com",
        "password": "MoviePass123!",
        "confirm_password": "MoviePass123!",
        "first_name": "Movie",
        "last_name": "Fan",
        "phone_number": "+15551234567",
    }

    # Sign up user
    r = client.post("/auth/signup", json=payload)
    assert r.status_code == status.HTTP_200_OK

    # Manually verify user
    mongo.db.users.update_one({"username": "moviefan"}, {"$set": {"is_verified": True}})

    # Login to get token
    form = {"username": "moviefan", "password": "MoviePass123!"}
    r = client.post("/auth/token", data=form)
    assert r.status_code == 200
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # ---------- Test 1: Add movie to favorites ----------
    movie_id = 550  # Fight Club
    r = client.put(f"/users/me/favorite/{movie_id}", headers=headers)
    assert r.status_code == 200
    response_data = r.json()
    assert "Movie added to favorites" in response_data["message"]
    assert movie_id in response_data["favorite_movies"]

    # Verify in database
    user_doc = mongo.db.users.find_one({"username": "moviefan"})
    assert movie_id in user_doc["favorite_movies"]

    # ---------- Test 2: Try to add same movie again (should fail) ----------
    r = client.put(f"/users/me/favorite/{movie_id}", headers=headers)
    assert r.status_code == 400  # Movie already in favorites

    # ---------- Test 3: Add another movie to favorites ----------
    movie_id_2 = 27205  # Inception
    r = client.put(f"/users/me/favorite/{movie_id_2}", headers=headers)
    assert r.status_code == 200
    response_data = r.json()
    assert movie_id_2 in response_data["favorite_movies"]
    assert len(response_data["favorite_movies"]) == 2

    # ---------- Test 4: Check user profile has both favorites ----------
    r = client.get("/users/me", headers=headers)
    assert r.status_code == 200
    user_data = r.json()
    assert len(user_data["favorite_movies"]) == 2
    assert movie_id in user_data["favorite_movies"]
    assert movie_id_2 in user_data["favorite_movies"]

    # ---------- Test 5: Remove movie from favorites ----------
    r = client.delete(f"/users/me/favorite/{movie_id}", headers=headers)
    assert r.status_code == 200
    response_data = r.json()
    assert "Movie removed from favorites" in response_data["message"]
    assert movie_id not in response_data["favorite_movies"]
    assert movie_id_2 in response_data["favorite_movies"]  # Other movie still there

    # ---------- Test 6: Try to remove non-existent favorite (should fail) ----------
    non_existent_movie = 999999
    r = client.delete(f"/users/me/favorite/{non_existent_movie}", headers=headers)
    assert r.status_code == 404  # Movie not found in favorites

    # ---------- Test 7: Remove last favorite ----------
    r = client.delete(f"/users/me/favorite/{movie_id_2}", headers=headers)
    assert r.status_code == 200
    response_data = r.json()
    assert len(response_data["favorite_movies"]) == 0

    # ---------- Test 8: Verify favorites are empty ----------
    r = client.get("/users/me", headers=headers)
    assert r.status_code == 200
    user_data = r.json()
    assert len(user_data["favorite_movies"]) == 0


def test_favorites_require_authentication(client):
    """Test that favorites endpoints require authentication"""

    movie_id = 550

    # Test add favorite without auth
    r = client.put(f"/users/me/favorite/{movie_id}")
    assert r.status_code in [400, 401]  # Unauthorized

    # Test remove favorite without auth
    r = client.delete(f"/users/me/favorite/{movie_id}")
    assert r.status_code in [400, 401]  # Unauthorized


def test_favorites_with_invalid_movie_id(client, mongo, make_token):
    """Test favorites with invalid movie ID formats"""

    # Create and login user
    payload = {
        "username": "testuser2",
        "email": "testuser2@example.com",
        "password": "TestPass123!",
        "confirm_password": "TestPass123!",
        "first_name": "Test",
        "last_name": "User2",
        "phone_number": "+15559876543",
    }

    r = client.post("/auth/signup", json=payload)
    assert r.status_code == 200

    mongo.db.users.update_one(
        {"username": "testuser2"}, {"$set": {"is_verified": True}}
    )

    form = {"username": "testuser2", "password": "TestPass123!"}
    r = client.post("/auth/token", data=form)
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test with invalid movie ID format
    r = client.put("/users/me/favorite/invalid_id", headers=headers)
    assert r.status_code == 422  # Validation error

    # Test with negative movie ID (TMDB service will return 404 for invalid movie)
    r = client.put("/users/me/favorite/-1", headers=headers)
    assert r.status_code in [
        400,
        404,
        422,
    ]  # Could be validation error or movie not found
