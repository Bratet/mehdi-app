from fastapi import APIRouter, Depends
from ..dependencies import get_current_user

router = APIRouter()


@router.get("/demand")
async def predict_demand(user: dict = Depends(get_current_user)):
    return {"message": "Demand predictions - to be implemented"}
