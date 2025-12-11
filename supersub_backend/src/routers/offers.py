from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from ..database import get_session
from ..models.offers import Offers, OffersCreate, OffersRead, OffersUpdate

router = APIRouter(prefix="/offers", tags=["offers"])


@router.post("/", response_model=OffersRead)
def create_offer(offer: OffersCreate, session: Session = Depends(get_session)):
    """Create a new offer"""
    db_offer = Offers.model_validate(offer)
    session.add(db_offer)
    session.commit()
    session.refresh(db_offer)
    return db_offer


@router.get("/", response_model=List[OffersRead])
def read_offers(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    """Get all offers"""
    statement = select(Offers).offset(skip).limit(limit)
    offers = session.exec(statement).all()
    return offers


@router.get("/{offer_id}", response_model=OffersRead)
def read_offer(offer_id: int, session: Session = Depends(get_session)):
    """Get an offer by its ID"""
    offer = session.get(Offers, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return offer


@router.patch("/{offer_id}", response_model=OffersRead)
def update_offer(
    offer_id: int, 
    offer_update: OffersUpdate, 
    session: Session = Depends(get_session)
):
    """Update an offer"""
    offer = session.get(Offers, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    offer_data = offer_update.model_dump(exclude_unset=True)
    for field, value in offer_data.items():
        setattr(offer, field, value)
    
    session.add(offer)
    session.commit()
    session.refresh(offer)
    return offer


@router.delete("/{offer_id}")
def delete_offer(offer_id: int, session: Session = Depends(get_session)):
    """Delete an offer"""
    offer = session.get(Offers, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    session.delete(offer)
    session.commit()
    return {"message": "Offer deleted successfully"}