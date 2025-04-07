import re
from pydantic import BaseModel, validator, model_validator

class SharedValidators(BaseModel):
    
    @model_validator(mode="after")
    def check_password_confirmation(cls, values):
        pw = getattr(values, "new_password", None)
        confirm = getattr(values, "new_password_confirm", None)

        if pw:
            if not confirm:
                raise ValueError("Confirm password is required when setting a new password")
            if pw != confirm:
                raise ValueError("New password and confirmation do not match")
            
        return values

    @validator("username", check_fields=False)
    def validate_username(cls, value: str):
        if not re.fullmatch(r"^[a-zA-Z0-9_]+$", value):
            raise ValueError("Username must be alphanumeric and can include underscores")
        if not (3 <= len(value) <= 20):
            raise ValueError("Username must be between 3 and 20 characters")
        
        return value

    @validator("password", "new_password", check_fields=False)
    def validate_password(cls, value: str):
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if len(value) > 100:
            raise ValueError("Password must not exceed 100 characters")
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter")
        
        return value

    @validator("first_name", "last_name", check_fields=False)
    def validate_name(cls, value: str):
        if not (2 <= len(value) <= 30):
            raise ValueError("Name must be between 2 and 30 characters")
        
        return value

    @validator("phone_number", check_fields=False)
    def validate_phone_number(cls, value: str):
        if not re.fullmatch(r"^\+?\d{9,15}$", value):
            raise ValueError("Phone number must be in international format (e.g. +1234567890)")
        
        return value