from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.templating import Jinja2Templates
from sqlmodel import Session, select
from typing import List, Dict, Any
from ..models import Session as DBSession, SessionCreate
from ..database import get_session
from ..scoring import generate_summary
from ..llm_service import simulate_llm_response, parse_llm_json, generate_quiz_questions
from weasyprint import HTML
import os

router = APIRouter()
templates = Jinja2Templates(directory="backend/templates")

@router.post("/session", response_model=Dict[str, str])
def create_session(session_data: SessionCreate, db: Session = Depends(get_session)):
    db_session = DBSession.from_orm(session_data)
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return {"session_id": str(db_session.id), "status": "created"}

@router.post("/session/{session_id}/complete")
def complete_session(session_id: str, db: Session = Depends(get_session)):
    session = db.get(DBSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Generate summary
    summary = generate_summary({
        "source": session.source,
        "raw_data": session.raw_data
    })
    
    session.report = summary
    db.add(session)
    db.commit()
    db.refresh(session)
    return summary

@router.get("/session/{session_id}")
def get_session_details(session_id: str, db: Session = Depends(get_session)):
    session = db.get(DBSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.get("/sessions")
def list_sessions(skip: int = 0, limit: int = 20, db: Session = Depends(get_session)):
    sessions = db.exec(select(DBSession).offset(skip).limit(limit)).all()
    return sessions

@router.post("/llm")
def chat_with_llm(payload: Dict[str, Any]):
    # payload: {"messages": [...]}
    messages = payload.get("messages", [])
    # The service now handles both simulation and real API calls
    response = simulate_llm_response(messages)
    return response

@router.post("/quiz/generate")
def generate_quiz(payload: Dict[str, Any]):
    # payload: {"context": "optional context string"}
    context = payload.get("context", "")
    questions = generate_quiz_questions(context)
    return questions

@router.get("/session/{session_id}/export/pdf")
def export_session_pdf(session_id: str, db: Session = Depends(get_session)):
    session = db.get(DBSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.report:
        # Generate report if missing
        session.report = generate_summary({
            "source": session.source,
            "raw_data": session.raw_data
        })
        db.add(session)
        db.commit()
        db.refresh(session)

    html_content = templates.get_template("report.html").render(session=session)
    pdf = HTML(string=html_content).write_pdf()
    
    return Response(content=pdf, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=session_{session_id}.pdf"})
