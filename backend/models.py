from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key= True, index=True)
    title = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(String,nullable=False)
    state = Column(String, nullable= False)

    # Συνδεση του βιβλιου με τον χρηστη που το ανεβασε 
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)


