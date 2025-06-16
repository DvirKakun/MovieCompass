from fastapi import status
import app.main  # Import main to load all routes


def test_watchlist_and_ratings_complete_flow(client, mongo, make_token):
    """Test complete movie watchlist and ratings workflow"""

    # ---------- Setup: Create and verify user ----------
    payload = {
        "username": "cinephile",
        "email": "cinephile@example.com",
        "password": "CinemaLover123!",
        "confirm_password": "CinemaLover123!",
        "first_name": "Cinema",
        "last_name": "Lover",
        "phone_number": "+15552468135",
    }

    # Sign up and verify user
    r = client.post("/auth/signup", json=payload)
    assert r.status_code == status.HTTP_200_OK

    mongo.db.users.update_one(
        {"username": "cinephile"}, {"$set": {"is_verified": True}}
    )

    # Login to get token
    form = {"username": "cinephile", "password": "CinemaLover123!"}
    r = client.post("/auth/token", data=form)
    assert r.status_code == 200
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # ---------- Test 1: Add movies to watchlist ----------
    movie_ids = [550, 27205, 155]  # Fight Club, Inception, The Dark Knight

    for movie_id in movie_ids:
        r = client.put(f"/users/me/watchlist/{movie_id}", headers=headers)
        assert r.status_code == 200
        response_data = r.json()
        assert "Movie added to watchlist" in response_data["message"]
        assert movie_id in response_data["watchlist"]

    # Verify all movies in user profile
    r = client.get("/users/me", headers=headers)
    assert r.status_code == 200
    user_data = r.json()
    assert len(user_data["watchlist"]) == 3
    for movie_id in movie_ids:
        assert movie_id in user_data["watchlist"]

    # ---------- Test 2: Try to add duplicate to watchlist ----------
    r = client.put(f"/users/me/watchlist/{movie_ids[0]}", headers=headers)
    assert r.status_code == 400  # Movie already in watchlist

    # ---------- Test 3: Rate movies (simulate watching them) ----------
    ratings = [
        (550, 9),  # Fight Club - 9/10
        (27205, 8),  # Inception - 8/10
        (155, 10),  # The Dark Knight - 10/10
    ]

    for movie_id, rating in ratings:
        r = client.put(f"/users/me/rating/{movie_id}?rating={rating}", headers=headers)
        assert r.status_code == 200
        response_data = r.json()
        assert "Movie rated" in response_data["message"]

        # Verify rating was added
        found_rating = False
        for rating_entry in response_data["ratings"]:
            if rating_entry["movie_id"] == movie_id:
                assert rating_entry["rating"] == rating
                found_rating = True
                break
        assert found_rating, f"Rating for movie {movie_id} not found"

    # ---------- Test 4: Update existing rating ----------
    new_rating = 7
    r = client.put(
        f"/users/me/rating/{movie_ids[0]}?rating={new_rating}", headers=headers
    )
    assert r.status_code == 200
    response_data = r.json()

    # Check that rating was updated
    found_updated_rating = False
    for rating_entry in response_data["ratings"]:
        if rating_entry["movie_id"] == movie_ids[0]:
            assert rating_entry["rating"] == new_rating
            found_updated_rating = True
            break
    assert found_updated_rating

    # ---------- Test 5: Remove movies from watchlist (after watching) ----------
    watched_movies = movie_ids[:2]  # Watch first two movies

    for movie_id in watched_movies:
        r = client.delete(f"/users/me/watchlist/{movie_id}", headers=headers)
        assert r.status_code == 200
        response_data = r.json()
        assert "Movie removed from watchlist" in response_data["message"]
        assert movie_id not in response_data["watchlist"]

    # Verify only one movie left in watchlist
    r = client.get("/users/me", headers=headers)
    user_data = r.json()
    assert len(user_data["watchlist"]) == 1
    assert movie_ids[2] in user_data["watchlist"]  # Only Dark Knight should remain

    # But all ratings should still exist
    assert len(user_data["ratings"]) == 3

    # ---------- Test 6: Remove a rating ----------
    r = client.delete(f"/users/me/rating/{movie_ids[1]}", headers=headers)
    assert r.status_code == 200
    response_data = r.json()
    assert "Rating deleted" in response_data["message"]

    # Check rating was removed from response
    rating_ids = [rating["movie_id"] for rating in response_data["ratings"]]
    assert movie_ids[1] not in rating_ids
    assert len(response_data["ratings"]) == 2

    # ---------- Test 7: Final state verification ----------
    r = client.get("/users/me", headers=headers)
    user_data = r.json()

    # Should have 1 movie in watchlist
    assert len(user_data["watchlist"]) == 1
    assert movie_ids[2] in user_data["watchlist"]

    # Should have 2 ratings remaining
    assert len(user_data["ratings"]) == 2
    remaining_rated_movies = [rating["movie_id"] for rating in user_data["ratings"]]
    assert movie_ids[0] in remaining_rated_movies
    assert movie_ids[2] in remaining_rated_movies
    assert movie_ids[1] not in remaining_rated_movies


def test_invalid_ratings(client, mongo, make_token):
    """Test rating validation"""

    # Setup user
    payload = {
        "username": "rater",
        "email": "rater@example.com",
        "password": "RateMovies123!",
        "confirm_password": "RateMovies123!",
        "first_name": "Movie",
        "last_name": "Rater",
        "phone_number": "+15553691470",
    }

    r = client.post("/auth/signup", json=payload)
    assert r.status_code == 200

    mongo.db.users.update_one({"username": "rater"}, {"$set": {"is_verified": True}})

    form = {"username": "rater", "password": "RateMovies123!"}
    r = client.post("/auth/token", data=form)
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    movie_id = 550

    # Test invalid ratings (should be 1-10)
    invalid_ratings = [0, 11, -1, 15]

    for invalid_rating in invalid_ratings:
        r = client.put(
            f"/users/me/rating/{movie_id}?rating={invalid_rating}", headers=headers
        )
        assert r.status_code in [
            400,
            422,
        ], f"Invalid rating {invalid_rating} should be rejected"

    # Test valid rating works
    r = client.put(f"/users/me/rating/{movie_id}?rating=5", headers=headers)
    assert r.status_code == 200


def test_watchlist_ratings_require_authentication(client):
    """Test that watchlist and rating endpoints require authentication"""

    movie_id = 550

    # Test watchlist endpoints without auth
    r = client.put(f"/users/me/watchlist/{movie_id}")
    assert r.status_code in [400, 401]

    r = client.delete(f"/users/me/watchlist/{movie_id}")
    assert r.status_code in [400, 401]

    # Test rating endpoints without auth
    r = client.put(f"/users/me/rating/{movie_id}?rating=8")
    assert r.status_code in [400, 401]

    r = client.delete(f"/users/me/rating/{movie_id}")
    assert r.status_code in [400, 401]


def test_remove_nonexistent_items(client, mongo, make_token):
    """Test removing items that don't exist in watchlist/ratings"""

    # Setup user
    payload = {
        "username": "remover",
        "email": "remover@example.com",
        "password": "RemoveTest123!",
        "confirm_password": "RemoveTest123!",
        "first_name": "Item",
        "last_name": "Remover",
        "phone_number": "+15558529637",
    }

    r = client.post("/auth/signup", json=payload)
    assert r.status_code == 200

    mongo.db.users.update_one({"username": "remover"}, {"$set": {"is_verified": True}})

    form = {"username": "remover", "password": "RemoveTest123!"}
    r = client.post("/auth/token", data=form)
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    non_existent_movie = 999999

    # Try to remove from empty watchlist
    r = client.delete(f"/users/me/watchlist/{non_existent_movie}", headers=headers)
    assert r.status_code == 404  # Movie not found in watchlist

    # Try to remove non-existent rating
    r = client.delete(f"/users/me/rating/{non_existent_movie}", headers=headers)
    assert r.status_code == 404  # Rating not found
