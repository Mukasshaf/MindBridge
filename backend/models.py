from typing import Optional, Dict, Any
from datetime import datetime
from sqlmodel import SQLModel, Field, JSON, Column

class Session(SQLModel, table=True):
    id: Optional[str] = Field(default=None, primary_key=True)
    participant_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    source: str  # "chat", "quiz", "both"
    urgency: str = "monitor" # "monitor", "urgent"
    
    # JSON fields
    meta: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    raw_data: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    report: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))

class SessionCreate(SQLModel):
    participant_id: str
    source: str
    meta: Dict[str, Any] = {}
    raw_data: Dict[str, Any] = {}
