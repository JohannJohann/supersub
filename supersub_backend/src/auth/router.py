from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import HTTPAuthorizationCredentials
from sqlmodel import Session, select

from ..database import get_session
from ..models.users import Users, GenderType
from ..models.offers import OffersRead
from .models import UserLogin, UserSignup, Token, UserProfile
from .dependencies import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    get_current_active_user,
    blacklist_token,
    security,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/signup", response_model=UserProfile)
def signup(user_data: UserSignup, session: Session = Depends(get_session)):
    """Register a new user"""
    # Check if email already exists
    existing_user = session.exec(select(Users).where(Users.email == user_data.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate gender
    try:
        gender_enum = GenderType(user_data.gender)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid gender. Must be MALE, FEMALE, or NON_BINARY"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user_data.password)
    
    db_user = Users(
        email=user_data.email,
        firstname=user_data.firstname,
        lastname=user_data.lastname,
        age=user_data.age,
        gender=gender_enum,
        password=hashed_password
    )
    
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    return UserProfile(
        id=db_user.id or 0,
        email=db_user.email,
        firstname=db_user.firstname,
        lastname=db_user.lastname,
        age=db_user.age,
        gender=db_user.gender.value
    )


@router.post("/login")
def login(user_credentials: UserLogin, response: Response, session: Session = Depends(get_session)):
    """Authenticate user and set JWT token as HTTP-only cookie"""
    user = authenticate_user(session, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    # Set HTTP-only cookie
    response.set_cookie(
        key="jwt",
        value=f"{access_token}",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert minutes to seconds
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="strict"
    )
    
    return {"message": "Login successful"}


@router.post("/logout")
def logout(request: Request, response: Response):
    """Logout user by blacklisting the token and clearing cookie"""
    # Get token from HTTP-only cookie
    token = request.cookies.get("jwt")
    if token:
        blacklist_token(token)
    
    # Clear the HTTP-only cookie
    response.delete_cookie(
        key="jwt",
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="strict"
    )
    
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserProfile)
def get_current_user_profile(current_user: Users = Depends(get_current_active_user)):
    """Get current user's profile information"""
    offer_data = None
    if current_user.offer and current_user.offer.id is not None:
        offer_data = OffersRead(
            id=current_user.offer.id,
            title=current_user.offer.title,
            description=current_user.offer.description,
            price=current_user.offer.price,
            benefits=current_user.offer.benefits,
            access_rules=current_user.offer.access_rules
        )
    
    previous_offer_data = None
    if current_user.previous_offer and current_user.previous_offer.id is not None:
        previous_offer_data = OffersRead(
            id=current_user.previous_offer.id,
            title=current_user.previous_offer.title,
            description=current_user.previous_offer.description,
            price=current_user.previous_offer.price,
            benefits=current_user.previous_offer.benefits,
            access_rules=current_user.previous_offer.access_rules
        )
    
    return UserProfile(
        id=current_user.id or 0,  # This should never be None for authenticated users
        email=current_user.email,
        firstname=current_user.firstname,
        lastname=current_user.lastname,
        age=current_user.age,
        gender=current_user.gender.value,
        offer=offer_data,
        previous_offer=previous_offer_data
    )