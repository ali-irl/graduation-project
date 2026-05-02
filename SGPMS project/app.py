from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import torch
from sentence_transformers import SentenceTransformer, util
import google.generativeai as genai 

app = Flask(__name__)
CORS(app)

# --- 1. INITIALIZATION ---
print("Loading SGPMS Backend...")
# ⚠️ MAKE SURE YOU PASTE YOUR KEY HERE
API_KEY = "AIzaSyCitvOypRqn5xv5c4Y6-vI9ZYYuun6wj9w" 

genai.configure(api_key=API_KEY)
MODEL_ID = 'models/gemini-2.5-flash'
model = genai.GenerativeModel(model_name=MODEL_ID)
embed_model = SentenceTransformer('all-MiniLM-L6-v2')

# Load Excel files
projects_df = pd.read_excel('projects.xlsx')
teachers_df = pd.read_excel('teachers.xlsx')

projects_df['search_text'] = projects_df['Title'] + " " + projects_df['Keywords']
project_embeddings = embed_model.encode(projects_df['search_text'].tolist(), convert_to_tensor=True)

teachers_df['search_text'] = teachers_df['Specialization'] + " " + teachers_df['Expertise Keywords']
teacher_embeddings = embed_model.encode(teachers_df['search_text'].tolist(), convert_to_tensor=True)

chat_session = None

# --- 2. THE API ENDPOINTS ---

@app.route('/api/init_chat', methods=['POST'])
def init_chat():
    global chat_session
    data = request.json
    major = data.get('major', 'IT')
    interests = data.get('interests', 'General')
    context_data = "" 

    query_text = f"{major} {interests}"
    query_emb = embed_model.encode(query_text, convert_to_tensor=True)
    proj_scores = util.cos_sim(query_emb, project_embeddings)[0]
    top_indices = torch.topk(proj_scores, k=3).indices

    for idx in top_indices:
        p = projects_df.iloc[idx.item()]
        p_emb = embed_model.encode(p['Keywords'], convert_to_tensor=True)
        t_scores = util.cos_sim(p_emb, teacher_embeddings)[0]
        teacher = teachers_df.iloc[torch.argmax(t_scores).item()]
        context_data += f"- {p['Title']}. (For more help about this project, talk to: {teacher['Doctor Name']})\n"

    instructions = f"You are the JUST University SGPMS Assistant. Student Major: {major}, Interest: {interests}. Data: {context_data}. Be concise and end with a question."

    try:
        chat_session = model.start_chat(history=[])
        response = chat_session.send_message(instructions)
        return jsonify({"reply": response.text})
    except Exception as e:
        print(f"❌ Error in init: {e}")
        return jsonify({"reply": "Connection issue. Please try again."}), 500

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
        print(f"❌ Error in chat: {e}")
        return jsonify({"reply": "AI Error. Check terminal."}), 500

# --- 3. THE STARTUP BLOCK (THIS IS WHAT YOU WERE MISSING) ---
if __name__ == '__main__':
    print("✅ SGPMS Backend Ready at http://127.0.0.1:5000")
    app.run(port=5000, debug=True)