import os
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# 1. Setup
load_dotenv()
app = Flask(__name__)
CORS(app)

# 2. Configure Gemini
API_KEY = os.getenv("AIzaSyDyCrOqbKiiR1JhcvW1cmIUisoraaq_7Ps")
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

# 3. Load Teachers Data once at startup
try:
    teachers_df = pd.read_excel('teachers.xlsx')
    # Create a simple string of doctors and their expertise for the AI to read
    teachers_info = ""
    for _, row in teachers_df.iterrows():
        teachers_info += f"- {row['Doctor Name']}: Expertise in {row['Specialization']} ({row['Expertise Keywords']})\n"
except Exception as e:
    print(f"⚠️ Warning: Could not load teachers.xlsx: {e}")
    teachers_info = "Note: No supervisor data available currently."

chat_session = None

# 4. UPDATED SYSTEM INSTRUCTIONS
SYSTEM_INSTRUCTIONS = f"""
You are the SGPMS Assistant for Jordan University of Science and Technology (JUST).
Your goal is to suggest 3 innovative graduation projects for IT students.

RULES:
1. Provide exactly 3 project suggestions.
2. Keep descriptions very SHORT and concise (max 2-3 sentences per project).
3. STRICTLY NO SOURCE CODE or full architectures. 
4. For each project, choose the most relevant supervisor from the list below.
5. After every project description, you MUST include the supervisor recommendation in this EXACT bracketed format:
   (Dr. {{Name}} specializes in {{Specialization}}, you can ask him for advice)

AVAILABLE SUPERVISORS:
{teachers_info}
"""

@app.route('/api/init_chat', methods=['POST'])
def init_chat():
    global chat_session
    data = request.json
    major = data.get('major', 'IT')
    interests = data.get('interests', 'General')

    prompt = f"{SYSTEM_INSTRUCTIONS}\n\nStudent Major: {major}\nInterest: {interests}\n\nSuggest 3 projects now."

    try:
        chat_session = model.start_chat(history=[])
        response = chat_session.send_message(prompt)
        return jsonify({"reply": response.text})
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"reply": "AI is temporarily offline."}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    global chat_session
    user_msg = request.json.get('message')
    
    if chat_session is None:
        return jsonify({"reply": "Session lost. Please refresh."}), 400

    try:
        response = chat_session.send_message(user_msg)
        return jsonify({"reply": response.text})
    except Exception as e:
        return jsonify({"reply": "AI Error."}), 500

if __name__ == '__main__':
    print("✅ SGPMS Backend (AI Brainstorm + Teacher Excel) Ready at http://127.0.0.1:5000")
    app.run(port=5001, debug=True)