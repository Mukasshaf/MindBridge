import json
import os
import random
from typing import Dict, Any, List
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

# Initialize Gemini if key is present
model = None

def get_gemini_model():
    global model
    if model:
        return model
    
    api_key = os.environ.get("GEMINI_API_KEY")
    print(f"DEBUG: Checking for GEMINI_API_KEY... Found: {bool(api_key)}")
    
    if api_key:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(
                model_name="gemini-2.0-flash",
                system_instruction=SYSTEM_PROMPT
            )
            print("DEBUG: Gemini model initialized successfully")
            return model
        except Exception as e:
            print(f"DEBUG: Error initializing Gemini model: {e}")
            return None
    return None

SYSTEM_PROMPT = """You are TeenCare Intake Assistant — a warm, supportive, and non-judgmental chat companion for adolescents (13-19). Your goal is to have a natural, therapeutic conversation to understand how the user is feeling. 
- Be empathic, active, and reflective listener.
- Ask open-ended questions to encourage sharing, but don't interrogate.
- Avoid medical diagnosis or clinical jargon.
- Keep the conversation flowing naturally.
- If you detect any red-flag words indicating imminent self-harm or danger, you must output the Escalation Message (below) and set urgency:"urgent".
- At the end of the session (when user indicates done or after a meaningful exchange), output a JSON code block with the schema described by backend: {"intent":"complete","extracted":{...},"urgency":"monitor"|"urgent"}.
- Red-flag words: suicidal, kill myself, want to die, cut, overdose, harm myself, hopeless, no hope, plan to.

Escalation Message (VERBATIM): "I’m really sorry you’re feeling this way. I’m not able to provide emergency help. If you are in immediate danger or thinking about harming yourself, please contact local emergency services right now, or a crisis line. If you can, tell me if you are safe right now. I will flag this session for the counselor to review immediately."
"""

def simulate_llm_response(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Generates an LLM response using Gemini if available, otherwise falls back to simulation.
    Returns a dict with 'content' and optional 'extracted_json'.
    """
    # Check for red flags (always check this first for safety)
    last_user_msg = messages[-1]["content"].lower() if messages else ""
    red_flags = ["suicidal", "kill myself", "want to die", "cut", "overdose", "harm myself", "hopeless", "no hope", "plan to"]
    if any(flag in last_user_msg for flag in red_flags):
        return {
            "content": "I’m really sorry you’re feeling this way. I’m not able to provide emergency help. If you are in immediate danger or thinking about harming yourself, please contact local emergency services right now, or a crisis line. If you can, tell me if you are safe right now. I will flag this session for the counselor to review immediately.",
            "extracted_json": {
                "intent": "complete",
                "extracted": {"red_flag": True},
                "urgency": "urgent"
            }
        }

    # Use Gemini if available
    model = get_gemini_model()
    if model:
        try:
            # Convert OpenAI message format to Gemini chat history
            # Gemini roles: 'user', 'model'
            chat_history = []
            for m in messages[:-1]: # Exclude the last message which is the new prompt
                role = "user" if m["role"] == "user" else "model"
                chat_history.append({"role": role, "parts": [m["content"]]})
            
            chat = model.start_chat(history=chat_history)
            response = chat.send_message(messages[-1]["content"])
            
            content = response.text
            extracted = parse_llm_json(content)
            
            # Clean content if it contains JSON (remove the JSON block for display)
            display_content = content
            if "```json" in content:
                display_content = content.split("```json")[0].strip()
            elif "```" in content:
                display_content = content.split("```")[0].strip()

            return {
                "content": display_content,
                "extracted_json": extracted if extracted else None
            }
        except Exception as e:
            print(f"Gemini API Error: {e}")
            # Fallback to simulation on error
            pass

    # Fallback Simulation Logic
    turn_count = len([m for m in messages if m["role"] == "assistant"])
    
    if turn_count == 0:
        return {"content": "Hi there. I'm here to chat and see how things are going. How was your day? (great/okay/rough)"}
    
    # Simple keyword matching for better fallback experience
    if "hello" in last_user_msg or "hi" in last_user_msg or "hey" in last_user_msg:
         return {"content": "Hey there! I'm listening. How are things going for you today?"}

    if "how are you" in last_user_msg:
        return {"content": "I'm just a computer program, but I'm here to support you! How are *you* doing?"}

    if "rough" in last_user_msg:
        return {"content": "I'm sorry to hear that. Which area was rough? (school/family/friends/sleep/other)"}
        
    if "school" in last_user_msg or "exams" in last_user_msg:
        return {"content": "School can be stressful. Is there anything specific worrying you a lot this week?"}
        
    if "sleep" in last_user_msg:
        return {"content": "Sleep is important. How many hours did you sleep last night?"}
        
    if turn_count > 3 or "bye" in last_user_msg or "done" in last_user_msg:
        return {
            "content": "Thanks for sharing. I've noted everything down. Take care!",
            "extracted_json": {
                "intent": "complete",
                "extracted": {
                    "mood_word": "rough",
                    "mood_tone": "negative",
                    "sleep_hours": 5,
                    "main_stressor": "exams",
                    "decision_style": "impulsive",
                    "red_flag": False
                },
                "urgency": "monitor"
            }
        }

    # Varied generic responses
    generic_responses = [
        "I hear you. Tell me a bit more about that?",
        "That sounds important. How does that make you feel?",
        "I'm listening. Please go on.",
        "It's okay to feel that way. I'm here with you.",
        "Can you help me understand a little better?"
    ]
    return {"content": random.choice(generic_responses)}

def generate_quiz_questions(context: str = "") -> List[Dict[str, Any]]:
    """
    Generates quiz questions using Gemini based on context.
    Falls back to static questions if API is unavailable.
    """
    model = get_gemini_model()
    if model:
        try:
            prompt = f"""Generate 2 decision-making scenarios for a teenager. 
            Context: {context if context else "General stress and anxiety"}.
            Output strictly valid JSON list of objects with keys: 'text' (scenario description), 'options' (list of 3 objects with 'label' and 'type' (Calm/Impulsive/Avoidant)).
            Example: [{{"text": "...", "options": [{{"label": "...", "type": "Calm"}}]}}]"""
            
            response = model.generate_content(prompt)
            content = response.text
            
            # Try to parse JSON from content
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
                return json.loads(json_str)
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
                return json.loads(json_str)
            else:
                return json.loads(content)
        except Exception as e:
            print(f"Quiz Generation Error: {e}")
            pass

    # Fallback Static Questions
    return [
        {
            "text": "You have a big test tomorrow but your friends are going out tonight.",
            "options": [
                { "label": "Study at home", "type": "Calm" },
                { "label": "Go out with friends", "type": "Impulsive" },
                { "label": "Ignore both", "type": "Avoidant" },
            ],
        },
        {
            "text": "Someone posts something mean about you online.",
            "options": [
                { "label": "Talk to them directly", "type": "Calm" },
                { "label": "Post something back", "type": "Impulsive" },
                { "label": "Pretend you didn't see it", "type": "Avoidant" },
            ],
        },
    ]

def parse_llm_json(content: str) -> Dict[str, Any]:
    """
    Extracts JSON from markdown code block in LLM response.
    """
    try:
        if "```json" in content:
            json_str = content.split("```json")[1].split("```")[0].strip()
            return json.loads(json_str)
        elif "```" in content:
            json_str = content.split("```")[1].split("```")[0].strip()
            return json.loads(json_str)
    except Exception:
        pass
    return {}
