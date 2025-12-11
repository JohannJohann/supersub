from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from src.database import create_db_and_tables
from src.routers import offers, users
from src.auth import router as auth_router
from src.subscription import router as subscription_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables at startup
    create_db_and_tables()
    yield


app = FastAPI(
    title="Offers API",
    description="API to manage subscriptions",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods including OPTIONS
    allow_headers=["*"],  # Allow all headers
)

# Include routes
app.include_router(auth_router.router)
app.include_router(subscription_router.router)
app.include_router(offers.router)
app.include_router(users.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Supersub API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}