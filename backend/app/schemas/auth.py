from pydantic import BaseModel, EmailStr, ConfigDict


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    role: str = "cashier"
    establishment_id: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: "UserResponse"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool
    establishment_id: str | None = None
    created_at: str | None = None
