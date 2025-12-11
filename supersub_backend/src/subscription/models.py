from sqlmodel import SQLModel
from typing import Optional


class SubscribeRequest(SQLModel):
    """Request model for subscribing to an offer"""
    offer_id: int


class SubscribeResponse(SQLModel):
    """Response model for subscription"""
    message: str
    user_id: int
    offer_id: int
    offer_title: str


class UnsubscribeRequest(SQLModel):
    """Request model for unsubscribing from an offer"""
    offer_id: int


class UnsubscribeResponse(SQLModel):
    """Response model for unsubscription"""
    message: str
    user_id: int
    previous_offer_id: int
    previous_offer_title: str