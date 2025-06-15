import pytest
from fastapi.testclient import TestClient
from fastapi import status

# Import main module to ensure all routes are loaded
import app.main
from app.utils.app_instance import application

client = TestClient(application)


########################
# Users Endpoints Authentication Tests
########################


class TestUsersEndpointsAuthentication:
    """Test that user endpoints require authentication"""

    def test_get_me_requires_auth(self):
        """Test GET /users/me requires authentication"""
        response = client.get("/users/me")
        # Should return 401 Unauthorized (no auth token)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_patch_me_requires_auth(self):
        """Test PATCH /users/me requires authentication"""
        response = client.patch("/users/me", json={"first_name": "Test"})
        # Should return 401 Unauthorized (no auth token)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_recommendations_requires_auth(self):
        """Test POST /users/me/recommendations requires authentication"""
        response = client.post("/users/me/recommendations")
        # Should return 401 Unauthorized (no auth token)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_add_favorite_requires_auth(self):
        """Test PUT /users/me/favorite/{movie_id} requires authentication"""
        response = client.put("/users/me/favorite/123")
        # Should return 401 Unauthorized (no auth token)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_remove_favorite_requires_auth(self):
        """Test DELETE /users/me/favorite/{movie_id} requires authentication"""
        response = client.delete("/users/me/favorite/123")
        # Should return 401 Unauthorized (no auth token)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_add_watchlist_requires_auth(self):
        """Test PUT /users/me/watchlist/{movie_id} requires authentication"""
        response = client.put("/users/me/watchlist/123")
        # Should return 401 Unauthorized (no auth token)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_remove_watchlist_requires_auth(self):
        """Test DELETE /users/me/watchlist/{movie_id} requires authentication"""
        response = client.delete("/users/me/watchlist/123")
        # Should return 401 Unauthorized (no auth token)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_rate_movie_requires_auth(self):
        """Test PUT /users/me/rating/{movie_id} requires authentication"""
        response = client.put("/users/me/rating/123?rating=8")
        # Should return 401 Unauthorized (no auth token)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_delete_rating_requires_auth(self):
        """Test DELETE /users/me/rating/{movie_id} requires authentication"""
        response = client.delete("/users/me/rating/123")
        # Should return 401 Unauthorized (no auth token)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


########################
# Users Endpoints Existence Tests
########################


class TestUsersEndpointsExist:
    """Test that all user endpoints exist and are accessible"""

    def test_all_user_endpoints_exist(self):
        """Test that all user endpoints return non-404 status"""
        endpoints_to_test = [
            ("/users/me", "GET"),
            ("/users/me", "PATCH"),
            ("/users/me/recommendations", "POST"),
            ("/users/me/favorite/123", "PUT"),
            ("/users/me/favorite/123", "DELETE"),
            ("/users/me/watchlist/123", "PUT"),
            ("/users/me/watchlist/123", "DELETE"),
            ("/users/me/rating/123", "PUT"),
            ("/users/me/rating/123", "DELETE"),
        ]

        for endpoint, method in endpoints_to_test:
            if method == "GET":
                response = client.get(endpoint)
            elif method == "POST":
                response = client.post(endpoint)
            elif method == "PUT":
                response = client.put(endpoint)
            elif method == "DELETE":
                response = client.delete(endpoint)
            elif method == "PATCH":
                response = client.patch(endpoint, json={})

            # Should not return 404 (endpoint exists)
            # Should return 401 (unauthorized) since we're not authenticated
            assert (
                response.status_code != status.HTTP_404_NOT_FOUND
            ), f"Endpoint {method} {endpoint} returned 404"
            assert (
                response.status_code == status.HTTP_401_UNAUTHORIZED
            ), f"Endpoint {method} {endpoint} should require auth"


########################
# Parameter Validation Tests
########################


class TestUsersParameterValidation:
    """Test parameter validation for user endpoints"""

    def test_invalid_movie_id_type(self):
        """Test with invalid movie ID types"""
        invalid_movie_ids = ["invalid", "abc", "null", "undefined"]

        for invalid_id in invalid_movie_ids:
            # Test favorite endpoints
            response = client.put(f"/users/me/favorite/{invalid_id}")
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

            response = client.delete(f"/users/me/favorite/{invalid_id}")
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

            # Test watchlist endpoints
            response = client.put(f"/users/me/watchlist/{invalid_id}")
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

            response = client.delete(f"/users/me/watchlist/{invalid_id}")
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

            # Test rating endpoints
            response = client.put(f"/users/me/rating/{invalid_id}?rating=8")
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

            response = client.delete(f"/users/me/rating/{invalid_id}")
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_negative_movie_id(self):
        """Test with negative movie IDs"""
        negative_id = -1

        # All endpoints should handle negative IDs gracefully
        endpoints = [
            f"/users/me/favorite/{negative_id}",
            f"/users/me/watchlist/{negative_id}",
            f"/users/me/rating/{negative_id}",
        ]

        for endpoint in endpoints:
            # Test PUT and DELETE methods
            put_response = client.put(endpoint)
            delete_response = client.delete(endpoint)

            # Should either be 401 (auth required) or 422 (validation error)
            assert put_response.status_code in [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_422_UNPROCESSABLE_ENTITY,
            ]
            assert delete_response.status_code in [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_422_UNPROCESSABLE_ENTITY,
            ]

    def test_zero_movie_id(self):
        """Test with zero movie ID"""
        zero_id = 0

        endpoints = [
            f"/users/me/favorite/{zero_id}",
            f"/users/me/watchlist/{zero_id}",
            f"/users/me/rating/{zero_id}",
        ]

        for endpoint in endpoints:
            put_response = client.put(endpoint)
            delete_response = client.delete(endpoint)

            # Should either be 401 (auth required) or 422 (validation error)
            assert put_response.status_code in [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_422_UNPROCESSABLE_ENTITY,
            ]
            assert delete_response.status_code in [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_422_UNPROCESSABLE_ENTITY,
            ]


########################
# Rating Parameter Tests
########################


class TestRatingParameterValidation:
    """Test rating parameter validation"""

    def test_missing_rating_parameter(self):
        """Test rating endpoint without rating parameter"""
        response = client.put("/users/me/rating/123")
        # Should require rating parameter
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,  # Auth required first
            status.HTTP_422_UNPROCESSABLE_ENTITY,  # Missing rating parameter
        ]

    def test_invalid_rating_values(self):
        """Test rating endpoint with invalid rating values"""
        invalid_ratings = ["invalid", "abc", "null", "11", "-1", "0", "10.5"]

        for rating in invalid_ratings:
            response = client.put(f"/users/me/rating/123?rating={rating}")
            # Should validate rating parameter
            assert response.status_code in [
                status.HTTP_401_UNAUTHORIZED,  # Auth required first
                status.HTTP_422_UNPROCESSABLE_ENTITY,  # Invalid rating
            ]

    def test_valid_rating_range(self):
        """Test rating endpoint with valid rating values"""
        valid_ratings = ["1", "5", "10"]

        for rating in valid_ratings:
            response = client.put(f"/users/me/rating/123?rating={rating}")
            # Should require auth but accept valid ratings
            assert response.status_code == status.HTTP_401_UNAUTHORIZED


########################
# HTTP Methods Tests
########################


class TestUsersHTTPMethods:
    """Test correct HTTP methods are supported"""

    def test_get_me_only_supports_get(self):
        """Test /users/me only supports GET method"""
        # GET should work (but require auth)
        response = client.get("/users/me")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # Other methods should not be allowed
        response = client.post("/users/me")
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        response = client.put("/users/me")
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        response = client.delete("/users/me")
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_patch_me_supports_patch(self):
        """Test /users/me supports PATCH method"""
        response = client.patch("/users/me", json={})
        # Should require auth
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_recommendations_only_supports_post(self):
        """Test /users/me/recommendations only supports POST method"""
        # POST should work (but require auth)
        response = client.post("/users/me/recommendations")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # Other methods should not be allowed
        response = client.get("/users/me/recommendations")
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        response = client.put("/users/me/recommendations")
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        response = client.delete("/users/me/recommendations")
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_favorite_supports_put_and_delete(self):
        """Test favorite endpoints support PUT and DELETE"""
        movie_id = 123

        # PUT should work (but require auth)
        response = client.put(f"/users/me/favorite/{movie_id}")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # DELETE should work (but require auth)
        response = client.delete(f"/users/me/favorite/{movie_id}")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # Other methods should not be allowed
        response = client.get(f"/users/me/favorite/{movie_id}")
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        response = client.post(f"/users/me/favorite/{movie_id}")
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_watchlist_supports_put_and_delete(self):
        """Test watchlist endpoints support PUT and DELETE"""
        movie_id = 123

        # PUT should work (but require auth)
        response = client.put(f"/users/me/watchlist/{movie_id}")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # DELETE should work (but require auth)
        response = client.delete(f"/users/me/watchlist/{movie_id}")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # Other methods should not be allowed
        response = client.get(f"/users/me/watchlist/{movie_id}")
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        response = client.post(f"/users/me/watchlist/{movie_id}")
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_rating_supports_put_and_delete(self):
        """Test rating endpoints support PUT and DELETE"""
        movie_id = 123

        # PUT should work (but require auth)
        response = client.put(f"/users/me/rating/{movie_id}?rating=8")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # DELETE should work (but require auth)
        response = client.delete(f"/users/me/rating/{movie_id}")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # Other methods should not be allowed
        response = client.get(f"/users/me/rating/{movie_id}")
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        response = client.post(f"/users/me/rating/{movie_id}")
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


########################
# Edge Cases Tests
########################


class TestUsersEdgeCases:
    """Test edge cases and boundary conditions"""

    def test_very_large_movie_id(self):
        """Test with very large movie IDs"""
        large_id = 999999999

        endpoints = [
            f"/users/me/favorite/{large_id}",
            f"/users/me/watchlist/{large_id}",
            f"/users/me/rating/{large_id}",
        ]

        for endpoint in endpoints:
            put_response = client.put(endpoint)
            delete_response = client.delete(endpoint)

            # Should handle large IDs gracefully
            assert put_response.status_code in [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_422_UNPROCESSABLE_ENTITY,
            ]
            assert delete_response.status_code in [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_422_UNPROCESSABLE_ENTITY,
            ]

    def test_patch_me_with_empty_payload(self):
        """Test PATCH /users/me with empty payload"""
        response = client.patch("/users/me", json={})
        # Should require auth
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_patch_me_with_invalid_fields(self):
        """Test PATCH /users/me with invalid field names"""
        invalid_payload = {"invalid_field": "value", "another_invalid": 123}

        response = client.patch("/users/me", json=invalid_payload)
        # Should require auth first
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


########################
# Comprehensive Endpoint Test
########################


class TestAllUsersEndpoints:
    """Comprehensive test to ensure all user endpoints are working"""

    def test_all_user_endpoints_accessible(self):
        """Test that all user endpoints are accessible and don't return 404"""
        test_cases = [
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

        working_endpoints = 0

        for method, endpoint in test_cases:
            if method == "GET":
                response = client.get(endpoint)
            elif method == "POST":
                response = client.post(endpoint)
            elif method == "PUT":
                response = client.put(endpoint)
            elif method == "DELETE":
                response = client.delete(endpoint)
            elif method == "PATCH":
                response = client.patch(endpoint, json={})

            # Count endpoints that exist (not 404)
            if response.status_code != status.HTTP_404_NOT_FOUND:
                working_endpoints += 1

        # All endpoints should exist
        assert working_endpoints == len(
            test_cases
        ), f"Only {working_endpoints}/{len(test_cases)} user endpoints are accessible"

        # All should require authentication (return 401)
        auth_required_count = 0
        for method, endpoint in test_cases:
            if method == "GET":
                response = client.get(endpoint)
            elif method == "POST":
                response = client.post(endpoint)
            elif method == "PUT":
                response = client.put(endpoint)
            elif method == "DELETE":
                response = client.delete(endpoint)
            elif method == "PATCH":
                response = client.patch(endpoint, json={})

            if response.status_code == status.HTTP_401_UNAUTHORIZED:
                auth_required_count += 1

        # Most endpoints should require authentication
        assert (
            auth_required_count >= len(test_cases) * 0.8
        ), f"Only {auth_required_count}/{len(test_cases)} endpoints require authentication"
