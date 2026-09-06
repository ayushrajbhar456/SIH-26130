from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


# =========================================================
# USER
# =========================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    password = Column(String, nullable=False)

    role = Column(String, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# APPLICATION
# =========================================================

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)

    applicant_name = Column(String, nullable=False)

    business_name = Column(String, nullable=False)

    sector = Column(String, nullable=False)

    investment_crore = Column(Float, nullable=False)

    hazardous_material = Column(
        Boolean,
        default=False
    )

    employees = Column(Integer, nullable=False)

    status = Column(
        String,
        default="Submitted"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    approvals = relationship(
        "Approval",
        back_populates="application",
        cascade="all, delete-orphan"
    )


# =========================================================
# APPROVAL
# =========================================================

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)

    application_id = Column(
        Integer,
        ForeignKey("applications.id"),
        nullable=False
    )

    approval_name = Column(
        String,
        nullable=False
    )

    department = Column(
        String,
        nullable=False
    )

    priority = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        default="Pending"
    )

    application = relationship(
        "Application",
        back_populates="approvals"
    )