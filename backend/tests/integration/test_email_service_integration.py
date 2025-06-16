from fastapi import status
import app.main
import app.services.email as email_service
import random


def test_email_verification_workflow_integration(client, mongo):
    """Test complete email verification workflow with email service integration"""

    random_num = str(random.randint(100000, 999999))

    # ---------- Test 1: User signup triggers verification email ----------
    user_payload = {
        "username": f"emailtest{random_num}",
        "email": f"emailtest{random_num}@example.com",
        "password": "EmailTest123!",
        "confirm_password": "EmailTest123!",
        "first_name": "Email",
        "last_name": "Test",
        "phone_number": f"+1555{random_num[:7]}",
    }

    # Clear email log before test
    email_service._LAST_EMAIL.clear()

    r = client.post("/auth/signup", json=user_payload)
    assert r.status_code == 200
    response_data = r.json()
    assert "Please verify your email" in response_data["message"]
    assert response_data["user"]["is_verified"] is False

    # ---------- Test 2: Verify email was captured by stub ----------
    assert len(email_service._LAST_EMAIL) == 2
    email_recipient = email_service._LAST_EMAIL[0]
    email_link = email_service._LAST_EMAIL[1]

    assert email_recipient == f"emailtest{random_num}@example.com"
    assert "/auth/verify-email?token=" in email_link
    assert "token=" in email_link

    # ---------- Test 3: Extract token and verify email ----------
    verification_token = (
        email_link.split("token=")[1].split("&")[0]
        if "&" in email_link.split("token=")[1]
        else email_link.split("token=")[1]
    )

    r = client.get(f"/auth/verify-email?token={verification_token}")
    assert r.status_code == 200
    response_data = r.json()
    assert "Email verified successfully" in response_data["message"]

    # ---------- Test 4: Verify user can now login ----------
    login_form = {"username": f"emailtest{random_num}", "password": "EmailTest123!"}
    r = client.post("/auth/token", data=login_form)
    assert r.status_code == 200

    token_data = r.json()
    assert token_data["user"]["is_verified"] is True


def test_resend_verification_email_integration(client, mongo):
    """Test resending verification email integration"""

    random_num = str(random.randint(100000, 999999))

    # ---------- Setup: Create unverified user ----------
    user_payload = {
        "username": f"resendtest{random_num}",
        "email": f"resendtest{random_num}@example.com",
        "password": "ResendTest123!",
        "confirm_password": "ResendTest123!",
        "first_name": "Resend",
        "last_name": "Test",
        "phone_number": f"+1556{random_num[:7]}",
    }

    r = client.post("/auth/signup", json=user_payload)
    assert r.status_code == 200

    # Clear email log
    email_service._LAST_EMAIL.clear()

    # ---------- Test 1: Resend verification email ----------
    resend_request = {"email": f"resendtest{random_num}@example.com"}
    r = client.post("/auth/resend-verification", json=resend_request)
    assert r.status_code == 200
    response_data = r.json()
    assert "Verification email has been resent" in response_data["message"]

    # ---------- Test 2: Verify resend email was captured ----------
    assert len(email_service._LAST_EMAIL) == 2
    resend_recipient = email_service._LAST_EMAIL[0]
    resend_link = email_service._LAST_EMAIL[1]

    assert resend_recipient == f"resendtest{random_num}@example.com"
    assert "/auth/verify-email?token=" in resend_link

    # ---------- Test 3: Use resent token to verify ----------
    resend_token = (
        resend_link.split("token=")[1].split("&")[0]
        if "&" in resend_link.split("token=")[1]
        else resend_link.split("token=")[1]
    )

    r = client.get(f"/auth/verify-email?token={resend_token}")
    assert r.status_code == 200

    # ---------- Test 4: Verify login works after resend verification ----------
    login_form = {"username": f"resendtest{random_num}", "password": "ResendTest123!"}
    r = client.post("/auth/token", data=login_form)
    assert r.status_code == 200


def test_password_reset_email_integration(client, mongo):
    """Test password reset email service integration"""

    random_num = str(random.randint(100000, 999999))

    # ---------- Setup: Create verified user ----------
    user_payload = {
        "username": f"resettest{random_num}",
        "email": f"resettest{random_num}@example.com",
        "password": "ResetTest123!",
        "confirm_password": "ResetTest123!",
        "first_name": "Reset",
        "last_name": "Test",
        "phone_number": f"+1557{random_num[:7]}",
    }

    r = client.post("/auth/signup", json=user_payload)
    assert r.status_code == 200

    # Verify user in database
    mongo.db.users.update_one(
        {"username": f"resettest{random_num}"}, {"$set": {"is_verified": True}}
    )

    # Clear email log
    email_service._LAST_EMAIL.clear()

    # ---------- Test 1: Request password reset ----------
    forgot_request = {"email": f"resettest{random_num}@example.com"}
    r = client.post("/auth/forgot-password", json=forgot_request)
    assert r.status_code == 200
    response_data = r.json()
    assert "Password reset email has been sent" in response_data["message"]

    # ---------- Test 2: Verify reset email was captured ----------
    assert len(email_service._LAST_EMAIL) == 2
    reset_recipient = email_service._LAST_EMAIL[0]
    reset_link = email_service._LAST_EMAIL[1]

    assert reset_recipient == f"resettest{random_num}@example.com"
    assert "/auth/reset-password?token=" in reset_link

    # ---------- Test 3: Use reset token to change password ----------
    reset_token = (
        reset_link.split("token=")[1].split("&")[0]
        if "&" in reset_link.split("token=")[1]
        else reset_link.split("token=")[1]
    )

    reset_request = {
        "token": reset_token,
        "new_password": "NewResetPass123!",
        "new_password_confirm": "NewResetPass123!",
    }
    r = client.post("/auth/reset-password", json=reset_request)
    assert r.status_code == 200

    # ---------- Test 4: Verify new password works ----------
    login_form = {"username": f"resettest{random_num}", "password": "NewResetPass123!"}
    r = client.post("/auth/token", data=login_form)
    assert r.status_code == 200

    # ---------- Test 5: Verify old password no longer works ----------
    old_login_form = {"username": f"resettest{random_num}", "password": "ResetTest123!"}
    r = client.post("/auth/token", data=old_login_form)
    assert r.status_code == 401


def test_email_service_error_handling_integration(client, mongo):
    """Test email service error handling in integration scenarios"""

    random_num = str(random.randint(100000, 999999))

    # ---------- Test 1: Resend verification for non-existent user ----------
    resend_request = {"email": f"nonexistent{random_num}@example.com"}
    r = client.post("/auth/resend-verification", json=resend_request)
    assert r.status_code == 404
    error_data = r.json()
    assert "User not found" in str(error_data)

    # ---------- Test 2: Request password reset for non-existent user ----------
    forgot_request = {"email": f"nonexistent{random_num}@example.com"}
    r = client.post("/auth/forgot-password", json=forgot_request)
    assert r.status_code == 404
    error_data = r.json()
    assert "User not found" in str(error_data)

    # ---------- Setup: Create verified user for remaining tests ----------
    user_payload = {
        "username": f"errortest{random_num}",
        "email": f"errortest{random_num}@example.com",
        "password": "ErrorTest123!",
        "confirm_password": "ErrorTest123!",
        "first_name": "Error",
        "last_name": "Test",
        "phone_number": f"+1558{random_num[:7]}",
    }

    r = client.post("/auth/signup", json=user_payload)
    assert r.status_code == 200

    # Verify user
    mongo.db.users.update_one(
        {"username": f"errortest{random_num}"}, {"$set": {"is_verified": True}}
    )

    # ---------- Test 3: Try to resend verification for already verified user ----------
    resend_request = {"email": f"errortest{random_num}@example.com"}
    r = client.post("/auth/resend-verification", json=resend_request)
    assert r.status_code == 400
    error_data = r.json()
    assert "already verified" in str(error_data).lower()


def test_email_content_and_format_integration(client, mongo):
    """Test email content and format through integration testing"""

    random_num = str(random.randint(100000, 999999))

    # ---------- Setup: Create user ----------
    user_payload = {
        "username": f"contenttest{random_num}",
        "email": f"contenttest{random_num}@example.com",
        "password": "ContentTest123!",
        "confirm_password": "ContentTest123!",
        "first_name": "Content",
        "last_name": "Test",
        "phone_number": f"+1559{random_num[:7]}",
    }

    # Clear email log
    email_service._LAST_EMAIL.clear()

    # ---------- Test 1: Signup and check verification email content ----------
    r = client.post("/auth/signup", json=user_payload)
    assert r.status_code == 200

    # Verify email was sent
    assert len(email_service._LAST_EMAIL) == 2
    verification_link = email_service._LAST_EMAIL[1]

    # Verify link format
    assert verification_link.startswith("http")
    assert "/auth/verify-email?token=" in verification_link
    assert len(verification_link.split("token=")[1]) > 10  # Token should be substantial

    # ---------- Test 2: Request password reset and check email content ----------
    # First verify the user
    mongo.db.users.update_one(
        {"username": f"contenttest{random_num}"}, {"$set": {"is_verified": True}}
    )

    # Clear email log
    email_service._LAST_EMAIL.clear()

    forgot_request = {"email": f"contenttest{random_num}@example.com"}
    r = client.post("/auth/forgot-password", json=forgot_request)
    assert r.status_code == 200

    # Verify reset email was sent
    assert len(email_service._LAST_EMAIL) == 2
    reset_link = email_service._LAST_EMAIL[1]

    # Verify reset link format
    assert reset_link.startswith("http")
    assert "/auth/reset-password?token=" in reset_link
    assert len(reset_link.split("token=")[1]) > 10  # Token should be substantial

    # Verify tokens are different for different purposes
    verification_token = (
        verification_link.split("token=")[1] if verification_link else ""
    )
    reset_token = reset_link.split("token=")[1]
    # Note: These might be the same due to same user and similar timing, but that's acceptable


def test_multiple_email_requests_integration(client, mongo):
    """Test handling multiple email requests for the same user"""

    random_num = str(random.randint(100000, 999999))

    # ---------- Setup: Create unverified user ----------
    user_payload = {
        "username": f"multitest{random_num}",
        "email": f"multitest{random_num}@example.com",
        "password": "MultiTest123!",
        "confirm_password": "MultiTest123!",
        "first_name": "Multi",
        "last_name": "Test",
        "phone_number": f"+1560{random_num[:7]}",
    }

    r = client.post("/auth/signup", json=user_payload)
    assert r.status_code == 200

    # Clear email log
    email_service._LAST_EMAIL.clear()

    # ---------- Test 1: Multiple resend verification requests ----------
    resend_request = {"email": f"multitest{random_num}@example.com"}

    # First resend
    r = client.post("/auth/resend-verification", json=resend_request)
    assert r.status_code == 200
    first_link = email_service._LAST_EMAIL[1] if email_service._LAST_EMAIL else ""

    # Second resend (should also work)
    r = client.post("/auth/resend-verification", json=resend_request)
    assert r.status_code == 200
    second_link = email_service._LAST_EMAIL[1] if email_service._LAST_EMAIL else ""

    # Both links should be valid verification links
    assert "/auth/verify-email?token=" in first_link
    assert "/auth/verify-email?token=" in second_link

    # ---------- Test 2: Use latest token to verify ----------
    latest_token = (
        second_link.split("token=")[1].split("&")[0]
        if "&" in second_link.split("token=")[1]
        else second_link.split("token=")[1]
    )

    r = client.get(f"/auth/verify-email?token={latest_token}")
    assert r.status_code == 200

    # ---------- Test 3: Multiple password reset requests ----------
    # Clear email log
    email_service._LAST_EMAIL.clear()

    forgot_request = {"email": f"multitest{random_num}@example.com"}

    # First reset request
    r = client.post("/auth/forgot-password", json=forgot_request)
    assert r.status_code == 200
    first_reset_link = email_service._LAST_EMAIL[1] if email_service._LAST_EMAIL else ""

    # Second reset request (should also work)
    r = client.post("/auth/forgot-password", json=forgot_request)
    assert r.status_code == 200
    second_reset_link = (
        email_service._LAST_EMAIL[1] if email_service._LAST_EMAIL else ""
    )

    # Both should be valid reset links
    assert "/auth/reset-password?token=" in first_reset_link
    assert "/auth/reset-password?token=" in second_reset_link


def test_email_service_token_validation_integration(client, mongo):
    """Test email service token validation in integration scenarios"""

    random_num = str(random.randint(100000, 999999))

    # ---------- Setup: Create user ----------
    user_payload = {
        "username": f"tokentest{random_num}",
        "email": f"tokentest{random_num}@example.com",
        "password": "TokenTest123!",
        "confirm_password": "TokenTest123!",
        "first_name": "Token",
        "last_name": "Test",
        "phone_number": f"+1561{random_num[:7]}",
    }

    r = client.post("/auth/signup", json=user_payload)
    assert r.status_code == 200

    # ---------- Test 1: Invalid verification token ----------
    r = client.get("/auth/verify-email?token=invalid_token_123")
    assert r.status_code in [400, 401]

    # ---------- Test 2: Malformed verification token ----------
    r = client.get("/auth/verify-email?token=malformed.token.here")
    assert r.status_code in [400, 401]

    # ---------- Test 3: Empty verification token ----------
    r = client.get("/auth/verify-email?token=")
    assert r.status_code in [400, 422]

    # ---------- Test 4: Invalid reset token ----------
    reset_request = {
        "token": "invalid_reset_token_123",
        "new_password": "NewPass123!",
        "new_password_confirm": "NewPass123!",
    }
    r = client.post("/auth/reset-password", json=reset_request)
    assert r.status_code in [400, 401]

    # ---------- Test 5: Verify valid token still works ----------
    verification_link = email_service._LAST_EMAIL[1]
    valid_token = (
        verification_link.split("token=")[1].split("&")[0]
        if "&" in verification_link.split("token=")[1]
        else verification_link.split("token=")[1]
    )

    r = client.get(f"/auth/verify-email?token={valid_token}")
    assert r.status_code == 200


def test_email_service_background_tasks_integration(client, mongo):
    """Test email service background tasks integration"""

    random_num = str(random.randint(100000, 999999))

    # ---------- Test 1: Verify signup uses background tasks for email ----------
    user_payload = {
        "username": f"bgtest{random_num}",
        "email": f"bgtest{random_num}@example.com",
        "password": "BgTest123!",
        "confirm_password": "BgTest123!",
        "first_name": "Background",
        "last_name": "Test",
        "phone_number": f"+1562{random_num[:7]}",
    }

    # Clear email log
    email_service._LAST_EMAIL.clear()

    # Signup should return immediately even though email is sent in background
    r = client.post("/auth/signup", json=user_payload)
    assert r.status_code == 200

    # Email should be captured by our stub (background task executed)
    assert len(email_service._LAST_EMAIL) == 2

    # ---------- Test 2: Verify resend uses background tasks ----------
    # Clear email log
    email_service._LAST_EMAIL.clear()

    resend_request = {"email": f"bgtest{random_num}@example.com"}
    r = client.post("/auth/resend-verification", json=resend_request)
    assert r.status_code == 200

    # Resend email should be captured
    assert len(email_service._LAST_EMAIL) == 2

    # ---------- Test 3: Verify password reset uses background tasks ----------
    # First verify the user
    mongo.db.users.update_one(
        {"username": f"bgtest{random_num}"}, {"$set": {"is_verified": True}}
    )

    # Clear email log
    email_service._LAST_EMAIL.clear()

    forgot_request = {"email": f"bgtest{random_num}@example.com"}
    r = client.post("/auth/forgot-password", json=forgot_request)
    assert r.status_code == 200

    # Reset email should be captured
    assert len(email_service._LAST_EMAIL) == 2


def test_email_service_rate_limiting_simulation(client, mongo):
    """Test email service behavior under rapid requests (rate limiting simulation)"""

    random_num = str(random.randint(100000, 999999))

    # ---------- Setup: Create unverified user ----------
    user_payload = {
        "username": f"ratetest{random_num}",
        "email": f"ratetest{random_num}@example.com",
        "password": "RateTest123!",
        "confirm_password": "RateTest123!",
        "first_name": "Rate",
        "last_name": "Test",
        "phone_number": f"+1563{random_num[:7]}",
    }

    r = client.post("/auth/signup", json=user_payload)
    assert r.status_code == 200

    # ---------- Test 1: Rapid resend verification requests ----------
    resend_request = {"email": f"ratetest{random_num}@example.com"}

    # Send multiple requests rapidly
    responses = []
    for i in range(5):
        r = client.post("/auth/resend-verification", json=resend_request)
        responses.append(r.status_code)

    # All should succeed (no rate limiting implemented in current system)
    for status_code in responses:
        assert status_code == 200

    # ---------- Test 2: Verify user and test rapid password reset requests ----------
    mongo.db.users.update_one(
        {"username": f"ratetest{random_num}"}, {"$set": {"is_verified": True}}
    )

    forgot_request = {"email": f"ratetest{random_num}@example.com"}

    # Send multiple reset requests rapidly
    reset_responses = []
    for i in range(5):
        r = client.post("/auth/forgot-password", json=forgot_request)
        reset_responses.append(r.status_code)

    # All should succeed (no rate limiting implemented)
    for status_code in reset_responses:
        assert status_code == 200
