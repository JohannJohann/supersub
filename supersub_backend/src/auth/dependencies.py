from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select
import os
import redis
from dotenv import load_dotenv

from ..database import get_session
from ..models.users import Users

load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer token scheme
security = HTTPBearer()

# Redis connection for token blacklist
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", "6379")),
    db=int(os.getenv("REDIS_DB", "0")),
    decode_responses=True
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def authenticate_user(session: Session, email: str, password: str) -> Optional[Users]:
    """Authenticate a user with email and password"""
    user = session.exec(select(Users).where(Users.email == email)).first()
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user


def is_token_blacklisted(token: str) -> bool:
    """Check if token is blacklisted in Redis"""
    try:
        return redis_client.exists(f"blacklist:{token}") == 1
    except redis.RedisError:
        # If Redis is down, allow the request (fail open)
        return False


def blacklist_token(token: str) -> None:
    """Add token to blacklist in Redis with expiration based on token's remaining time"""
    try:
        # Decode token to get expiration time
        payload = verify_token(token)
        if payload and "exp" in payload:
            exp_timestamp = payload["exp"]
            current_timestamp = datetime.utcnow().timestamp()
            remaining_seconds = int(exp_timestamp - current_timestamp)
            
            # Only blacklist if token hasn't expired yet
            if remaining_seconds > 0:
                redis_client.setex(f"blacklist:{token}", remaining_seconds, "1")
        else:
            # Fallback to default expiration if we can't decode the token
            redis_client.setex(f"blacklist:{token}", ACCESS_TOKEN_EXPIRE_MINUTES * 60, "1")
    except redis.RedisError:
        # If Redis is down, log the error but don't fail the request
        pass


def get_current_user(
    request: Request,
    session: Session = Depends(get_session)
) -> Users:
    """Get the current authenticated user from JWT token in HTTP-only cookie"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Get token from HTTP-only cookie
    token = request.cookies.get("jwt")
    if not token:
        raise credentials_exception
    
    # Check if token is blacklisted
    if is_token_blacklisted(token):
        raise credentials_exception
    
    try:
        payload = verify_token(token)
        if payload is None:
            raise credentials_exception
        
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        user_id = int(user_id)
            
    except JWTError:
        raise credentials_exception
    
    # Use select with options to load the offer relationship
    statement = select(Users).where(Users.id == user_id)
    user = session.exec(statement).first()
    if user is None:
        raise credentials_exception
    
    return user


def get_current_active_user(current_user: Users = Depends(get_current_user)) -> Users:
    """Get the current active user (can be extended to check if user is active)"""
    return current_user