from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from ..core.database import get_db
from ..core.security import get_current_user, require_roles
from ..models.user import User
from ..models.product import Product, Category
from ..schemas.product import ProductCreate, ProductUpdate, ProductResponse, CategoryCreate, CategoryResponse

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(
    establishment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Category).where(Category.establishment_id == establishment_id).order_by(Category.sort_order)
    )
    return [CategoryResponse.model_validate(c) for c in result.scalars().all()]


@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "admin")),
):
    cat = Category(**data.model_dump())
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return CategoryResponse.model_validate(cat)


@router.get("", response_model=list[ProductResponse])
async def list_products(
    establishment_id: str | None = None,
    category_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Product).options(selectinload(Product.category))
    eid = establishment_id or current_user.establishment_id
    if eid:
        query = query.where(Product.establishment_id == eid)
    if category_id:
        query = query.where(Product.category_id == category_id)
    result = await db.execute(query.where(Product.is_active == True).order_by(Product.name))
    return [ProductResponse.model_validate(p) for p in result.scalars().all()]


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Product).options(selectinload(Product.category)).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductResponse.model_validate(product)


@router.post("", response_model=ProductResponse)
async def create_product(
    data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "admin")),
):
    product = Product(**data.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product, ["category"])
    return ProductResponse.model_validate(product)


@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "admin")),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(product, key, value)

    await db.commit()
    await db.refresh(product, ["category"])
    return ProductResponse.model_validate(product)


@router.patch("/{product_id}/favorite")
async def toggle_favorite(product_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_favorite = not product.is_favorite
    await db.commit()
    return {"is_favorite": product.is_favorite}


@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "admin")),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    await db.commit()
    return {"message": "Product deactivated"}
