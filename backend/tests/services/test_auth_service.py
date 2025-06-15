import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi import HTTPException, status, BackgroundTasks
from datetime import timedelta

from app.services.auth import (
    authenticate_google_user,
    authenticate_user,
    authenticate_email,
    authenticate_user_reset_password,
    get_user_from_google,
    resend_verification_email,
    forgot_password_handler,
)
from app.schemas.user import (
    User,
    UserTokenResponse,
    UserResponse,
    ForgotPasswordRequest,
)
from app.services.security import pwd_context


########################
# Test Data & Fixtures
########################

# Sample user data
SAMPLE_USER = User(
    id="test_user_id",
    username="testuser",
    email="test@example.com",
    first_name="Test",
    last_name="User",
    phone_number="+1234567890",
    hashed_password=pwd_context.hash("TestPassword123"),
    is_verified=True,
    favorite_movies=[],
    watchlist=[],
    ratings=[],
)

UNVERIFIED_USER = User(
    id="unverified_user_id",
    username="unverified",
    email="unverified@example.com",
    first_name="Unverified",
    last_name="User",
    phone_number="+1234567890",
    hashed_password=pwd_context.hash("TestPassword123"),
    is_verified=False,
    favorite_movies=[],
    watchlist=[],
    ratings=[],
)

GOOGLE_USER_INFO = {
    "sub": "google_user_id",
    "email": "google@example.com",
    "given_name": "Google",
    "family_name": "User",
    "name": "Google User",
    "picture": "https://example.com/photo.jpg",
}


########################
# authenticate_google_user Tests
########################


class TestAuthenticateGoogleUser:

    @patch("app.services.auth.create_access_token")
    @patch("app.services.auth.create_or_update_google_user")
    @patch("app.services.auth.get_user_from_google")
    @pytest.mark.asyncio
    async def test_authenticate_google_user_success(
        self, mock_get_user, mock_create_user, mock_create_token
    ):
        """Test successful Google user authentication"""
        # Setup mocks
        mock_get_user.return_value = GOOGLE_USER_INFO
        mock_create_user.return_value = SAMPLE_USER
        mock_create_token.return_value = "test_access_token"

        # Test
        result = await authenticate_google_user("test_auth_code")

        # Assertions
        assert isinstance(result, UserTokenResponse)
        assert result.access_token == "test_access_token"
        assert result.token_type == "bearer"
        assert result.user == SAMPLE_USER

        # Verify function calls
        mock_get_user.assert_called_once_with("test_auth_code")
        mock_create_user.assert_called_once_with(GOOGLE_USER_INFO)
        mock_create_token.assert_called_once()

    @patch("app.services.auth.get_user_from_google")
    @pytest.mark.asyncio
    async def test_authenticate_google_user_invalid_code(self, mock_get_user):
        """Test Google authentication with invalid code"""
        # Setup mock to raise exception
        mock_get_user.side_effect = HTTPException(
            status_code=400,
            detail={"field": "token", "message": "Error retrieving access token"},
        )

        # Test and assert exception
        with pytest.raises(HTTPException) as exc_info:
            await authenticate_google_user("invalid_code")

        assert exc_info.value.status_code == 400


########################
# authenticate_user Tests
########################


class TestAuthenticateUser:

    @patch("app.services.auth.create_access_token")
    @patch("app.services.auth.verify_password")
    @patch("app.services.auth.get_user")
    def test_authenticate_user_success(
        self, mock_get_user, mock_verify_password, mock_create_token
    ):
        """Test successful user authentication"""
        # Setup mocks
        mock_get_user.return_value = SAMPLE_USER
        mock_verify_password.return_value = True
        mock_create_token.return_value = "test_access_token"

        # Test
        result = authenticate_user("testuser", "TestPassword123")

        # Assertions
        assert isinstance(result, UserTokenResponse)
        assert result.access_token == "test_access_token"
        assert result.token_type == "bearer"
        assert result.user == SAMPLE_USER

        # Verify function calls
        mock_get_user.assert_called_once_with("testuser")
        mock_verify_password.assert_called_once_with(
            "TestPassword123", SAMPLE_USER.hashed_password
        )
        mock_create_token.assert_called_once()

    @patch("app.services.auth.verify_password")
    @patch("app.services.auth.get_user")
    def test_authenticate_user_wrong_password(
        self, mock_get_user, mock_verify_password
    ):
        """Test authentication with wrong password"""
        # Setup mocks
        mock_get_user.return_value = SAMPLE_USER
        mock_verify_password.return_value = False

        # Test and assert exception
        with pytest.raises(HTTPException) as exc_info:
            authenticate_user("testuser", "wrong_password")

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Incorrect username or password" in str(exc_info.value.detail)

    @patch("app.services.auth.verify_password")
    @patch("app.services.auth.get_user")
    def test_authenticate_user_unverified(self, mock_get_user, mock_verify_password):
        """Test authentication with unverified user"""
        # Setup mocks
        mock_get_user.return_value = UNVERIFIED_USER
        mock_verify_password.return_value = True

        # Test and assert exception
        with pytest.raises(HTTPException) as exc_info:
            authenticate_user("unverified", "TestPassword123")

        assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN
        assert "Please verify your email" in str(exc_info.value.detail)

    @patch("app.services.auth.get_user")
    def test_authenticate_user_not_found(self, mock_get_user):
        """Test authentication with non-existent user"""
        # Setup mock to raise exception
        mock_get_user.side_effect = HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"field": "username", "message": "Incorrect username or password"},
        )

        # Test and assert exception
        with pytest.raises(HTTPException) as exc_info:
            authenticate_user("nonexistent", "password")

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND


########################
# authenticate_email Tests
########################


class TestAuthenticateEmail:

    @patch("app.services.auth.find_user_by_id")
    @patch("app.services.auth.verify_user_email_token")
    def test_authenticate_email_success(self, mock_verify_token, mock_find_user):
        """Test successful email authentication"""
        # Setup mocks
        mock_verify_token.return_value = {
            "id": "test_user_id",
            "new_email": "new@example.com",
        }
        mock_find_user.return_value = SAMPLE_USER

        # Test
        result = authenticate_email("valid_token")

        # Assertions
        assert isinstance(result, User)
        assert result.email == "new@example.com"

        # Verify function calls
        mock_verify_token.assert_called_once_with("valid_token")
        mock_find_user.assert_called_once_with("test_user_id")

    @patch("app.services.auth.find_user_by_id")
    @patch("app.services.auth.verify_user_email_token")
    def test_authenticate_email_user_not_found(self, mock_verify_token, mock_find_user):
        """Test email authentication when user not found"""
        # Setup mocks
        mock_verify_token.return_value = {
            "id": "nonexistent_user_id",
            "new_email": "new@example.com",
        }
        mock_find_user.return_value = None

        # Test and assert exception
        with pytest.raises(HTTPException) as exc_info:
            authenticate_email("valid_token")

        assert exc_info.value.status_code == 404
        assert "User not found" in str(exc_info.value.detail)

    @patch("app.services.auth.verify_user_email_token")
    def test_authenticate_email_invalid_token(self, mock_verify_token):
        """Test email authentication with invalid token"""
        # Setup mock to raise exception
        mock_verify_token.side_effect = HTTPException(
            status_code=400,
            detail={"field": "token", "message": "Invalid or expired token"},
        )

        # Test and assert exception
        with pytest.raises(HTTPException) as exc_info:
            authenticate_email("invalid_token")

        assert exc_info.value.status_code == 400


########################
# authenticate_user_reset_password Tests
########################


class TestAuthenticateUserResetPassword:

    @patch("app.services.auth.find_user_by_id")
    @patch("app.services.auth.verify_user_token")
    def test_authenticate_user_reset_password_success(
        self, mock_verify_token, mock_find_user
    ):
        """Test successful reset password authentication"""
        # Setup mocks
        mock_verify_token.return_value = "test_user_id"
        mock_find_user.return_value = SAMPLE_USER

        # Test
        result = authenticate_user_reset_password("valid_reset_token")

        # Assertions
        assert isinstance(result, User)
        assert result == SAMPLE_USER

        # Verify function calls
        mock_verify_token.assert_called_once_with("valid_reset_token")
        mock_find_user.assert_called_once_with("test_user_id")

    @patch("app.services.auth.find_user_by_id")
    @patch("app.services.auth.verify_user_token")
    def test_authenticate_user_reset_password_user_not_found(
        self, mock_verify_token, mock_find_user
    ):
        """Test reset password authentication when user not found"""
        # Setup mocks
        mock_verify_token.return_value = "nonexistent_user_id"
        mock_find_user.return_value = None

        # Test and assert exception
        with pytest.raises(HTTPException) as exc_info:
            authenticate_user_reset_password("valid_token")

        assert exc_info.value.status_code == 404
        assert "User not found" in str(exc_info.value.detail)

    @patch("app.services.auth.verify_user_token")
    def test_authenticate_user_reset_password_invalid_token(self, mock_verify_token):
        """Test reset password authentication with invalid token"""
        # Setup mock to raise exception
        mock_verify_token.side_effect = HTTPException(
            status_code=400,
            detail={"field": "token", "message": "Invalid or expired token"},
        )

        # Test and assert exception
        with pytest.raises(HTTPException) as exc_info:
            authenticate_user_reset_password("invalid_token")

        assert exc_info.value.status_code == 400


########################
# get_user_from_google Tests
########################


class TestGetUserFromGoogle:

    @patch("app.core.config.settings")
    @pytest.mark.asyncio
    async def test_get_user_from_google_success(self, mock_settings):
        """Test successful Google user info retrieval"""
        # Setup settings
        mock_settings.GOOGLE_CLIENT_ID = "test_client_id"
        mock_settings.GOOGLE_CLIENT_SECRET = "test_client_secret"
        mock_settings.GOOGLE_REDIRECT_URI = "http://localhost:3000/callback"
        mock_settings.GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
        mock_settings.GOOGLE_USERINFO_ENDPOINT = (
            "https://www.googleapis.com/oauth2/v3/userinfo"
        )

        # Mock httpx responses
        with patch("httpx.AsyncClient") as mock_client:
            # Mock context manager
            mock_async_client = AsyncMock()
            mock_client.return_value.__aenter__.return_value = mock_async_client
            mock_client.return_value.__aexit__.return_value = None

            # Mock token response
            token_response = MagicMock()
            token_response.json.return_value = {"access_token": "test_token"}
            mock_async_client.post.return_value = token_response

            # Mock user info response
            userinfo_response = MagicMock()
            userinfo_response.json.return_value = GOOGLE_USER_INFO
            mock_async_client.get.return_value = userinfo_response

            # Test
            result = await get_user_from_google("test_auth_code")

            # Assertions
            assert result == GOOGLE_USER_INFO

            # Verify calls
            mock_async_client.post.assert_called_once()
            mock_async_client.get.assert_called_once()

    @patch("app.core.config.settings")
    @pytest.mark.asyncio
    async def test_get_user_from_google_token_error(self, mock_settings):
        """Test Google user info retrieval with token error"""
        # Setup settings
        mock_settings.GOOGLE_CLIENT_ID = "test_client_id"
        mock_settings.GOOGLE_CLIENT_SECRET = "test_client_secret"
        mock_settings.GOOGLE_REDIRECT_URI = "http://localhost:3000/callback"
        mock_settings.GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"

        # Mock httpx responses
        with patch("httpx.AsyncClient") as mock_client:
            # Mock context manager
            mock_async_client = AsyncMock()
            mock_client.return_value.__aenter__.return_value = mock_async_client
            mock_client.return_value.__aexit__.return_value = None

            # Mock error token response
            token_response = MagicMock()
            token_response.json.return_value = {"error": "invalid_grant"}
            mock_async_client.post.return_value = token_response

            # Test and assert exception
            with pytest.raises(HTTPException) as exc_info:
                await get_user_from_google("invalid_code")

            assert exc_info.value.status_code == 400
            assert "Error retrieving access token" in str(exc_info.value.detail)


########################
# resend_verification_email Tests
########################


class TestResendVerificationEmail:

    @patch("app.services.auth.auth_email_create_token_and_send_email")
    @patch("app.services.auth.find_user_by_email")
    def test_resend_verification_email_success(self, mock_find_user, mock_send_email):
        """Test successful verification email resend"""
        # Setup mocks
        mock_find_user.return_value = UNVERIFIED_USER
        background_tasks = MagicMock(spec=BackgroundTasks)

        # Test
        result = resend_verification_email("unverified@example.com", background_tasks)

        # Assertions
        assert isinstance(result, UserResponse)
        assert "Verification email has been resent" in result.message
        assert result.user == UNVERIFIED_USER

        # Verify function calls
        mock_find_user.assert_called_once_with("unverified@example.com")
        mock_send_email.assert_called_once_with(
            UNVERIFIED_USER.id, UNVERIFIED_USER.email, background_tasks
        )

    @patch("app.services.auth.find_user_by_email")
    def test_resend_verification_email_user_not_found(self, mock_find_user):
        """Test verification email resend when user not found"""
        # Setup mock
        mock_find_user.return_value = None
        background_tasks = MagicMock(spec=BackgroundTasks)

        # Test and assert exception
        with pytest.raises(HTTPException) as exc_info:
            resend_verification_email("nonexistent@example.com", background_tasks)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "User not found" in str(exc_info.value.detail)

    @patch("app.services.auth.find_user_by_email")
    def test_resend_verification_email_already_verified(self, mock_find_user):
        """Test verification email resend for already verified user"""
        # Setup mock
        mock_find_user.return_value = SAMPLE_USER  # Already verified
        background_tasks = MagicMock(spec=BackgroundTasks)

        # Test and assert exception
        with pytest.raises(HTTPException) as exc_info:
            resend_verification_email("test@example.com", background_tasks)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "Email already verified" in str(exc_info.value.detail)


########################
# forgot_password_handler Tests
########################


class TestForgotPasswordHandler:

    @patch("app.services.auth.forgot_password_create_token_and_send_email")
    @patch("app.services.auth.find_user_by_email")
    def test_forgot_password_handler_success(self, mock_find_user, mock_send_email):
        """Test successful forgot password request"""
        # Setup mocks
        mock_find_user.return_value = SAMPLE_USER
        background_tasks = MagicMock(spec=BackgroundTasks)
        request = ForgotPasswordRequest(email="test@example.com")

        # Test
        result = forgot_password_handler(request, background_tasks)

        # Assertions
        assert isinstance(result, UserResponse)
        assert "Password reset email has been sent" in result.message
        assert result.user == SAMPLE_USER

        # Verify function calls
        mock_find_user.assert_called_once_with("test@example.com")
        mock_send_email.assert_called_once_with(
            SAMPLE_USER.id, SAMPLE_USER.email, background_tasks
        )

    @patch("app.services.auth.find_user_by_email")
    def test_forgot_password_handler_user_not_found(self, mock_find_user):
        """Test forgot password when user not found"""
        # Setup mock
        mock_find_user.return_value = None
        background_tasks = MagicMock(spec=BackgroundTasks)
        request = ForgotPasswordRequest(email="nonexistent@example.com")

        # Test and assert exception
        with pytest.raises(HTTPException) as exc_info:
            forgot_password_handler(request, background_tasks)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "User not found" in str(exc_info.value.detail)


########################
# Integration Tests
########################


class TestAuthServiceIntegration:
    """Test integration scenarios across multiple functions"""

    @patch("app.services.auth.create_access_token")
    @patch("app.services.auth.verify_password")
    @patch("app.services.auth.get_user")
    def test_full_authentication_flow(
        self, mock_get_user, mock_verify_password, mock_create_token
    ):
        """Test complete authentication flow"""
        # Setup mocks
        mock_get_user.return_value = SAMPLE_USER
        mock_verify_password.return_value = True
        mock_create_token.return_value = "integration_test_token"

        # Test authentication
        result = authenticate_user("testuser", "TestPassword123")

        # Assertions
        assert result.access_token == "integration_test_token"
        assert result.user.username == "testuser"
        assert result.user.is_verified == True

    @patch("app.services.auth.auth_email_create_token_and_send_email")
    @patch("app.services.auth.find_user_by_email")
    def test_verification_email_flow(self, mock_find_user, mock_send_email):
        """Test verification email flow"""
        # Setup mocks
        mock_find_user.return_value = UNVERIFIED_USER
        background_tasks = MagicMock(spec=BackgroundTasks)

        # Test resend verification
        result = resend_verification_email("unverified@example.com", background_tasks)

        # Assertions
        assert result.user.is_verified == False
        assert "resent" in result.message.lower()


########################
# Error Handling Tests
########################


class TestAuthServiceErrorHandling:
    """Test error handling scenarios"""

    def test_authenticate_user_with_none_values(self):
        """Test authentication with None values"""
        with pytest.raises((HTTPException, AttributeError, TypeError)):
            authenticate_user(None, "password")

        with pytest.raises((HTTPException, AttributeError, TypeError)):
            authenticate_user("username", None)

    def test_authenticate_email_with_empty_token(self):
        """Test email authentication with empty token"""
        with pytest.raises(HTTPException):
            authenticate_email("")

    def test_resend_verification_with_invalid_email(self):
        """Test verification resend with invalid email format"""
        background_tasks = MagicMock(spec=BackgroundTasks)

        # This would normally be caught by pydantic validation, but test service level
        with patch("app.services.auth.find_user_by_email") as mock_find:
            mock_find.return_value = None

            with pytest.raises(HTTPException):
                resend_verification_email("invalid-email", background_tasks)
