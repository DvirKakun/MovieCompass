from fastapi import status
import app.main


def test_complete_profile_management_flow(client, mongo, make_token):
    """Test complete profile management: registration -> verification -> login -> profile updates -> password change"""

    # ---------- Setup: Register User ----------
    user_payload = {
        "username": "profile_manager",
        "email": "profile.manager@example.com",
        "password": "OriginalPass123!",
        "confirm_password": "OriginalPass123!",
        "first_name": "Profile",
        "last_name": "Manager",
        "phone_number": "+15551112345",
    }

    r = client.post("/auth/signup", json=user_payload)
    assert r.status_code == status.HTTP_200_OK

    # Verify and login
    mongo.db.users.update_one(
        {"username": "profile_manager"}, {"$set": {"is_verified": True}}
    )

    form = {"username": "profile_manager", "password": "OriginalPass123!"}
    r = client.post("/auth/token", data=form)
    assert r.status_code == 200
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # ---------- Test 1: Get Initial Profile ----------
    r = client.get("/users/me", headers=headers)
    assert r.status_code == 200
    initial_profile = r.json()
    assert initial_profile["username"] == "profile_manager"
    assert initial_profile["email"] == "profile.manager@example.com"
    assert initial_profile["first_name"] == "Profile"
    assert initial_profile["last_name"] == "Manager"
    assert initial_profile["phone_number"] == "+15551112345"

    # ---------- Test 2: Update Basic Profile Info ----------
    profile_update = {
        "first_name": "Updated Profile",
        "last_name": "Updated Manager",
        "phone_number": "+15559876543",
    }

    r = client.patch("/users/me", json=profile_update, headers=headers)
    assert r.status_code == 200
    response_data = r.json()
    assert response_data["user"]["first_name"] == "Updated Profile"
    assert response_data["user"]["last_name"] == "Updated Manager"
    assert response_data["user"]["phone_number"] == "+15559876543"

    # Verify changes persisted
    r = client.get("/users/me", headers=headers)
    updated_profile = r.json()
    assert updated_profile["first_name"] == "Updated Profile"
    assert updated_profile["last_name"] == "Updated Manager"
    assert updated_profile["phone_number"] == "+15559876543"

    # ---------- Test 3: Change Username ----------
    username_update = {"username": "new_username"}

    r = client.patch("/users/me", json=username_update, headers=headers)
    assert r.status_code == 200
    response_data = r.json()
    assert response_data["user"]["username"] == "new_username"

    # Verify can still access with new username
    r = client.get("/users/me", headers=headers)
    profile = r.json()
    assert profile["username"] == "new_username"

    # ---------- Test 4: Change Password ----------
    password_update = {
        "old_password": "OriginalPass123!",
        "new_password": "NewSecurePass123!",
        "new_password_confirm": "NewSecurePass123!",
    }

    r = client.patch("/users/me", json=password_update, headers=headers)
    assert r.status_code == 200

    # Test login with new password
    new_login_form = {"username": "new_username", "password": "NewSecurePass123!"}
    r = client.post("/auth/token", data=new_login_form)
    assert r.status_code == 200
    new_token = r.json()["access_token"]
    new_headers = {"Authorization": f"Bearer {new_token}"}

    # Verify old password doesn't work
    old_login_form = {"username": "new_username", "password": "OriginalPass123!"}
    r = client.post("/auth/token", data=old_login_form)
    assert r.status_code == 401

    # ---------- Test 5: Multiple Field Update ----------
    multi_update = {
        "first_name": "Final Name",
        "last_name": "Final Manager",
        "phone_number": "+15555555555",
    }

    r = client.patch("/users/me", json=multi_update, headers=new_headers)
    assert r.status_code == 200

    # Verify all changes
    r = client.get("/users/me", headers=new_headers)
    final_profile = r.json()
    assert final_profile["username"] == "new_username"
    assert final_profile["email"] == "profile.manager@example.com"  # Should not change
    assert final_profile["first_name"] == "Final Name"
    assert final_profile["last_name"] == "Final Manager"
    assert final_profile["phone_number"] == "+15555555555"


def test_profile_update_validation_errors(client, mongo, make_token):
    """Test profile update validation and error handling"""

    # Setup user
    user_payload = {
        "username": "validator",
        "email": "validator@example.com",
        "password": "ValidPass123!",
        "confirm_password": "ValidPass123!",
        "first_name": "Valid",
        "last_name": "User",
        "phone_number": "+15551234567",
    }

    r = client.post("/auth/signup", json=user_payload)
    assert r.status_code == 200

    mongo.db.users.update_one(
        {"username": "validator"}, {"$set": {"is_verified": True}}
    )

    form = {"username": "validator", "password": "ValidPass123!"}
    r = client.post("/auth/token", data=form)
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test password mismatch
    password_mismatch = {
        "old_password": "ValidPass123!",
        "new_password": "NewPass123!",
        "new_password_confirm": "DifferentPass123!",
    }

    r = client.patch("/users/me", json=password_mismatch, headers=headers)
    assert r.status_code == 400
    error_data = r.json()
    assert "do not match" in str(error_data).lower()

    # Test wrong old password
    wrong_old_password = {
        "old_password": "WrongPass123!",
        "new_password": "NewPass123!",
        "new_password_confirm": "NewPass123!",
    }

    r = client.patch("/users/me", json=wrong_old_password, headers=headers)
    assert r.status_code == 400
    error_data = r.json()
    assert "incorrect" in str(error_data).lower()

    # Test weak new password
    weak_password = {
        "old_password": "ValidPass123!",
        "new_password": "weak",
        "new_password_confirm": "weak",
    }

    r = client.patch("/users/me", json=weak_password, headers=headers)
    assert r.status_code == 422


def test_duplicate_username_prevention(client, mongo, make_token):
    """Test that duplicate usernames are prevented during profile updates"""

    # Create first user
    user1_payload = {
        "username": "user_one",
        "email": "user1@example.com",
        "password": "UserOne123!",
        "confirm_password": "UserOne123!",
        "first_name": "User",
        "last_name": "One",
        "phone_number": "+15551111111",
    }

    r = client.post("/auth/signup", json=user1_payload)
    assert r.status_code == 200

    # Create second user
    user2_payload = {
        "username": "user_two",
        "email": "user2@example.com",
        "password": "UserTwo123!",
        "confirm_password": "UserTwo123!",
        "first_name": "User",
        "last_name": "Two",
        "phone_number": "+15552222222",
    }

    r = client.post("/auth/signup", json=user2_payload)
    assert r.status_code == 200

    # Verify both users
    mongo.db.users.update_many({}, {"$set": {"is_verified": True}})

    # Login as user2
    form = {"username": "user_two", "password": "UserTwo123!"}
    r = client.post("/auth/token", data=form)
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Try to change username to existing username
    duplicate_username = {"username": "user_one"}

    r = client.patch("/users/me", json=duplicate_username, headers=headers)
    assert r.status_code == 400
    error_data = r.json()
    assert "already taken" in str(error_data).lower()

    # Verify username didn't change
    r = client.get("/users/me", headers=headers)
    profile = r.json()
    assert profile["username"] == "user_two"


def test_profile_update_requires_authentication(client):
    """Test that profile updates require authentication"""

    # Test without auth headers
    update_data = {"first_name": "Unauthorized"}

    r = client.patch("/users/me", json=update_data)
    assert r.status_code in [400, 401]

    # Test with invalid token
    invalid_headers = {"Authorization": "Bearer invalid_token"}
    r = client.patch("/users/me", json=update_data, headers=invalid_headers)
    assert r.status_code in [400, 401]


def test_empty_profile_update(client, mongo, make_token):
    """Test profile update with no changes"""

    # Setup user
    user_payload = {
        "username": "no_change_user",
        "email": "nochange@example.com",
        "password": "NoChange123!",
        "confirm_password": "NoChange123!",
        "first_name": "No",
        "last_name": "Change",
        "phone_number": "+15550000000",
    }

    r = client.post("/auth/signup", json=user_payload)
    assert r.status_code == 200

    mongo.db.users.update_one(
        {"username": "no_change_user"}, {"$set": {"is_verified": True}}
    )

    form = {"username": "no_change_user", "password": "NoChange123!"}
    r = client.post("/auth/token", data=form)
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Update with empty data
    r = client.patch("/users/me", json={}, headers=headers)
    assert r.status_code == 200
    response_data = r.json()
    assert (
        "No changes" in response_data["message"]
        or "updated" in response_data["message"].lower()
    )

    # Update with null/empty values (should return validation error)
    empty_update = {"first_name": "", "last_name": None}

    r = client.patch("/users/me", json=empty_update, headers=headers)
    assert r.status_code == 422  # Validation error for empty/null values
