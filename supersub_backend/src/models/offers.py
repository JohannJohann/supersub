from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from enum import Enum


class AccessType(str, Enum):
    FIRST_SUB = "FIRST_SUB"
    RENEW_SUB = "RENEW_SUB"
    SWITCH_SUB = "SWITCH_SUB"


# Access Rules table
class AccessRules(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    access_type: AccessType = Field(unique=True)

# Link table for many-to-many relationship
class OfferAccessRuleLink(SQLModel, table=True):
    offer_id: Optional[int] = Field(default=None, foreign_key="offers.id", primary_key=True)
    access_rule_id: Optional[int] = Field(default=None, foreign_key="accessrules.id", primary_key=True)


class OffersBase(SQLModel):
    title: str = Field(max_length=255)
    description: str
    price: int = Field(gt=0)  # Positive price
    benefits: str


class Offers(OffersBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Many-to-many relationship with access rules
    access_rules: List[AccessRules] = Relationship(link_model=OfferAccessRuleLink)


class OffersCreate(OffersBase):
    access_rule_ids: Optional[List[int]] = None


class OffersRead(OffersBase):
    id: int
    access_rules: List[AccessRules] = []


class OffersUpdate(SQLModel):
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    price: Optional[int] = Field(default=None, gt=0)
    benefits: Optional[str] = None
    access_rule_ids: Optional[List[int]] = None