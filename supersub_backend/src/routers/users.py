from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from ..database import get_session
from ..models.users import Users, UsersCreate, UsersRead, UsersUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UsersRead)
def create_user(user: UsersCreate, session: Session = Depends(get_session)):
    """Create a new user"""
    # Check if email already exists
    existing_user = session.exec(select(Users).where(Users.email == user.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = Users.model_validate(user)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


@router.get("/", response_model=List[UsersRead])
def read_users(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    """Get all users"""
    statement = select(Users).offset(skip).limit(limit)
    users = session.exec(statement).all()
    return users


@router.get("/{user_id}", response_model=UsersRead)
def read_user(user_id: int, session: Session = Depends(get_session)):
    """Get a user by its ID"""
    user = session.get(Users, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UsersRead)
def update_user(
    user_id: int, 
    user_update: UsersUpdate, 
    session: Session = Depends(get_session)
):
    """Update a user"""
    user = session.get(Users, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if email is being updated and if it already exists
    if user_update.email and user_update.email != user.email:
        existing_user = session.exec(select(Users).where(Users.email == user_update.email)).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    user_data = user_update.model_dump(exclude_unset=True)
    for field, value in user_data.items():
        setattr(user, field, value)
    
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.delete("/{user_id}")
def delete_user(user_id: int, session: Session = Depends(get_session)):
    """Delete a user"""
    user = session.get(Users, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    session.delete(user)
    session.commit()
    return {"message": "User deleted successfully"}