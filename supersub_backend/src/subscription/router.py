from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from ..database import get_session
from ..models.users import Users
from ..models.offers import Offers
from ..auth.dependencies import get_current_active_user
from .models import SubscribeRequest, SubscribeResponse, UnsubscribeRequest, UnsubscribeResponse

router = APIRouter(prefix="/subscription", tags=["subscription"])


def is_offer_accessible(offer: Offers, current_user: Users) -> bool:
    """Check if an offer is accessible based on access rules and current user state"""
    # If no access rules, the offer is accessible to everyone
    if not offer.access_rules or len(offer.access_rules) == 0:
        return True

    current_user_offer = current_user.offer
    previous_user_offer = current_user.previous_offer

    # Check each access rule
    for rule in offer.access_rules:
        if rule.access_type == "FIRST_SUB":
            # Accessible if user has no current offer and no previous offer
            if not current_user_offer and not previous_user_offer:
                return True
        elif rule.access_type == "RENEW_SUB":
            # Accessible if user had this offer before (can renew)
            if previous_user_offer and not current_user_offer:
                return True
        elif rule.access_type == "SWITCH_SUB":
            # Accessible if user has a different current offer (switching)
            if current_user_offer and current_user_offer.id != offer.id:
                return True

    # If no access rule matches, the offer is not accessible
    return False


@router.post("/subscribeTo", response_model=SubscribeResponse)
def subscribe_to_offer(
    subscribe_request: SubscribeRequest,
    current_user: Users = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Subscribe current user to an offer"""
    
    # Check if the offer exists
    offer = session.get(Offers, subscribe_request.offer_id)
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    
    # Check if the user has access to this offer based on access rules
    if not is_offer_accessible(offer, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this offer based on the current access rules"
        )
    
    # Save current offer as previous offer (if user has one) and update to new offer
    if current_user.offer_id is not None:
        current_user.previous_offer_id = current_user.offer_id
    
    current_user.offer_id = subscribe_request.offer_id
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return SubscribeResponse(
        message="Successfully subscribed to offer",
        user_id=current_user.id or 0,
        offer_id=subscribe_request.offer_id,
        offer_title=offer.title
    )


@router.post("/unsubscribeTo", response_model=UnsubscribeResponse)
def unsubscribe_from_offer(
    unsubscribe_request: UnsubscribeRequest,
    current_user: Users = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Unsubscribe current user from an offer"""
    
    # Check if the user currently has this offer
    if current_user.offer_id != unsubscribe_request.offer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not currently subscribed to this offer"
        )
    
    # Get the current offer details before removing it
    current_offer = session.get(Offers, current_user.offer_id)
    if not current_offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Current offer not found"
        )
    
    # Store offer details for response
    previous_offer_id = current_user.offer_id or 0  # Ensure it's not None
    previous_offer_title = current_offer.title
    
    # Save current offer as previous offer and remove current offer
    current_user.previous_offer_id = current_user.offer_id
    current_user.offer_id = None
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return UnsubscribeResponse(
        message="Successfully unsubscribed from offer",
        user_id=current_user.id or 0,
        previous_offer_id=previous_offer_id,
        previous_offer_title=previous_offer_title
    )