import re
from pydantic import BaseModel, field_validator

class SharedValidators(BaseModel):
    @field_validator("username", mode="before", check_fields=False)
    @classmethod
    def validate_username(cls, value: str):
        if not re.fullmatch(r"^[a-zA-Z0-9_]+$", value):
            raise ValueError("Username must be alphanumeric and can include underscores")
        if not (3 <= len(value) <= 20):
            raise ValueError("Username must be between 3 and 20 characters")
        return value

    @field_validator("password", "new_password", mode="before", check_fields=False)
    @classmethod
    def validate_password(cls, value: str):
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if len(value) > 100:
            raise ValueError("Password must not exceed 100 characters")
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter")
        return value

    @field_validator("first_name", "last_name", mode="before", check_fields=False)
    @classmethod
    def validate_name(cls, value: str):
        if not (2 <= len(value) <= 30):
            raise ValueError("Name must be between 2 and 30 characters")
        return value

    @field_validator("phone_number", mode="before", check_fields=False)
    @classmethod
    def validate_phone_number(cls, value: str):
        if not re.fullmatch(r"^\+?\d{9,15}$", value):
            raise ValueError("Phone number must be in international format (e.g. +1234567890)")
        return value