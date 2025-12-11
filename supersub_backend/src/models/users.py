from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from enum import Enum

if TYPE_CHECKING:
    from .offers import Offers


class GenderType(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    NON_BINARY = "NON_BINARY"


class UsersBase(SQLModel):
    email: str = Field(max_length=255, unique=True)
    firstname: str = Field(max_length=100)
    lastname: str = Field(max_length=100)
    age: int = Field(gt=0, le=150)  # Age between 1 and 150
    gender: GenderType
    password: str = Field(max_length=255)


class Users(UsersBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Many-to-one relationship with offers (nullable)
    offer_id: Optional[int] = Field(default=None, foreign_key="offers.id")
    offer: Optional["Offers"] = Relationship(sa_relationship_kwargs={"foreign_keys": "[Users.offer_id]"})
    
    # Many-to-one relationship with previous offers (nullable)
    previous_offer_id: Optional[int] = Field(default=None, foreign_key="offers.id")
    previous_offer: Optional["Offers"] = Relationship(sa_relationship_kwargs={"foreign_keys": "[Users.previous_offer_id]"})


class UsersCreate(UsersBase):
    pass


class UsersRead(SQLModel):
    id: int
    email: str
    firstname: str
    lastname: str
    age: int
    gender: GenderType
    offer_id: Optional[int] = None
    offer: Optional["Offers"] = None
    previous_offer_id: Optional[int] = None
    previous_offer: Optional["Offers"] = None
    # Note: password is excluded from read model for security


class UsersUpdate(SQLModel):
    email: Optional[str] = Field(default=None, max_length=255)
    firstname: Optional[str] = Field(default=None, max_length=100)
    lastname: Optional[str] = Field(default=None, max_length=100)
    age: Optional[int] = Field(default=None, gt=0, le=150)
    gender: Optional[GenderType] = None
    password: Optional[str] = Field(default=None, max_length=255)
    offer_id: Optional[int] = None
    previous_offer_id: Optional[int] = None