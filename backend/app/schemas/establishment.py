from pydantic import BaseModel, ConfigDict


class EstablishmentCreate(BaseModel):
    name: str
    slug: str
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    logo_url: str | None = None


class EstablishmentUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    logo_url: str | None = None
    is_active: bool | None = None


class EstablishmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    logo_url: str | None = None
    is_active: bool


class EstablishmentSettingsUpdate(BaseModel):
    currency: str | None = None
    vat_rate: float | None = None
    opening_time: str | None = None
    closing_time: str | None = None
    pause_limit_minutes: int | None = None
    alert_intervals: list[int] | None = None
    solo_rate_per_hour: float | None = None
    multiplayer_rate_per_hour: float | None = None
    booking_enabled: bool | None = None
    booking_deposit_required: bool | None = None
    booking_deposit_amount: float | None = None
    loyalty_enabled: bool | None = None
    loyalty_points_per_currency: float | None = None


class EstablishmentSettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    establishment_id: str
    currency: str
    vat_rate: float
    opening_time: str
    closing_time: str
    pause_limit_minutes: int
    solo_rate_per_hour: float
    multiplayer_rate_per_hour: float
    booking_enabled: bool
    loyalty_enabled: bool
