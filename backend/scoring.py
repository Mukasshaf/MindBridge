from typing import Dict, Any, List
import statistics

def calculate_stress_score(quiz_data: Dict[str, Any], chat_transcript: List[Dict[str, str]]) -> float:
    """
    Stress_score (0-1):
    Start 0.3 baseline.
    +0.2 if mean_rt > 450 ms
    +0.15 if miss_rate > 0.1
    +0.2 if negative_confusions > 0.2
    +0.2 if impulsive_prop > 0.5
    Clamp to [0,1]
    """
    score = 0.3
    
    reaction = quiz_data.get("reaction", {})
    decision = quiz_data.get("decision", {})
    emotion = quiz_data.get("emotion_sort", {})

    # Reaction metrics
    rts = reaction.get("reaction_times", [])
    misses = reaction.get("misses", 0)
    total_trials = len(rts) + misses
    mean_rt = statistics.mean(rts) if rts else 0
    miss_rate = misses / total_trials if total_trials > 0 else 0

    if mean_rt > 450:
        score += 0.2
    if miss_rate > 0.1:
        score += 0.15

    # Emotion metrics
    neg_conf = emotion.get("negative_confusions", 0)
    if neg_conf > 0.2:
        score += 0.2

    # Decision metrics
    choices = decision.get("choices", [])
    impulsive_count = choices.count("impulsive")
    impulsive_prop = impulsive_count / len(choices) if choices else 0
    
    if impulsive_prop > 0.5:
        score += 0.2

    return min(max(score, 0.0), 1.0)

def calculate_attention_score(quiz_data: Dict[str, Any]) -> float:
    """
    Attention_score (0-100):
    Base 100 - (mean_rt_ms / 10) - (std_rt / 2) - (misses * 10). Clamp 0-100.
    """
    reaction = quiz_data.get("reaction", {})
    rts = reaction.get("reaction_times", [])
    misses = reaction.get("misses", 0)
    
    if not rts:
        return 0.0

    mean_rt = statistics.mean(rts)
    std_rt = statistics.stdev(rts) if len(rts) > 1 else 0
    
    score = 100 - (mean_rt / 10) - (std_rt / 2) - (misses * 10)
    return min(max(score, 0.0), 100.0)

def get_impulsivity_label(quiz_data: Dict[str, Any]) -> str:
    decision = quiz_data.get("decision", {})
    choices = decision.get("choices", [])
    if not choices:
        return "Unknown"
        
    impulsive_count = choices.count("impulsive")
    prop = impulsive_count / len(choices)
    
    if prop > 0.5:
        return "High"
    elif prop >= 0.25:
        return "Moderate"
    else:
        return "Low"

def get_emotional_bias(quiz_data: Dict[str, Any], chat_transcript: List[Dict[str, str]]) -> str:
    emotion = quiz_data.get("emotion_sort", {})
    neg_conf = emotion.get("negative_confusions", 0)
    
    # Simple check for negative words in chat if provided
    # (This is a placeholder for more complex NLP if needed)
    negative_words = ["sad", "angry", "hopeless", "rough", "bad"]
    chat_neg_count = 0
    if chat_transcript:
        for msg in chat_transcript:
            if msg.get("role") == "user":
                text = msg.get("text", "").lower()
                if any(w in text for w in negative_words):
                    chat_neg_count += 1

    if neg_conf > 0.2 or chat_neg_count > 0:
        return "Negative"
    return "Neutral/Positive"

def generate_summary(session_data: Dict[str, Any]) -> Dict[str, Any]:
    source = session_data.get("source")
    raw = session_data.get("raw_data", {})
    
    summary = {}
    
    if source in ["quiz", "both"]:
        quiz = raw.get("quiz", {})
        summary["stress_score"] = calculate_stress_score(quiz, raw.get("chat_transcript", []))
        summary["attention_score"] = calculate_attention_score(quiz)
        summary["impulsivity"] = get_impulsivity_label(quiz)
        summary["emotional_bias"] = get_emotional_bias(quiz, raw.get("chat_transcript", []))
        
        # Map stress score to label
        s_score = summary["stress_score"]
        if s_score < 0.33:
            summary["stress_label"] = "Low"
        elif s_score < 0.66:
            summary["stress_label"] = "Moderate"
        else:
            summary["stress_label"] = "High"

    if source in ["chat", "both"]:
        # Add LLM extracted data if available
        llm_data = raw.get("llm_extracted", {})
        summary["clinical_notes"] = llm_data
        
    return summary
