from sqlalchemy import Column, BigInteger, Text, Boolean, DateTime
from sqlalchemy.sql import func
from db import Base

class AppUser(Base):
    __tablename__ = "app_user"
    id = Column(BigInteger, primary_key=True)
    email = Column(Text, unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(Text, nullable=False, default="agent")  # 'agent' | 'admin'
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
