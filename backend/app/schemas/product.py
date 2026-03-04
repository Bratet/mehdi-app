from pydantic import BaseModel, ConfigDict


class CategoryCreate(BaseModel):
    name: str
    icon: str | None = None
    sort_order: int = 0


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    icon: str | None = None
    sort_order: int


class ProductCreate(BaseModel):
    category_id: str
    name: str
    description: str | None = None
    price: float
    image_url: str | None = None
    stock_quantity: int = 0
    low_stock_threshold: int = 5


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    image_url: str | None = None
    stock_quantity: int | None = None
    low_stock_threshold: int | None = None
    is_active: bool | None = None
    is_favorite: bool | None = None
    category_id: str | None = None


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    description: str | None = None
    price: float
    image_url: str | None = None
    stock_quantity: int
    low_stock_threshold: int
    is_active: bool
    is_favorite: bool
    category: CategoryResponse | None = None
