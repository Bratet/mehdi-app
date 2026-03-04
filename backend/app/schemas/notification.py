from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    type: str
    title: str
    message: str
    is_read: bool
    metadata: dict | None = None
    created_at: str | None = None
