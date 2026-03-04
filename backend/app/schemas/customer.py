from pydantic import BaseModel, ConfigDict


class CustomerCreate(BaseModel):
    first_name: str
    last_name: str
    email: str | None = None
    phone: str | None = None


class CustomerUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    phone: str | None = None


class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    first_name: str
    last_name: str
    email: str | None = None
    phone: str | None = None
    credit_balance: float
