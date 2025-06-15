import pytest
from unittest.mock import patch, MagicMock
from fastapi import BackgroundTasks, HTTPException

from app.services.email import (
    auth_email_create_token_and_send_email,
    forgot_password_create_token_and_send_email,
    send_verification_email,
    send_reset_password_email,
)
from app.services import email as email_module  # gives us the real settings object

# -------------------------------------------------------------------
# Shared test data
# -------------------------------------------------------------------
USER_ID = "user_123"
EMAIL = "user@example.com"
TOKEN = "mocked_token"
# The value we WANT settings.FRONTEND_URL to have while these tests run
TEST_FRONTEND_URL = "https://moviecompass.com"


# -------------------------------------------------------------------
# Helper
# -------------------------------------------------------------------
def single_task(background_tasks: BackgroundTasks):
    """Return the only task and assert exactly one was scheduled."""
    assert len(background_tasks.tasks) == 1, "Expected exactly one background task"
    return background_tasks.tasks[0]


# -------------------------------------------------------------------
# auth_email_create_token_and_send_email
# -------------------------------------------------------------------
@patch("app.services.email.create_access_token", return_value=TOKEN)
def test_auth_email_create_token_and_send_email(mock_create):
    bgtasks = BackgroundTasks()

    with (
        patch.object(email_module.settings, "FRONTEND_URL", TEST_FRONTEND_URL),
        patch("app.services.email.send_verification_email") as mock_send,
    ):
        auth_email_create_token_and_send_email(USER_ID, EMAIL, bgtasks)

        task = single_task(bgtasks)
        # function reference & parameters scheduled for background execution
        assert task.func is mock_send
        assert task.args == (
            EMAIL,
            f"{TEST_FRONTEND_URL}/auth/verify-email?token={TOKEN}",
        )

    mock_create.assert_called_once()


# -------------------------------------------------------------------
# forgot_password_create_token_and_send_email
# -------------------------------------------------------------------
@patch("app.services.email.create_access_token", return_value=TOKEN)
def test_forgot_password_create_token_and_send_email(mock_create):
    bgtasks = BackgroundTasks()

    with (
        patch.object(email_module.settings, "FRONTEND_URL", TEST_FRONTEND_URL),
        patch("app.services.email.send_reset_password_email") as mock_send,
    ):
        forgot_password_create_token_and_send_email(USER_ID, EMAIL, bgtasks)

        task = single_task(bgtasks)
        assert task.func is mock_send
        assert task.args == (
            EMAIL,
            f"{TEST_FRONTEND_URL}/auth/reset-password?token={TOKEN}",
        )

    mock_create.assert_called_once()


# -------------------------------------------------------------------
# send_verification_email  –  SMTP happy-path
# -------------------------------------------------------------------
@patch("smtplib.SMTP")
@patch("app.services.email.settings")
def test_send_verification_email_success(mock_settings, mock_smtp):
    smtp = MagicMock()
    mock_smtp.return_value.__enter__.return_value = smtp

    # minimal fields used inside the function
    mock_settings.EMAIL_FROM = "noreply@mc.com"
    mock_settings.SMTP_SERVER = "smtp.test"
    mock_settings.SMTP_PORT = 587
    mock_settings.EMAIL_USERNAME = "user"
    mock_settings.EMAIL_PASSWORD = "pw"

    send_verification_email(EMAIL, "https://link")

    smtp.starttls.assert_called_once()
    smtp.login.assert_called_once_with("user", "pw")
    smtp.sendmail.assert_called_once()


# -------------------------------------------------------------------
# send_reset_password_email  –  SMTP happy-path
# -------------------------------------------------------------------
@patch("smtplib.SMTP")
@patch("app.services.email.settings")
def test_send_reset_password_email_success(mock_settings, mock_smtp):
    smtp = MagicMock()
    mock_smtp.return_value.__enter__.return_value = smtp

    mock_settings.EMAIL_FROM = "noreply@mc.com"
    mock_settings.SMTP_SERVER = "smtp.test"
    mock_settings.SMTP_PORT = 587
    mock_settings.EMAIL_USERNAME = "user"
    mock_settings.EMAIL_PASSWORD = "pw"

    send_reset_password_email(EMAIL, "https://link")

    smtp.starttls.assert_called_once()
    smtp.login.assert_called_once_with("user", "pw")
    smtp.sendmail.assert_called_once()


# -------------------------------------------------------------------
# SMTP failure paths
# -------------------------------------------------------------------
@patch("smtplib.SMTP", side_effect=Exception("SMTP failure"))
@patch("app.services.email.settings")
def test_send_verification_email_failure(mock_settings, _mock_smtp):
    mock_settings.EMAIL_FROM = "x"
    mock_settings.SMTP_SERVER = "x"
    mock_settings.SMTP_PORT = 587
    mock_settings.EMAIL_USERNAME = "x"
    mock_settings.EMAIL_PASSWORD = "x"

    with pytest.raises(HTTPException) as exc:
        send_verification_email(EMAIL, "link")

    assert exc.value.status_code == 500
    assert "Failed to send verification email" in str(exc.value.detail)


@patch("smtplib.SMTP", side_effect=Exception("SMTP failure"))
@patch("app.services.email.settings")
def test_send_reset_password_email_failure(mock_settings, _mock_smtp):
    mock_settings.EMAIL_FROM = "x"
    mock_settings.SMTP_SERVER = "x"
    mock_settings.SMTP_PORT = 587
    mock_settings.EMAIL_USERNAME = "x"
    mock_settings.EMAIL_PASSWORD = "x"

    with pytest.raises(HTTPException) as exc:
        send_reset_password_email(EMAIL, "link")

    assert exc.value.status_code == 500
    assert "Failed to send password reset email" in str(exc.value.detail)
