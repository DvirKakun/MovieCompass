from fastapi import status
from app.services.security import verify_password
import app.main


def test_complete_auth_flow_with_profile_update(client, mongo, make_token):
    """Test comprehensive auth flow: signup -> verify -> login -> profile management"""

    # ---------- STEP 1: User Registration ----------
    registration_payload = {
        "username": "alice_wonder",
        "email": "alice.wonder@example.com",
        "password": "SecurePassword123!",
        "confirm_password": "SecurePassword123!",
        "first_name": "Alice",
        "last_name": "Wonder",
        "phone_number": "+12125551212",
    }

    # Register new user
    signup_response = client.post("/auth/signup", json=registration_payload)
    assert signup_response.status_code == status.HTTP_200_OK

    signup_data = signup_response.json()
    assert signup_data["user"]["username"] == "alice_wonder"
    assert signup_data["user"]["email"] == "alice.wonder@example.com"
    assert signup_data["user"]["is_verified"] == False
    assert signup_data["user"]["first_name"] == "Alice"
    assert signup_data["user"]["last_name"] == "Wonder"
    assert "User created" in signup_data["message"]

    # ---------- STEP 2: Verify Email (Manual) ----------
    user_doc = mongo.db.users.find_one({"username": "alice_wonder"})
    assert user_doc is not None
    assert user_doc["email"] == "alice.wonder@example.com"
    assert verify_password("SecurePassword123!", user_doc["hashed_password"])
    assert user_doc["is_verified"] == False

    # Simulate email verification
    verification_result = mongo.db.users.update_one(
        {"username": "alice_wonder"}, {"$set": {"is_verified": True}}
    )
    assert verification_result.modified_count == 1

    # Verify the update worked
    verified_user = mongo.db.users.find_one({"username": "alice_wonder"})
    assert verified_user["is_verified"] == True

    # ---------- STEP 3: User Login ----------
    login_form = {"username": "alice_wonder", "password": "SecurePassword123!"}
    login_response = client.post("/auth/token", data=login_form)
    assert login_response.status_code == status.HTTP_200_OK

    login_data = login_response.json()
    assert "access_token" in login_data
    assert login_data["token_type"] == "bearer"
    assert login_data["user"]["username"] == "alice_wonder"
    assert login_data["user"]["is_verified"] == True

    access_token = login_data["access_token"]
    auth_headers = {"Authorization": f"Bearer {access_token}"}

    # ---------- STEP 4: Access Protected Profile Endpoint ----------
    profile_response = client.get("/users/me", headers=auth_headers)
    assert profile_response.status_code == status.HTTP_200_OK

    profile_data = profile_response.json()
    assert profile_data["email"] == "alice.wonder@example.com"
    assert profile_data["username"] == "alice_wonder"
    assert profile_data["first_name"] == "Alice"
    assert profile_data["last_name"] == "Wonder"
    assert profile_data["phone_number"] == "+12125551212"
    assert profile_data["is_verified"] == True
    assert profile_data["favorite_movies"] == []
    assert profile_data["watchlist"] == []
    assert profile_data["ratings"] == []

    # ---------- STEP 5: Update User Profile ----------
    profile_update = {
        "first_name": "Alice Marie",
        "last_name": "Wonderland",
        "phone_number": "+12125559999",
    }

    update_response = client.patch(
        "/users/me", json=profile_update, headers=auth_headers
    )
    assert update_response.status_code == status.HTTP_200_OK

    update_data = update_response.json()
    assert update_data["user"]["first_name"] == "Alice Marie"
    assert update_data["user"]["last_name"] == "Wonderland"
    assert update_data["user"]["phone_number"] == "+12125559999"
    assert (
        "Profile updated" in update_data["message"]
        or "No changes" in update_data["message"]
    )

    # ---------- STEP 6: Verify Profile Changes Persisted ----------
    final_profile_response = client.get("/users/me", headers=auth_headers)
    assert final_profile_response.status_code == status.HTTP_200_OK

    final_profile = final_profile_response.json()
    assert final_profile["first_name"] == "Alice Marie"
    assert final_profile["last_name"] == "Wonderland"
    assert final_profile["phone_number"] == "+12125559999"
    assert final_profile["username"] == "alice_wonder"  # Should not change
    assert final_profile["email"] == "alice.wonder@example.com"  # Should not change

    # Verify changes in database
    final_db_user = mongo.db.users.find_one({"username": "alice_wonder"})
    assert final_db_user["first_name"] == "Alice Marie"
    assert final_db_user["last_name"] == "Wonderland"
    assert final_db_user["phone_number"] == "+12125559999"


def test_authentication_error_scenarios(client, mongo):
    """Test various authentication failure scenarios"""

    # ---------- Test 1: Login with non-existent user ----------
    login_form = {"username": "nonexistent_user", "password": "password123"}
    response = client.post("/auth/token", data=login_form)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    error_data = response.json()
    assert "Incorrect username or password" in str(error_data)

    # ---------- Test 2: Create user and try login before verification ----------
    unverified_user = {
        "username": "unverified_bob",
        "email": "bob@example.com",
        "password": "BobPassword123!",
        "confirm_password": "BobPassword123!",
        "first_name": "Bob",
        "last_name": "Smith",
        "phone_number": "+15551234567",
    }

    signup_response = client.post("/auth/signup", json=unverified_user)
    assert signup_response.status_code == status.HTTP_200_OK

    # Try to login without email verification
    login_form = {"username": "unverified_bob", "password": "BobPassword123!"}
    response = client.post("/auth/token", data=login_form)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    error_data = response.json()
    assert "verify your email" in str(error_data).lower()

    # ---------- Test 3: Login with wrong password ----------
    # First verify the user
    mongo.db.users.update_one(
        {"username": "unverified_bob"}, {"$set": {"is_verified": True}}
    )

    # Try with wrong password
    wrong_password_form = {
        "username": "unverified_bob",
        "password": "WrongPassword123!",
    }
    response = client.post("/auth/token", data=wrong_password_form)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    error_data = response.json()
    assert "Incorrect username or password" in str(error_data)


def test_protected_endpoints_require_authentication(client):
    """Test that protected endpoints properly reject unauthenticated requests"""

    protected_endpoints = [
        ("GET", "/users/me"),
        ("PATCH", "/users/me"),
        ("POST", "/users/me/recommendations"),
        ("PUT", "/users/me/favorite/123"),
        ("DELETE", "/users/me/favorite/123"),
        ("PUT", "/users/me/watchlist/123"),
        ("DELETE", "/users/me/watchlist/123"),
        ("PUT", "/users/me/rating/123"),
        ("DELETE", "/users/me/rating/123"),
    ]

    for method, endpoint in protected_endpoints:
        if method == "GET":
            response = client.get(endpoint)
        elif method == "POST":
            response = client.post(endpoint, json={})
        elif method == "PUT":
            if "rating" in endpoint:
                response = client.put(f"{endpoint}?rating=5")
            else:
                response = client.put(endpoint)
        elif method == "DELETE":
            response = client.delete(endpoint)
        elif method == "PATCH":
            response = client.patch(endpoint, json={})

        # All protected endpoints should require authentication
        assert response.status_code in [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_401_UNAUTHORIZED,
        ], f"Endpoint {method} {endpoint} should require authentication"


def test_registration_validation_errors(client):
    """Test registration with various invalid inputs"""

    # Test missing required fields
    incomplete_payload = {
        "username": "incomplete",
        "email": "incomplete@example.com",
        # Missing password, confirm_password, names, phone
    }
    response = client.post("/auth/signup", json=incomplete_payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # Test password mismatch
    password_mismatch = {
        "username": "mismatch_user",
        "email": "mismatch@example.com",
        "password": "Password123!",
        "confirm_password": "DifferentPassword123!",
        "first_name": "Mismatch",
        "last_name": "User",
        "phone_number": "+15551111111",
    }
    response = client.post("/auth/signup", json=password_mismatch)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    error_data = response.json()
    assert "do not match" in str(error_data).lower()

    # Test invalid email format
    invalid_email = {
        "username": "invalid_email_user",
        "email": "not-an-email",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "first_name": "Invalid",
        "last_name": "Email",
        "phone_number": "+15552222222",
    }
    response = client.post("/auth/signup", json=invalid_email)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # Test weak password
    weak_password = {
        "username": "weak_pass_user",
        "email": "weakpass@example.com",
        "password": "weak",
        "confirm_password": "weak",
        "first_name": "Weak",
        "last_name": "Password",
        "phone_number": "+15553333333",
    }
    response = client.post("/auth/signup", json=weak_password)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_duplicate_registration_prevention(client, mongo):
    """Test that duplicate usernames and emails are rejected"""

    original_user = {
        "username": "original_user",
        "email": "original@example.com",
        "password": "OriginalPass123!",
        "confirm_password": "OriginalPass123!",
        "first_name": "Original",
        "last_name": "User",
        "phone_number": "+15554444444",
    }

    # Register original user
    response = client.post("/auth/signup", json=original_user)
    assert response.status_code == status.HTTP_200_OK

    # Try to register with same username
    duplicate_username = original_user.copy()
    duplicate_username["email"] = "different@example.com"
    response = client.post("/auth/signup", json=duplicate_username)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    error_data = response.json()
    assert "Username already taken" in str(error_data)

    # Try to register with same email
    duplicate_email = original_user.copy()
    duplicate_email["username"] = "different_user"
    response = client.post("/auth/signup", json=duplicate_email)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    error_data = response.json()
    assert "Email already registered" in str(error_data)
