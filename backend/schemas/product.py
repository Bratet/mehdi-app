from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    image_url: Optional[str] = None
    in_stock: bool = True


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    in_stock: Optional[bool] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    category: str
    price: float
    image_url: Optional[str] = None
    in_stock: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
