import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import HTTPException, BackgroundTasks
from app.core.config import settings
from app.services.security import create_access_token
from datetime import timedelta


def auth_email_create_token_and_send_email(
    user_id: str, email: str, background_tasks: BackgroundTasks
):
    token = create_access_token(
        data={"sub": user_id, "new_email": email},
        expires_delta=timedelta(minutes=settings.EMAIL_ACCESS_TOKEN_EXPIRE_HOURS),
    )

    verification_link = f"{settings.FRONTEND_URL}/auth/verify-email?token={token}"

    background_tasks.add_task(send_verification_email, email, verification_link)


def forgot_password_create_token_and_send_email(
    user_id: str, email: str, background_tasks: BackgroundTasks
):
    token = create_access_token(
        data={"sub": user_id},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    verification_link = f"{settings.FRONTEND_URL}/auth/reset-password?token={token}"

    background_tasks.add_task(send_reset_password_email, email, verification_link)


def send_verification_email(recipient: str, verification_link: str):
    """
    Sends a verification email to the recipient with the provided link.
    """
    subject = "Verify Your Email Address - MovieCompass"
    body = (
        f"Hello,\n\n"
        f"Please verify your email address by clicking on the link below:\n\n"
        f"{verification_link}\n\n"
        f"If you did not sign up for our service, please ignore this email.\n\n"
        f"Thank you!"
    )

    # Create email message
    message = MIMEMultipart()
    message["From"] = settings.EMAIL_FROM
    message["To"] = recipient
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    try:
        # Connect to the SMTP server
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls()  # Upgrade the connection to secure
            server.login(settings.EMAIL_USERNAME, settings.EMAIL_PASSWORD)
            server.sendmail(settings.EMAIL_FROM, recipient, message.as_string())
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to send verification email: {str(e)}"
        )


def send_reset_password_email(recipient: str, reset_link: str):
    """
    Sends a password reset email to the recipient with the provided reset link.
    """
    subject = "Reset Your Password - MovieCompass"
    body = (
        f"Hello,\n\n"
        f"We received a request to reset your password. You can reset it by clicking the link below:\n\n"
        f"{reset_link}\n\n"
        f"If you did not request a password reset, you can safely ignore this email.\n\n"
        f"Thank you,\n"
        f"The MovieCompass Team"
    )

    message = MIMEMultipart()
    message["From"] = settings.EMAIL_FROM
    message["To"] = recipient
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.EMAIL_USERNAME, settings.EMAIL_PASSWORD)
            server.sendmail(settings.EMAIL_FROM, recipient, message.as_string())
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to send password reset email: {str(e)}"
        )
