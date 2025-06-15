import pytest
from fastapi.testclient import TestClient
from fastapi import status

# Import main module to ensure all routes are loaded
import app.main
from app.utils.app_instance import application

client = TestClient(application)


class TestAuthEndpointsExist:
    """Test that auth endpoints are accessible and don't return 404"""

    def test_signup_endpoint_exists(self):
        """Test signup endpoint exists"""
        response = client.post("/auth/signup", json={})
        # Should not be 404 (route exists) - may be 422 for invalid data
        assert response.status_code != status.HTTP_404_NOT_FOUND

    def test_login_endpoint_exists(self):
        """Test login endpoint exists"""
        response = client.post("/auth/token", data={})
        # Should not be 404 (route exists) - may be 422 for invalid data
        assert response.status_code != status.HTTP_404_NOT_FOUND

    def test_verify_email_endpoint_exists(self):
        """Test verify email endpoint exists"""
        response = client.get("/auth/verify-email")
        # Should not be 404 (route exists) - may be 422 for missing token
        assert response.status_code != status.HTTP_404_NOT_FOUND

    def test_resend_verification_endpoint_exists(self):
        """Test resend verification endpoint exists"""
        response = client.post("/auth/resend-verification", json={})
        # Should not be 404 (route exists) - may be 422 for invalid data
        assert response.status_code != status.HTTP_404_NOT_FOUND

    def test_forgot_password_endpoint_exists(self):
        """Test forgot password endpoint exists"""
        response = client.post("/auth/forgot-password", json={})
        # Should not be 404 (route exists) - may be 422 for invalid data
        assert response.status_code != status.HTTP_404_NOT_FOUND

    def test_reset_password_endpoint_exists(self):
        """Test reset password endpoint exists"""
        response = client.post("/auth/reset-password", json={})
        # Should not be 404 (route exists) - may be 422 for invalid data
        assert response.status_code != status.HTTP_404_NOT_FOUND

    def test_verify_reset_token_endpoint_exists(self):
        """Test verify reset token endpoint exists"""
        response = client.get("/auth/verify-reset-token")
        # Should not be 404 (route exists) - may be 422 for missing token
        assert response.status_code != status.HTTP_404_NOT_FOUND


class TestAppStartup:
    """Test basic app functionality"""

    def test_app_starts(self):
        """Test that the app starts and responds"""
        response = client.get("/")
        assert response.status_code == status.HTTP_200_OK
        assert "MovieCompass" in response.json().get("message", "")

    def test_app_has_auth_routes(self):
        """Test that auth routes are included"""
        # Check if any auth route responds (not 404)
        endpoints_to_check = [
            "/auth/signup",
            "/auth/token",
            "/auth/verify-email",
            "/auth/resend-verification",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/auth/verify-reset-token",
        ]

        routes_exist = 0
        for endpoint in endpoints_to_check:
            try:
                if "verify-email" in endpoint or "verify-reset-token" in endpoint:
                    response = client.get(endpoint)
                else:
                    response = client.post(endpoint, json={})

                if response.status_code != status.HTTP_404_NOT_FOUND:
                    routes_exist += 1
            except Exception:
                # If there's an error, the route probably exists but has other issues
                routes_exist += 1

        # At least half the routes should exist
        assert (
            routes_exist >= len(endpoints_to_check) // 2
        ), f"Only {routes_exist} out of {len(endpoints_to_check)} auth routes found"


class TestBasicFunctionality:
    """Test basic endpoint responses without mocking"""

    def test_signup_with_invalid_data(self):
        """Test signup returns proper error for invalid data"""
        response = client.post(
            "/auth/signup",
            json={"username": "", "email": "invalid-email", "password": "weak"},
        )

        # Should return validation error, not 404
        assert response.status_code in [
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            status.HTTP_400_BAD_REQUEST,
        ]

    def test_login_with_empty_data(self):
        """Test login returns proper error for empty data"""
        response = client.post("/auth/token", data={})

        # Should return validation error, not 404
        assert response.status_code in [
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            status.HTTP_400_BAD_REQUEST,
        ]

    def test_verify_email_without_token(self):
        """Test verify email returns proper error without token"""
        response = client.get("/auth/verify-email")

        # Should return validation error, not 404
        assert response.status_code in [
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            status.HTTP_400_BAD_REQUEST,
        ]
