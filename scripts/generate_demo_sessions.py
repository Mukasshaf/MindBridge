import sys
import os
import random
import json
from datetime import datetime, timedelta
from sqlmodel import Session, create_engine, select

# Add parent directory to path to import backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.models import Session as DBSession
from backend.database import engine, create_db_and_tables
from backend.scoring import generate_summary

def create_synthetic_session(index: int):
    source = random.choice(["chat", "quiz", "both"])
    participant_id = f"anon_{1000 + index}"
    
    # Meta
    meta = {
        "age": random.randint(13, 19),
        "sleep_hours": random.randint(4, 9),
        "mood_emoji": random.choice(["😊", "😐", "😔", "😠", "😴"])
    }
    
    raw_data = {}
    
    # Quiz Data
    if source in ["quiz", "both"]:
        reaction_times = [random.randint(300, 600) for _ in range(20)]
        misses = random.randint(0, 3)
        if random.random() < 0.2: # Simulate slow/distracted
            reaction_times = [random.randint(500, 800) for _ in range(20)]
            misses = random.randint(2, 5)
            
        choices = random.choices(["calm", "avoidant", "impulsive"], k=6)
        if random.random() < 0.3: # Simulate impulsive
            choices = random.choices(["impulsive"], k=4) + random.choices(["calm", "avoidant"], k=2)
            
        raw_data["quiz"] = {
            "reaction": {
                "reaction_times": reaction_times,
                "misses": misses
            },
            "decision": {
                "choices": choices,
                "choice_times": [random.randint(800, 2000) for _ in range(6)]
            },
            "emotion_sort": {
                "accuracy": random.uniform(0.6, 1.0),
                "negative_confusions": random.uniform(0.0, 0.4),
                "avg_time": random.randint(800, 1500)
            }
        }

    # Chat Data
    if source in ["chat", "both"]:
        moods = ["great", "okay", "rough", "tired"]
        mood = random.choice(moods)
        transcript = [
            {"role": "assistant", "text": "Hi there. I'm here to chat and see how things are going. How was your day? (great/okay/rough)"},
            {"role": "user", "text": f"It was {mood}."}
        ]
        
        extracted = {
            "mood_word": mood,
            "sleep_hours": meta["sleep_hours"],
            "red_flag": False
        }
        
        if mood == "rough":
            transcript.append({"role": "assistant", "text": "I'm sorry to hear that. Which area was rough? (school/family/friends/sleep/other)"})
            transcript.append({"role": "user", "text": "school exams"})
            extracted["main_stressor"] = "exams"
            extracted["mood_tone"] = "negative"
        
        raw_data["chat_transcript"] = transcript
        raw_data["llm_extracted"] = extracted

    # Create Session Object
    session = DBSession(
        participant_id=participant_id,
        source=source,
        created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30)),
        meta=meta,
        raw_data=raw_data
    )
    
    # Generate Report
    summary = generate_summary({
        "source": source,
        "raw_data": raw_data
    })
    session.report = summary
    
    # Urgency
    if summary.get("stress_label") == "High" or summary.get("emotional_bias") == "Negative":
        session.urgency = "monitor"
    if raw_data.get("llm_extracted", {}).get("red_flag"):
        session.urgency = "urgent"
        
    return session

def main():
    print("Initializing database...")
    create_db_and_tables()
    
    print("Generating 20 synthetic sessions...")
    with Session(engine) as db:
        for i in range(20):
            session = create_synthetic_session(i)
            db.add(session)
        db.commit()
    
    print("Done! Database populated.")

if __name__ == "__main__":
    main()
