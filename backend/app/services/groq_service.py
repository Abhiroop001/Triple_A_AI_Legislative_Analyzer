from groq import Groq
from app.config import settings
import json
import re
client = Groq(api_key=settings.GROQ_API_KEY)

def run_groq(prompt: str):
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",   # fast + stable
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    return response.choices[0].message.content

def clean_json(text: str):
    try:
        text = re.sub(r"```json|```", "", text).strip()
        return json.loads(text)
    except:
        return {
            "raw_output": text,
            "error": "Invalid JSON returned from model"
        }


def full_analysis(text: str):
    prompt = f"""
Return ONLY valid JSON. No explanation.

Format:
{{
 "summary": "...",
 "keywords": ["..."],
 "key_points": ["..."],
 "risks": ["..."]
}}

Document:
{text}
"""
    return clean_json(run_groq(prompt))

def simple_explain(text: str):
    prompt = f"""
Explain this law in very simple terms (like for a 15-year-old).

Keep it short and easy.

Document:
{text}
"""
    return {"simple_explanation": run_groq(prompt)}

def extract_keywords(text):
    prompt = f"""
Return ONLY JSON:
{{
 "keywords": ["...", "..."]
}}

Extract top 10 legal keywords from:

{text}
"""
    return run_groq(prompt)

def risk_score(text):
    prompt = f"""
Analyze legal risks realistically.

Return JSON:
{{
 "risk_score": (1-10),
 "reason": "short explanation"
}}

{text}
"""
    return run_groq(prompt)

def pros_cons(text: str):
    prompt = f"""
Return ONLY valid JSON:

{{
 "pros": ["..."],
 "cons": ["..."]
}}

Document:
{text}
"""
    return clean_json(run_groq(prompt))

def impact_analysis(text: str):
    prompt = f"""
Return ONLY valid JSON:

{{
 "citizens": "...",
 "businesses": "...",
 "government": "..."
}}

Document:
{text}
"""
    return clean_json(run_groq(prompt))

def headline(text: str):
    prompt = f"""
Generate a short news headline for this law.

Document:
{text}
"""
    return {"headline": run_groq(prompt)}

def ask_question(text: str, question: str):
    prompt = f"""
Answer ONLY using the given law.

Law:
{text}

Question:
{question}
"""
    return {"answer": run_groq(prompt)}

def one_line_summary(text: str):
    prompt = f"""
Give a ONE line summary of this law.

Document:
{text}
"""
    return {"summary": run_groq(prompt)}