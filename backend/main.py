from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import inspect

from rules.approvals import APPROVAL_RULES
from database import SessionLocal, engine
from models import User, Application, Approval


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

from database import Base

Base.metadata.create_all(bind=engine)


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="SIH 26130 - Intelligent Approval System",
    description="Smart KYA Engine for Industrial Approvals",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# REQUEST MODELS
# =========================================================

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str


class LoginRequest(BaseModel):
    email: str
    password: str


class BusinessDetails(BaseModel):
    sector: str
    investment_crore: float
    hazardous_material: bool
    employees: int


class ApprovalStatusUpdate(BaseModel):
    status: str


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "SIH 26130 Backend is Running 🚀"
    }


# =========================================================
# REGISTER
# =========================================================

@app.post("/api/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):

    # Check role
    if data.role not in ["applicant", "authority"]:
        return {
            "error": "Invalid role. Use applicant or authority."
        }

    # Check if email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if existing_user:
        return {
            "error": "Email already registered."
        }

    # Create user
    user = User(
        name=data.name,
        email=data.email,
        password=data.password,
        role=data.role
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "Account created successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }


# =========================================================
# LOGIN
# =========================================================

@app.post("/api/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    # User doesn't exist
    if not user:
        return {
            "error": "Invalid email or password."
        }

    # Password check
    if user.password != data.password:
        return {
            "error": "Invalid email or password."
        }

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }


# =========================================================
# SMART KYA ENGINE
# =========================================================

@app.post("/api/kya")
def smart_kya(data: BusinessDetails):

    approvals = []

    for rule in APPROVAL_RULES:

        condition = rule["condition"]
        required = False

        if condition == "always":
            required = True

        elif condition == "employees_10_plus":
            required = data.employees >= 10

        elif condition == "hazardous":
            required = data.hazardous_material

        elif condition == "investment_1_plus":
            required = data.investment_crore >= 1

        if required:
            approvals.append({
                "name": rule["name"],
                "department": rule["department"],
                "priority": rule["priority"],
                "status": "Required"
            })

    return {
        "business": {
            "sector": data.sector,
            "investment_crore": data.investment_crore,
            "hazardous_material": data.hazardous_material,
            "employees": data.employees
        },
        "total_approvals": len(approvals),
        "approvals": approvals
    }


# =========================================================
# CREATE APPLICATION
# =========================================================

@app.post("/api/applications")
def create_application(
    data: BusinessDetails,
    db: Session = Depends(get_db)
):

    application = Application(
        applicant_name="Demo Applicant",
        business_name="Demo Industrial Unit",
        sector=data.sector,
        investment_crore=data.investment_crore,
        hazardous_material=data.hazardous_material,
        employees=data.employees,
        status="Submitted"
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    approvals = []

    for rule in APPROVAL_RULES:

        condition = rule["condition"]
        required = False

        if condition == "always":
            required = True

        elif condition == "employees_10_plus":
            required = data.employees >= 10

        elif condition == "hazardous":
            required = data.hazardous_material

        elif condition == "investment_1_plus":
            required = data.investment_crore >= 1

        if required:

            approval = Approval(
                application_id=application.id,
                approval_name=rule["name"],
                department=rule["department"],
                priority=rule["priority"],
                status="Pending"
            )

            db.add(approval)
            approvals.append(approval)

    db.commit()

    return {
        "message": "Application submitted successfully",
        "application_id": application.id,
        "status": application.status,
        "total_approvals": len(approvals)
    }


# =========================================================
# GET ALL APPLICATIONS
# =========================================================

@app.get("/api/applications")
def get_applications(
    db: Session = Depends(get_db)
):

    applications = db.query(Application).all()

    return {
        "total_applications": len(applications),

        "applications": [
            {
                "id": application.id,
                "applicant_name": application.applicant_name,
                "business_name": application.business_name,
                "sector": application.sector,
                "investment_crore": application.investment_crore,
                "employees": application.employees,
                "hazardous_material": application.hazardous_material,
                "status": application.status,
                "created_at": application.created_at
            }

            for application in applications
        ]
    }


# =========================================================
# GET SINGLE APPLICATION
# =========================================================

@app.get("/api/applications/{application_id}")
def get_application(
    application_id: int,
    db: Session = Depends(get_db)
):

    application = (
        db.query(Application)
        .filter(Application.id == application_id)
        .first()
    )

    if not application:
        return {
            "error": "Application not found"
        }

    return {
        "id": application.id,
        "applicant_name": application.applicant_name,
        "business_name": application.business_name,
        "sector": application.sector,
        "investment_crore": application.investment_crore,
        "hazardous_material": application.hazardous_material,
        "employees": application.employees,
        "status": application.status,
        "created_at": application.created_at,

        "approvals": [
            {
                "id": approval.id,
                "approval_name": approval.approval_name,
                "department": approval.department,
                "priority": approval.priority,
                "status": approval.status
            }

            for approval in application.approvals
        ]
    }


# =========================================================
# UPDATE APPROVAL STATUS
# =========================================================

@app.patch("/api/approvals/{approval_id}")
def update_approval(
    approval_id: int,
    data: ApprovalStatusUpdate,
    db: Session = Depends(get_db)
):

    approval = (
        db.query(Approval)
        .filter(Approval.id == approval_id)
        .first()
    )

    if not approval:
        return {
            "error": "Approval not found"
        }

    allowed_statuses = [
        "Pending",
        "Under Review",
        "Approved",
        "Rejected"
    ]

    if data.status not in allowed_statuses:
        return {
            "error": "Invalid status",
            "allowed_statuses": allowed_statuses
        }

    approval.status = data.status

    db.commit()
    db.refresh(approval)

    return {
        "message": "Approval status updated successfully",
        "approval_id": approval.id,
        "approval_name": approval.approval_name,
        "status": approval.status
    }