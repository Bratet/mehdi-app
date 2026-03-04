from fastapi import APIRouter, Depends
from ..dependencies import get_current_user

router = APIRouter()


@router.get("/products")
async def get_products(user: dict = Depends(get_current_user)):
    return {"message": "Product analytics - to be implemented"}
