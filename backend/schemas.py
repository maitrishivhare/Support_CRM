"""Pydantic models that define the API input and output shapes."""

from datetime import datetime
from enum import Enum
from pydantic import BaseModel, EmailStr, Field


class TicketStatus(str, Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    CLOSED = "Closed"


class TicketCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=100)
    customer_email: EmailStr
    subject: str = Field(min_length=1, max_length=150)
    description: str = Field(min_length=1, max_length=5000)
    priority: str = Field(default="Medium", min_length=1, max_length=20)


class TicketUpdate(BaseModel):
    status: TicketStatus
    note: str | None = Field(default=None, max_length=2000)


class NoteResponse(BaseModel):
    id: int
    note_text: str
    created_at: datetime


class TicketListResponse(BaseModel):
    id: int
    ticket_id: str
    customer_name: str
    customer_email: EmailStr
    subject: str
    description: str
    priority: str
    status: TicketStatus
    created_at: datetime
    updated_at: datetime


class ActivityResponse(BaseModel):
    id: int
    type: str
    description: str
    created_at: datetime


class TicketDetailResponse(TicketListResponse):
    notes: list[NoteResponse]
    activity: list[ActivityResponse]
