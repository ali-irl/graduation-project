import json
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# الرابط الصحيح لقاعدة بيانات أوراكل APEX الخاصة بمشروع SGPMS
APEX_URL = "https://apex.oracle.com/ords/abdalluhcis1/supervisortab/"

# 1. مسار جلب الدكاترة (مباشرة من أوراكل)
@app.route('/api/supervisors', methods=['GET'])
def get_supervisors():
    try:
        # إعدادات لضمان عدم حظر الطلب وسرعة الاستجابة
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        
        # طلب البيانات مع timeout لمدة 10 ثواني لمنع التعليق
        response = requests.get(APEX_URL, headers=headers, timeout=10, verify=False)
        
        # ضبط الترميز ليدعم الأسماء العربية بشكل صحيح
        response.encoding = 'utf-8' 
        data = response.json()
        
        # جلب المصفوفة من أوراكل (دايماً بتكون تحت اسم items)
        apex_items = data.get('items', [])
        
        apex_items = data.get('items', [])
        
        # هاي الجملة رح تطبع أول دكتور بالـ Terminal عشان نكشف أسماء الأعمدة الحقيقية
        if len(apex_items) > 0:
            print("💡 Raw Oracle Data (First Item):", apex_items[0])

        formatted_sups = []
        for s in apex_items:
            # توحيد كل المفاتيح (أسماء الأعمدة) لتصير أحرف صغيرة عشان نتجنب أي تعقيد
            s_clean = {str(k).lower(): v for k, v in s.items()}
            
            # بنحاول نسحب الداتا بأكثر من اسم محتمل
            full_name = s_clean.get('supervisor_name') or s_clean.get('name') or 'غير معروف'
            specialization = s_clean.get('supervisor_specialization') or s_clean.get('specialization') or 'CIS'
            max_cap = s_clean.get('max_group_capacity') or s_clean.get('max_capacity') or 5
            sup_id = s_clean.get('supervisor_id') or s_clean.get('id')

            # تقسيم الاسم بالعربي (مثلاً: ضياء الزعبي -> ['ضياء', 'الزعبي'])
            name_parts = full_name.split()
            initials = "".join([n[0] for n in name_parts if n])[:2] if name_parts else "??"

            formatted_sups.append({
                "id": sup_id,
                "name": full_name,
                "area": specialization,
                "max": max_cap,
                "groups": 0, 
                "initials": initials
            })            
        # إرجاع البيانات بتنسيق JSON يدعم العربية (ensure_ascii=False)
        return app.response_class(
            response=json.dumps(formatted_sups, ensure_ascii=False),
            status=200,
            mimetype='application/json'
        )
        
    except Exception as e:
        print(f"🚨 Error: {e}")
        return jsonify({
            "error": "Unable to reach Database", 
            "details": str(e)
        }), 500

# 2. مسار تسجيل الدخول (مؤقت لحين ربط جداول الطلاب والدكاترة)
@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    data = request.json
    user_id = data.get('id')
    password = data.get('password')
    role = data.get('role')

    # حسابات تجريبية للنظام
    users_db = {
        "student": {"id": "165555", "pass": "123456", "name": "Abdalluh Alsawalmeh", "initials": "AA"},
        "doctor":  {"id": "1001", "pass": "123456", "name": "Dr. Deya Al-Zoubi", "initials": "DA"},
        "admin":   {"id": "9001", "pass": "123456", "name": "Prof. Ahmad", "initials": "PA"}
    }

    if role in users_db:
        v = users_db[role]
        if user_id == v["id"] and password == v["pass"]:
            return jsonify({
                "status": "success", 
                "user": {"name": v["name"], "initials": v["initials"]}
            }), 200

    return jsonify({"status": "error", "message": "الرقم الجامعي أو كلمة السر خطأ"}), 401

if __name__ == '__main__':
    app.run(debug=True, port=5000)