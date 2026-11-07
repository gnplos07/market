from pydantic import BaseModel, EmailStr
from typing import Literal
from pydantic import Field


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_active: bool 

    class Config:
        from_attributes = True

class BookCreate(BaseModel):
    title: str
    price: float
    description: str
    state : str

class BookResponse(BaseModel):
    id: int
    title: str
    price: float
    description: str
    state : str
    owner_id : int

    class Config:
        from_attributes = True

class BookPriceEstimateRequest(BaseModel):
    original_price: float = Field(gt=0, allow_inf_nan=False)
    years: int = Field(ge=0)
    condition: Literal["like_new", "good", "acceptable", "poor"]