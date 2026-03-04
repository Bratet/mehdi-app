from fastapi import APIRouter, Depends
from ..dependencies import get_current_user

router = APIRouter()


@router.get("/customers")
async def get_customers(user: dict = Depends(get_current_user)):
    return {"message": "Customer analytics - to be implemented"}
