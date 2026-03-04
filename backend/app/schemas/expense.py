from pydantic import BaseModel, ConfigDict


class ExpenseCategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    icon: str | None = None


class ExpenseCreate(BaseModel):
    category_id: str
    amount: float
    description: str | None = None
    receipt_url: str | None = None
    date: str


class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    category_id: str
    amount: float
    description: str | None = None
    receipt_url: str | None = None
    date: str
    category: ExpenseCategoryResponse | None = None
