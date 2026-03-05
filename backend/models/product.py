from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, Float, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    category: Mapped[str] = mapped_column(
        String(20)
    )  # hot_drinks | cold_drinks | snacks | meals
    price: Mapped[float] = mapped_column(Float)
    image_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    in_stock: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    session_products: Mapped[list["SessionProduct"]] = relationship(  # noqa: F821
        back_populates="product"
    )
