from sqlmodel import SQLModel
from typing import Optional
from ..models.offers import OffersRead


class UserLogin(SQLModel):
    email: str
    password: str


class UserSignup(SQLModel):
    email: str
    firstname: str
    lastname: str
    age: int
    gender: str  # Will be validated against GenderType enum
    password: str


class Token(SQLModel):
    access_token: str
    token_type: str


class TokenData(SQLModel):
    user_id: Optional[int] = None


class UserProfile(SQLModel):
    id: int
    email: str
    firstname: str
    lastname: str
    age: int
    gender: str
    offer: Optional[OffersRead] = None
    previous_offer: Optional[OffersRead] = None