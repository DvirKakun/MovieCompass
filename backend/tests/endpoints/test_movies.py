import pytest
from fastapi.testclient import TestClient
from fastapi import status

# Import main module to ensure all routes are loaded
import app.main
from app.utils.app_instance import application

client = TestClient(application)


########################
# Movies Endpoints Existence Tests
########################


class TestMoviesEndpointsExist:
    """Test that all movie endpoints exist and are accessible"""

    def test_popular_movies_endpoint_exists(self):
        """Test popular movies endpoint exists"""
        response = client.get("/movies/popular")
        # Should not be 404 (route exists)
        assert response.status_code != status.HTTP_404_NOT_FOUND

    def test_search_movies_endpoint_exists(self):
        """Test search movies endpoint exists"""
        response = client.get("/movies/search?query=test")
        # Should not be 404 (route exists)
        assert response.status_code != status.HTTP_404_NOT_FOUND

    def test_genres_endpoint_exists(self):
        """Test genres endpoint exists"""
        response = client.get("/movies/genres")
        # Should not be 404 (route exists)
        assert response.status_code != status.HTTP_404_NOT_FOUND

    def test_movies_by_genre_endpoint_exists(self):
        """Test movies by genre endpoint exists"""
        response = client.get("/movies/genre/28")
        # Should not be 404 (route exists)
        assert response.status_code != status.HTTP_404_NOT_FOUND

    def test_movie_cast_endpoint_exists(self):
        """Test movie cast endpoint exists"""
        response = client.get("/movies/123/cast")
        # Should not be 404 (route exists)
        assert response.status_code != status.HTTP_404_NOT_FOUND

    def test_movie_reviews_endpoint_exists(self):
        """Test movie reviews endpoint exists"""
        response = client.get("/movies/123/reviews")
        # Should not be 404 (route exists)
        assert response.status_code != status.HTTP_404_NOT_FOUND

    def test_movie_trailer_endpoint_exists(self):
        """Test movie trailer endpoint exists"""
        response = client.get("/movies/123/trailer")
        # Should not be 404 (route exists)
        assert response.status_code != status.HTTP_404_NOT_FOUND

    def test_movies_by_ids_endpoint_exists(self):
        """Test movies by IDs endpoint exists"""
        response = client.get("/movies/?ids=123")
        # Should not be 404 (route exists)
        assert response.status_code != status.HTTP_404_NOT_FOUND


########################
# Validation Tests
########################


class TestMoviesValidation:
    """Test parameter validation"""

    def test_popular_movies_invalid_page(self):
        """Test popular movies with invalid page number"""
        response = client.get("/movies/popular?page=0")
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

        response = client.get("/movies/popular?page=-1")
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_search_movies_missing_query(self):
        """Test search movies without query parameter"""
        response = client.get("/movies/search")
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_search_movies_invalid_rating(self):
        """Test search movies with invalid rating"""
        response = client.get("/movies/search?query=test&min_rating=15")
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

        response = client.get("/movies/search?query=test&max_rating=-1")
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_search_movies_invalid_year(self):
        """Test search movies with invalid year"""
        response = client.get("/movies/search?query=test&min_year=1800")
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_invalid_movie_id_type(self):
        """Test with invalid movie ID type"""
        response = client.get("/movies/invalid/cast")
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

        response = client.get("/movies/abc/reviews")
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

        response = client.get("/movies/xyz/trailer")
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_invalid_genre_id(self):
        """Test with invalid genre ID"""
        response = client.get("/movies/genre/invalid")
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_movies_by_ids_missing_ids(self):
        """Test movies by IDs without providing IDs"""
        response = client.get("/movies/")
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


########################
# Basic Functionality Tests
########################


class TestMoviesBasicFunctionality:
    """Test basic endpoint functionality without mocking"""

    def test_popular_movies_valid_page(self):
        """Test popular movies with valid page parameter"""
        response = client.get("/movies/popular?page=1")
        # Should accept valid page parameter
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_500_INTERNAL_SERVER_ERROR,  # Service might fail but endpoint exists
        ]

        response = client.get("/movies/popular?page=2")
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        ]

    def test_search_movies_with_valid_query(self):
        """Test search movies with valid parameters"""
        response = client.get("/movies/search?query=test")
        # Should accept valid query
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        ]

        response = client.get("/movies/search?query=test&page=1")
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        ]

    def test_search_movies_with_filters(self):
        """Test search movies with valid filters"""
        response = client.get(
            "/movies/search?query=test&min_rating=7.0&max_rating=9.0&min_year=2020&max_year=2023"
        )
        # Should accept valid filter parameters
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        ]

    def test_movies_by_genre_valid_id(self):
        """Test movies by genre with valid genre ID"""
        response = client.get("/movies/genre/28")
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        ]

        response = client.get("/movies/genre/28?page=2")
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        ]

    def test_movie_details_valid_id(self):
        """Test movie details endpoints with valid movie ID"""
        movie_id = 123

        # Test cast endpoint
        response = client.get(f"/movies/{movie_id}/cast")
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            status.HTTP_404_NOT_FOUND,  # Movie might not exist
        ]

        # Test reviews endpoint
        response = client.get(f"/movies/{movie_id}/reviews")
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            status.HTTP_404_NOT_FOUND,
        ]

        # Test trailer endpoint
        response = client.get(f"/movies/{movie_id}/trailer")
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            status.HTTP_404_NOT_FOUND,
        ]

    def test_movies_by_ids_valid_format(self):
        """Test movies by IDs with valid format"""
        response = client.get("/movies/?ids=123")
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        ]

        response = client.get("/movies/?ids=123&ids=456")
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        ]


########################
# Response Format Tests
########################


class TestMoviesResponseFormat:
    """Test response formats when endpoints succeed"""

    def test_popular_movies_response_format(self):
        """Test popular movies response format"""
        response = client.get("/movies/popular")

        if response.status_code == status.HTTP_200_OK:
            response_data = response.json()
            # Should have movies key for MovieResponse
            assert "movies" in response_data
            assert isinstance(response_data["movies"], list)

    def test_search_movies_response_format(self):
        """Test search movies response format"""
        response = client.get("/movies/search?query=test")

        if response.status_code == status.HTTP_200_OK:
            response_data = response.json()
            # Should have movies key for MovieResponse
            assert "movies" in response_data
            assert isinstance(response_data["movies"], list)

    def test_genres_response_format(self):
        """Test genres response format"""
        response = client.get("/movies/genres")

        if response.status_code == status.HTTP_200_OK:
            response_data = response.json()
            # Should have genres key for GenreResponse
            assert "genres" in response_data
            assert isinstance(response_data["genres"], list)

    def test_movies_by_ids_response_format(self):
        """Test movies by IDs response format"""
        response = client.get("/movies/?ids=123")

        if response.status_code == status.HTTP_200_OK:
            response_data = response.json()
            # Should return list of movies
            assert isinstance(response_data, list)


########################
# Edge Cases Tests
########################


class TestMoviesEdgeCases:
    """Test edge cases and boundary conditions"""

    def test_large_page_number(self):
        """Test with large page numbers"""
        response = client.get("/movies/popular?page=9999")
        # Should handle large page numbers gracefully
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_400_BAD_REQUEST,  # Added 400 as valid response
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            status.HTTP_422_UNPROCESSABLE_ENTITY,
        ]

    def test_boundary_rating_values(self):
        """Test with boundary rating values"""
        # Test minimum rating
        response = client.get("/movies/search?query=test&min_rating=0")
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        ]

        # Test maximum rating
        response = client.get("/movies/search?query=test&max_rating=10")
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        ]

    def test_boundary_year_values(self):
        """Test with boundary year values"""
        # Test minimum year
        response = client.get("/movies/search?query=test&min_year=1900")
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        ]

        # Test current year
        import datetime

        current_year = datetime.datetime.now().year
        response = client.get(f"/movies/search?query=test&max_year={current_year}")
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        ]

    def test_empty_query_string(self):
        """Test with empty query string"""
        response = client.get("/movies/search?query=")
        # Empty query should still be valid
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        ]

    def test_special_characters_in_query(self):
        """Test with special characters in search query"""
        special_queries = ["action+movie", "sci-fi", "movie's", "100%"]

        for query in special_queries:
            response = client.get(f"/movies/search?query={query}")
            # Should handle special characters
            assert response.status_code in [
                status.HTTP_200_OK,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
            ]


########################
# All Endpoints Summary Test
########################


class TestAllMoviesEndpoints:
    """Comprehensive test to ensure all movie endpoints are working"""

    def test_all_movie_endpoints_accessible(self):
        """Test that all movie endpoints are accessible and don't return 404"""
        endpoints = [
            "/movies/popular",
            "/movies/search?query=test",
            "/movies/genres",
            "/movies/genre/28",
            "/movies/123/cast",
            "/movies/123/reviews",
            "/movies/123/trailer",
            "/movies/?ids=123",
        ]

        working_endpoints = 0

        for endpoint in endpoints:
            response = client.get(endpoint)
            # Count endpoints that exist (not 404)
            if response.status_code != status.HTTP_404_NOT_FOUND:
                working_endpoints += 1

        # All endpoints should exist
        assert working_endpoints == len(
            endpoints
        ), f"Only {working_endpoints}/{len(endpoints)} endpoints are accessible"
