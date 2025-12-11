from sqlmodel import SQLModel, create_engine, Session, text, select
from typing import Generator
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus
from .models.offers import Offers, AccessRules, AccessType, OfferAccessRuleLink
from .models.users import Users
    

load_dotenv(encoding="utf-8")

# PostgreSQL database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://username:password@localhost:5432/supersub_db"
)

engine = create_engine(
    DATABASE_URL,
    echo=True,
)

def initialize_access_rules():
    """Initialize access_rules table with the 3 AccessType values"""
    with Session(engine) as session:
        # Check if access rules already exist
        existing_rules = session.exec(select(AccessRules)).all()
        if existing_rules:
            print("✓ Access rules already initialized")
            return
        
        # Create the 3 access rules
        access_rules = [
            AccessRules(access_type=AccessType.FIRST_SUB),
            AccessRules(access_type=AccessType.RENEW_SUB),
            AccessRules(access_type=AccessType.SWITCH_SUB)
        ]
        
        for rule in access_rules:
            session.add(rule)
        
        session.commit()
        print("✓ Access rules initialized successfully")


def initialize_offers():
    """Initialize offers table with the 3 predefined offers"""
    with Session(engine) as session:
        # Check if offers already exist
        existing_offers = session.exec(select(Offers)).all()
        if existing_offers:
            print("✓ Offers already initialized")
            return
        
        # Get access rules
        first_sub_rule = session.exec(select(AccessRules).where(AccessRules.access_type == AccessType.FIRST_SUB)).first()
        renew_sub_rule = session.exec(select(AccessRules).where(AccessRules.access_type == AccessType.RENEW_SUB)).first()
        switch_sub_rule = session.exec(select(AccessRules).where(AccessRules.access_type == AccessType.SWITCH_SUB)).first()
        
        # Create Offer 1
        offer1 = Offers(
            title="Offre Starter",
            description="Un forfait abordable pour tous les portefeuilles",
            price=10,
            benefits="Appels illimités, 300 SMS"
        )
        session.add(offer1)
        session.flush()  # To get the ID
        
        # Add access rule for offer 1 (only FIRST_SUB)
        if first_sub_rule:
            link1 = OfferAccessRuleLink(offer_id=offer1.id, access_rule_id=first_sub_rule.id)
            session.add(link1)
        
        # Create Offer 2
        offer2 = Offers(
            title="Offre Standard",
            description="La solution idéale pour communiquer sans limite avec vos proches",
            price=15,
            benefits="Appels illimités, SMS illimités"
        )
        session.add(offer2)
        session.flush()  # To get the ID
        
        # Add access rules for offer 2 (FIRST_SUB and RENEW_SUB)
        if first_sub_rule:
            link2a = OfferAccessRuleLink(offer_id=offer2.id, access_rule_id=first_sub_rule.id)
            session.add(link2a)
        if renew_sub_rule:
            link2b = OfferAccessRuleLink(offer_id=offer2.id, access_rule_id=renew_sub_rule.id)
            session.add(link2b)
        
        # Create Offer 3
        offer3 = Offers(
            title="Offre Premium",
            description="Le choix parfait pour les grands voyageurs",
            price=20,
            benefits="Appels illimités, SMS illimités, ROAMING en Europe"
        )
        session.add(offer3)
        session.flush()  # To get the ID
        
        # Add all access rules for offer 3 (no restrictions)
        if first_sub_rule:
            link3a = OfferAccessRuleLink(offer_id=offer3.id, access_rule_id=first_sub_rule.id)
            session.add(link3a)
        if renew_sub_rule:
            link3b = OfferAccessRuleLink(offer_id=offer3.id, access_rule_id=renew_sub_rule.id)
            session.add(link3b)
        if switch_sub_rule:
            link3c = OfferAccessRuleLink(offer_id=offer3.id, access_rule_id=switch_sub_rule.id)
            session.add(link3c)
        
        session.commit()
        print("✓ Offers initialized successfully")


def create_db_and_tables():
    """Create tables in the database with verifications"""
    

    # Verify that the engine is valid
    print(f"Verifying engine with URL: {engine.url}")
    
    # Test database connection
    try:
        print("Testing database connection...")
        with engine.connect() as connection:
            print("✓ Database connection successful")
            
            # Verify that the database exists
            connection.execute(text("SELECT 1"))
            print("✓ Database accessible")
            
    except Exception as e:
        # print(f"Database connection error: {e}")
        print(f"Connection error type: {type(e).__name__}")
        raise Exception(f"Database connection failed: {e}")
    
    # Create tables
    try:
        print("Creating tables...")
        SQLModel.metadata.create_all(engine)
        print("✓ Tables created successfully")
        
        # Initialize access rules
        initialize_access_rules()
        
        # Initialize offers
        initialize_offers()
        
    except Exception as e:
        # print(f"Error creating tables: {e}")
        print(f"Table creation error type: {type(e).__name__}")
        raise Exception(f"Table creation failed: {e}")


def get_session() -> Generator[Session, None, None]:
    """Database session generator"""
    with Session(engine) as session:
        yield session