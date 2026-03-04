from fastapi import APIRouter, Depends
from ..dependencies import get_current_user

router = APIRouter()


@router.get("/revenue")
async def get_revenue(user: dict = Depends(get_current_user)):
    return {"message": "Revenue analytics - to be implemented"}
