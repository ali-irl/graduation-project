from werkzeug.utils import secure_filename
from flask import send_from_directory
from datetime import datetime
import json
import sqlite3
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


DB_FILE = "sgpms.db"

def get_db_connection():
    conn = sqlite3.connect(DB_FILE, timeout=30)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # (SupervisorTab)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS SupervisorTab (
      Supervisor_ID INTEGER PRIMARY KEY,   
      Supervisor_Name TEXT NOT NULL,
      Supervisor_Specialization TEXT,
      Max_Group_Capacity INTEGER,
      Password TEXT NOT NULL ) ''')
    
    # (StudentTab) 
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS StudentTab (
            Student_ID INTEGER PRIMARY KEY,
            Student_Name TEXT NOT NULL,
            Student_Email TEXT UNIQUE NOT NULL,
            Student_Major TEXT,
            Student_Password TEXT NOT NULL,
            Group_Name TEXT
        )
    ''')

    # (ProjectRequestTab)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ProjectRequestTab (
            Project_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Project_Title TEXT NOT NULL,
            Project_Description TEXT,
            Project_Status TEXT DEFAULT 'Pending',
            Creation_Date TEXT,
            SupervisorTab_Supervisor_ID INTEGER,
            FOREIGN KEY (SupervisorTab_Supervisor_ID) REFERENCES SupervisorTab(Supervisor_ID) ON DELETE SET NULL
        )
    ''')

    # 5. (ProjectFileTab)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ProjectFileTab (
            File_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            File_Name TEXT NOT NULL,
            File_Path TEXT NOT NULL,
            Upload_Date TEXT,
            ProjectTab_Project_ID INTEGER,
            FOREIGN KEY (ProjectTab_Project_ID) REFERENCES ProjectRequestTab(Project_ID) ON DELETE CASCADE
        )
    ''')

    # 6.(ProgressReportTab)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ProgressReportTab (
            Report_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Progress_Percentage REAL,
            Week_Number INTEGER,
            ProjectTab_Project_ID INTEGER,
            FOREIGN KEY (ProjectTab_Project_ID) REFERENCES ProjectRequestTab(Project_ID) ON DELETE CASCADE
        )
    ''')

    # 7. (WeeklyMeetingTab)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS WeeklyMeetingTab (
            Meeting_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Meeting_Date TEXT,
            Meeting_Link_Socket TEXT,
            Meeting_Notes TEXT,
            ProjectTab_Project_ID INTEGER,
            SupervisorTab_Supervisor_ID INTEGER,
            FOREIGN KEY (ProjectTab_Project_ID) REFERENCES ProjectRequestTab(Project_ID) ON DELETE CASCADE,
            FOREIGN KEY (SupervisorTab_Supervisor_ID) REFERENCES SupervisorTab(Supervisor_ID) ON DELETE CASCADE
        )
    ''')
    

    cursor.execute("SELECT COUNT(*) FROM SupervisorTab")
    if cursor.fetchone()[0] == 0:
        supervisors_data = [
            (16, 'Dr. Deya AL-zoubi', 'Health Information Systems', 5),
            (17, 'Dr. Mustafa Ali', 'Artificial Intelligence', 5),
            (7, 'Dr. Amal Al-Zoubi', 'Cyber Security', 5),
            (6, 'Dr. Mohammad Shatnawi', 'Data Science', 5),
            (11, 'Dr. Jawad Damer', 'Web Development', 5),
            (10, 'Dr. Eyad Al Sherif', 'Mobile App Development', 5),
            (2, 'Dr. Hassan Najadat', 'CIS', 5),
            (1, 'Dr. Ismail Al-Humaidi', 'CIS', 5),
            (3, 'Dr. Shadi AL-Jawarneh', 'CIS', 5),
            (12, 'Dr. Rawan Khasawneh', 'CIS', 5),
            (5, 'Dr. Khaled Al-Khatib', 'CIS', 5),
            (15, 'Dr. Hisham Abanda', 'Computer Information System', 5),
            (14, 'Dr. Mustafa Radaideh', 'Software Engineering', 5),
            (13, 'Dr. Qais Marji', 'CIS', 5),
            (8, 'Dr. Rami Gharaybeh', 'Computer Science', 5)
        ]
        cursor.executemany('''
            INSERT INTO SupervisorTab (Supervisor_ID, Supervisor_Name, Supervisor_Specialization, Max_Group_Capacity)
            VALUES (?, ?, ?, ?)
        ''', supervisors_data)
        
    conn.commit()
    conn.close()

init_db()


# [1] SQLite
@app.route('/api/supervisors', methods=['GET'])
def get_supervisors():
    try:
        conn = get_db_connection()
        local_rows = conn.execute('SELECT * FROM SupervisorTab').fetchall()
        conn.close()
        
        formatted_sups = []
        for row in local_rows:
            full_name = row["Supervisor_Name"].strip()
            specialization = row["Supervisor_Specialization"].strip()
            max_cap = row["Max_Group_Capacity"]
            sup_id = row["Supervisor_ID"]
            
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
            
        return app.response_class(
            response=json.dumps(formatted_sups, ensure_ascii=False),
            status=200,
            mimetype='application/json'
        )
    except Exception as e:
        print(f"🚨 SQLite error in supervisors: {e}")
        return jsonify({"error": "Database Error", "details": str(e)}), 500



@app.route('/api/students', methods=['GET', 'OPTIONS'])
def get_students():
    if request.method == 'OPTIONS': 
        return jsonify({"status": "success"}), 200
    try:
        conn = get_db_connection()
        query = '''
            SELECT s.*, g.group_id as ValidGroup 
            FROM StudentTab s 
            LEFT JOIN ProjectGroups g ON s.Group_Name COLLATE NOCASE = g.group_name COLLATE NOCASE
        '''
        rows = conn.execute(query).fetchall()
        conn.close()
        
        formatted_students = []
        for row in rows:

            actual_group = row['Group_Name'] if row['ValidGroup'] else None
            
            formatted_students.append({
                "id": row['Student_ID'],
                "name": row['Student_Name'],
                "major": row['Student_Major'] or 'CIS',
                "email": row['Student_Email'],
                "group_name": actual_group 
            })
            
        return jsonify(formatted_students), 200
    except Exception as e:
        print(f"🚨 Error in students endpoint: {e}")
        return jsonify({"error": "Database Error"}), 500
    


@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
        
    data = request.json
    user_id = str(data.get('id', '')).strip()
    password = str(data.get('password', '')).strip()
    role = str(data.get('role', '')).lower()

    if user_id == "9001" and password == "123456" and role == "admin":
        return jsonify({"status": "success", "user": {"name": "Prof. Ahmad", "initials": "PA", "id": "9001"}}), 200

    try:
        conn = get_db_connection()
        if role == "student":
            user_row = conn.execute('SELECT * FROM StudentTab WHERE Student_ID = ?', (user_id,)).fetchone()
            if user_row and str(user_row["Student_Password"]).strip() == password:
                name = user_row["Student_Name"]
                initials = "".join([n[0] for n in name.split() if n])[:2] if name else "ST"
                conn.close()
                return jsonify({"status": "success", "user": {"name": name, "initials": initials, "id": user_id}}), 200
                
        elif role == "doctor" or role == "supervisor":
            user_row = conn.execute('SELECT * FROM SupervisorTab WHERE Supervisor_ID = ?', (user_id,)).fetchone()
            
            if user_row and str(user_row["Password"]).strip() == password: 
                name = user_row["Supervisor_Name"]
                initials = "".join([n[0] for n in name.split() if n])[:2] if name else "DR"
                conn.close()
                return jsonify({"status": "success", "user": {"name": name, "initials": initials, "id": user_id}}), 200
        conn.close()
    except Exception as e:
        print(f"🚨 Login Exception: {e}")


    return jsonify({"status": "error", "message": "Invalid University ID or Password"}), 401


@app.route('/api/update_capacity', methods=['POST', 'OPTIONS'])
def update_capacity():
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
    try:
        data = request.json
        sup_id = data.get('id')
        new_max = data.get('max_capacity')
        
        conn = get_db_connection()
        conn.execute('UPDATE SupervisorTab SET Max_Group_Capacity = ? WHERE Supervisor_ID = ?', (new_max, sup_id))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Capacity updated locally in SQLite"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": "Failed to update", "details": str(e)}), 500


@app.route('/api/add_supervisor', methods=['POST', 'OPTIONS'])
def add_supervisor():
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
    try:
        data = request.json
        sup_name = data.get('name')
        sup_specialization = data.get('specialization', 'CIS')
        max_capacity = data.get('max_capacity', 5)
        
        if not sup_name:
            return jsonify({"status": "error", "message": "اسم المشرف مطلوب!"}), 400
            
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO SupervisorTab (Supervisor_Name, Supervisor_Specialization, Max_Group_Capacity)
            VALUES (?, ?, ?)
        ''', (sup_name, sup_specialization, max_capacity))
        new_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            "status": "success", 
            "message": "تم إضافة المشرف بنجاح وحفظه في قاعدة البيانات!",
            "supervisor": {"id": new_id, "name": sup_name, "specialization": sup_specialization}
        }), 201
    except Exception as e:
        return jsonify({"error": "Server Error", "details": str(e)}), 500


@app.route('/api/requests', methods=['GET', 'POST', 'OPTIONS'])
def handle_requests():
    if request.method == 'OPTIONS':
        return jsonify({"status": "success"}), 200
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ProjectRequestTab (
                Request_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                Group_Name TEXT,
                Project_Title TEXT,
                Description TEXT,
                Tech_Stack TEXT,
                Team_Members TEXT,
                Academic_Year TEXT,
                Status TEXT DEFAULT 'pending_admin',
                Supervisor_Name TEXT,
                Supervisor_ID INTEGER,
                Submission_Date TEXT,
                Group_ID INTEGER
            )
        ''')
        
        try:
            cursor.execute("ALTER TABLE ProjectRequestTab ADD COLUMN Rejection_Reason TEXT")
        except:
            pass 
            
        if request.method == 'POST':
            data = request.json
            supervisor_id = data.get('supervisor_id')
            group_name = data.get('group').strip()
            team_members_str = data.get('teamMembers')
            group_id = data.get('group_id')
            
      
            if supervisor_id:
                sup = conn.execute('SELECT Max_Group_Capacity FROM SupervisorTab WHERE Supervisor_ID = ?', (supervisor_id,)).fetchone()
                active_groups = conn.execute("SELECT COUNT(*) FROM ProjectRequestTab WHERE Supervisor_ID = ? AND Status IN ('approved', 'ongoing')", (supervisor_id,)).fetchone()[0]
                if sup and active_groups >= sup['Max_Group_Capacity']:
                    conn.close()
                    return jsonify({"status": "error", "message": "عذراً، هذا المشرف وصل للحد الأقصى من المجموعات. يرجى اختيار دكتور آخر."}), 400

         
            import re
            student_ids = re.findall(r'\d+', str(team_members_str)) if team_members_str else []
            if len(student_ids) > 5:
                conn.close()
                return jsonify({"status": "error", "message": "لا يمكن أن تتجاوز المجموعة 5 طلاب."}), 400

          
            if not student_ids:
                conn.close()
                return jsonify({"status": "error", "message": "Team members field cannot be empty. Please enter at least one valid Student ID."}), 400

 
            invalid_ids = []
            for s_id in student_ids:
                try:
                    clean_id = int(s_id)
         
                    exists = conn.execute('SELECT 1 FROM StudentTab WHERE Student_ID = ?', (clean_id,)).fetchone()
                    if not exists:
                        invalid_ids.append(s_id)
                except ValueError:
                    invalid_ids.append(s_id)
            
    
            if invalid_ids:
                conn.close()
                error_msg = f"Invalid Student ID(s): {', '.join(invalid_ids)}. These IDs are not registered in the system."
                return jsonify({"status": "error", "message": error_msg}), 400

            if group_id:
                old_grp = conn.execute('SELECT group_name FROM ProjectGroups WHERE group_id = ?', (group_id,)).fetchone()
                if old_grp:
                    old_name = old_grp['group_name']
                
                    conn.execute('UPDATE ProjectGroups SET group_name = ? WHERE group_id = ?', (group_name, group_id))
                  
                    conn.execute('UPDATE StudentTab SET Group_Name = ? WHERE Group_Name = ?', (group_name, old_name))
            else:
               
                conn.execute('INSERT OR IGNORE INTO ProjectGroups (group_name) VALUES (?)', (group_name,))
                grp_info = conn.execute('SELECT group_id FROM ProjectGroups WHERE group_name COLLATE NOCASE = ?', (group_name,)).fetchone()
                if grp_info:
                    group_id = grp_info['group_id']


            for s_id in student_ids:
                try:
                    clean_id = int(s_id)
                    conn.execute('UPDATE StudentTab SET Group_Name = ? WHERE Student_ID = ?', (group_name, clean_id))
                except ValueError:
                    continue

       
            cursor.execute('''
                INSERT INTO ProjectRequestTab 
                (Group_Name, Project_Title, Description, Tech_Stack, Team_Members, Academic_Year, Supervisor_Name, Supervisor_ID, Submission_Date, Status, Group_ID)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                group_name, data.get('project'), data.get('description'), 
                data.get('techStack'), team_members_str, data.get('academicYear'),
                data.get('supervisor'), supervisor_id, data.get('date'), 
                data.get('status', 'pending_admin'), group_id 
            ))
            conn.commit()
            conn.close()
            return jsonify({"status": "success"}), 201
            
        elif request.method == 'GET':
            rows = cursor.execute('SELECT * FROM ProjectRequestTab').fetchall()
            conn.close()
            
            formatted_requests = []
            for row in rows:
                formatted_requests.append({
                    "id": row['Request_ID'],
                    "group": row['Group_Name'],
                    "project": row['Project_Title'],
                    "description": row['Description'],
                    "techStack": row['Tech_Stack'],
                    "teamMembers": row['Team_Members'],
                    "academicYear": row['Academic_Year'],
                    "supervisor": row['Supervisor_Name'],     
                    "supervisor_id": row['Supervisor_ID'],    
                    "date": row['Submission_Date'],
                    "status": row['Status'],
                    "reason": row['Rejection_Reason'] if 'Rejection_Reason' in row.keys() else "" 
                })
            return jsonify(formatted_requests), 200
            
    except Exception as e:
        print(f"🚨 Requests Endpoint Error: {e}")
        return jsonify({"error": "Database Error", "details": str(e)}), 500
    


@app.route('/api/requests/<int:req_id>', methods=['PUT', 'OPTIONS'])
def update_request_status(req_id):
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
    data = request.json
    new_status = data.get("status")
    reason = data.get("reason", "") 
            
    try:
        conn = get_db_connection()
        
      
        if new_status == 'pending_doctor':
            req_info = conn.execute('SELECT Supervisor_ID FROM ProjectRequestTab WHERE Request_ID = ?', (req_id,)).fetchone()
            if req_info and req_info['Supervisor_ID']:
                sup_id = req_info['Supervisor_ID']
                
              
                sup = conn.execute('SELECT Max_Group_Capacity FROM SupervisorTab WHERE Supervisor_ID = ?', (sup_id,)).fetchone()
                active_groups = conn.execute("SELECT COUNT(*) FROM ProjectRequestTab WHERE Supervisor_ID = ? AND Status IN ('approved', 'ongoing')", (sup_id,)).fetchone()[0]
                
                if sup and active_groups >= sup['Max_Group_Capacity']:
                    conn.close()
                    
                    return jsonify({"status": "error", "message": "عذراً، هذا المشرف وصل للحد الأقصى من المجموعات. قم بزيادة سعته من لوحة المشرفين أولاً."}), 400

   
        if new_status == 'approved':
            req = conn.execute('SELECT Group_Name, Team_Members, Group_ID FROM ProjectRequestTab WHERE Request_ID = ?', (req_id,)).fetchone()
            if req:
                group_name = str(req['Group_Name']).strip()
                team_members_str = str(req['Team_Members'])
                existing_group_id = req['Group_ID']
                
                if existing_group_id:
                    group_id = existing_group_id
                else:
                    conn.execute('CREATE TABLE IF NOT EXISTS ProjectGroups (group_id INTEGER PRIMARY KEY AUTOINCREMENT, group_name TEXT UNIQUE)')
                    conn.execute('INSERT OR IGNORE INTO ProjectGroups (group_name) VALUES (?)', (group_name,))
                    group_info = conn.execute('SELECT group_id FROM ProjectGroups WHERE group_name COLLATE NOCASE = ?', (group_name,)).fetchone()
                    group_id = group_info['group_id'] if group_info else None
                
                conn.execute('UPDATE ProjectRequestTab SET Status = ?, Rejection_Reason = ?, Group_ID = ? WHERE Request_ID = ?', 
                             (new_status, reason, group_id, req_id))
                
                if team_members_str:
                    import re
                    student_ids = re.findall(r'\d+', team_members_str)
                    for s_id in student_ids:
                        try:
                            clean_id = int(s_id)
                            conn.execute('UPDATE StudentTab SET Group_Name = ? WHERE Student_ID = ?', (group_name, clean_id))
                        except ValueError:
                            continue
            else:
                conn.execute('UPDATE ProjectRequestTab SET Status = ?, Rejection_Reason = ? WHERE Request_ID = ?', (new_status, reason, req_id))
        else:
            conn.execute('UPDATE ProjectRequestTab SET Status = ?, Rejection_Reason = ? WHERE Request_ID = ?', (new_status, reason, req_id))
            
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": f"Status updated to: {new_status}"}), 200
    except Exception as e:
        print(f"🚨 Error updating status: {e}")
        return jsonify({"status": "error", "message": "Failed to update status"}), 500



@app.route('/api/meetings', methods=['POST', 'OPTIONS'])
def create_meeting():
    if request.method == 'OPTIONS':
        return jsonify({"status": "success"}), 200
    try:
        data = request.json
  
        date_time_str = f"{data.get('date')} {data.get('time')}"
        notes = data.get('notes')
        link = data.get('link', 'https://teams.microsoft.com/')
        project_id = data.get('project_id')
        supervisor_id = data.get('supervisor_id')
        
        conn = get_db_connection()
        
   
        conn.execute('''
            INSERT INTO WeeklyMeetingTab (Meeting_Date, Meeting_Link_Socket, Meeting_Notes, ProjectTab_Project_ID, SupervisorTab_Supervisor_ID)
            VALUES (?, ?, ?, ?, ?)
        ''', (date_time_str, link, notes, int(project_id), int(supervisor_id)))
        
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Meeting scheduled successfully in DB!"}), 201
    except Exception as e:
        print(f"🚨 Error scheduling meeting in WeeklyMeetingTab: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500



@app.route('/api/meetings/<int:supervisor_id>', methods=['GET'])
def get_doctor_meetings(supervisor_id):
    try:
        conn = get_db_connection()

        query = '''
            SELECT m.Meeting_ID as id, m.Meeting_Date as date, m.Meeting_Link_Socket as link, 
                   m.Meeting_Notes as notes, r.Group_Name as group_name
                FROM WeeklyMeetingTab m
                LEFT JOIN ProjectRequestTab r ON m.ProjectTab_Project_ID = r.Request_ID
                WHERE m.SupervisorTab_Supervisor_ID = ?
                ORDER BY m.Meeting_ID DESC
        '''
        rows = conn.execute(query, (supervisor_id,)).fetchall()
        conn.close()
        return jsonify([dict(row) for row in rows]), 200
    except Exception as e:
        print(f"🚨 Error fetching doctor meetings: {e}")
        return jsonify([]), 200



@app.route('/api/meetings/delete/<int:meeting_id>', methods=['DELETE', 'OPTIONS'])
def delete_meeting(meeting_id):
    if request.method == 'OPTIONS':
        return jsonify({"status": "success"}), 200
    try:
        conn = get_db_connection()
        conn.execute('DELETE FROM WeeklyMeetingTab WHERE Meeting_ID = ?', (meeting_id,))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Meeting deleted successfully"}), 200
    except Exception as e:
        print(f"🚨 Error deleting meeting: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/delete_supervisor/<int:sup_id>', methods=['DELETE', 'OPTIONS'])
def delete_supervisor(sup_id):
    if request.method == 'OPTIONS': 
        return jsonify({"status": "success"}), 200
        
    try:
        conn = get_db_connection()
        sup = conn.execute('SELECT * FROM SupervisorTab WHERE Supervisor_ID = ?', (sup_id,)).fetchone()
        if not sup:
            conn.close()
            return jsonify({"status": "error", "message": "المشرف غير موجود!"}), 404
            
        conn.execute('DELETE FROM SupervisorTab WHERE Supervisor_ID = ?', (sup_id,))
        conn.commit()
        conn.close()
        
        print(f"🗑️ تم حذف المشرف صاحب الرقم {sup_id} بنجاح من SQLite.")
        return jsonify({"status": "success", "message": "تم حذف المشرف بنجاح من قاعدة البيانات!"}), 200
        
    except Exception as e:
        print(f"🚨 Error deleting supervisor from SQLite: {e}")
        return jsonify({"error": "Server Error", "details": str(e)}), 500



@app.route('/api/import_students_csv', methods=['POST', 'OPTIONS'])
def import_students_csv():
    if request.method == 'OPTIONS':
        return jsonify({"status": "success"}), 200
        
    try:
        if 'file' not in request.files:
            return jsonify({"status": "error", "message": "لم يتم إرسال أي ملف!"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"status": "error", "message": "اسم الملف فارغ!"}), 400

        file_bytes = file.read()
        file_content = file_bytes.decode('utf-8').splitlines()

        conn = get_db_connection()
        cursor = conn.cursor()
        inserted_count = 0

        start_row = 0
        if len(file_content) > 0 and ("id" in file_content[0].lower() or "name" in file_content[0].lower()):
            start_row = 1 

        for i in range(start_row, len(file_content)):
            line = file_content[i].strip()
            if not line:
                continue 
                
            row_data = line.split(',')
            
            if len(row_data) >= 4:
                student_id = row_data[0].strip()
                student_name = row_data[1].strip()
                student_email = row_data[2].strip()
                student_major = row_data[3].strip()
                student_password = "123456" 
                
                try:
                  
                    cursor.execute('''
                        INSERT OR IGNORE INTO StudentTab (Student_ID, Student_Name, Student_Email, Student_Major, Student_Password, Group_Name)
                        VALUES (?, ?, ?, ?, ?, NULL)
                    ''', (student_id, student_name, student_email, student_major, student_password))
                    
                    if cursor.rowcount > 0:
                        inserted_count += 1
                except Exception as inner_err:
                    print(f"⚠️ Skip row error: {inner_err}")

        conn.commit()
        conn.close()

        print(f"📊 تم استيراد وحفظ {inserted_count} طالب بنجاح من ملف الـ CSV إلى SQLite.")
        return jsonify({
            "status": "success",
            "message": "تم استيراد البيانات بنجاح!",
            "count": inserted_count
        }), 200

    except Exception as e:
        print(f"🚨 Error importing CSV to SQLite: {e}")
        return jsonify({"error": "Server Error", "details": str(e)}), 500


@app.route('/api/add_student', methods=['POST', 'OPTIONS'])
def add_student():
    if request.method == 'OPTIONS':
        return jsonify({"status": "success"}), 200
        
    try:
        data = request.json
        student_id = data.get('id')
        name = data.get('name')
        major = data.get('major', 'CIS')
        email = data.get('email')

        if not student_id or not name or not email:
            return jsonify({"status": "error", "message": "Missing required fields"}), 400

        default_password = "password123"

        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO StudentTab (Student_ID, Student_Name, Student_Email, Student_Major, Student_Password, Group_Name)
            VALUES (?, ?, ?, ?, ?, NULL)
        ''', (student_id, name, email, major, default_password))
        
        conn.commit()
        conn.close()
        
        return jsonify({"status": "success", "message": "Student added successfully to SQLite!"})
        
    except sqlite3.IntegrityError as e:
        print(f"🚨 IntegrityError: {e}")
        return jsonify({"status": "error", "message": "Student ID or Email already exists in Database."}), 400
    except Exception as e:
        print(f"🚨 General Error in add_student: {e}")
        return jsonify({"error": "Server Error", "details": str(e)}), 500
    

@app.route('/api/admin_create_group', methods=['POST', 'OPTIONS'])
def admin_create_group():
    if request.method == 'OPTIONS':
        return jsonify({"status": "success"}), 200
    try:
        data = request.json
        group_name = data.get('group_name')
        member_ids = data.get('members') 

        if not group_name or not member_ids:
            return jsonify({"status": "error", "message": "Group name and members are required"}), 400

        
        if len(member_ids) > 5:
            return jsonify({"status": "error", "message": "لا يمكن أن تتجاوز المجموعة 5 طلاب."}), 400

        group_name_clean = group_name.strip()
        conn = get_db_connection()
        
        conn.execute('CREATE TABLE IF NOT EXISTS ProjectGroups (group_id INTEGER PRIMARY KEY AUTOINCREMENT, group_name TEXT UNIQUE)')
        conn.execute('INSERT OR IGNORE INTO ProjectGroups (group_name) VALUES (?)', (group_name_clean,))
        
        for s_id in member_ids:
            s_id_str = str(s_id).strip()
            conn.execute('UPDATE StudentTab SET Group_Name = ? WHERE CAST(Student_ID AS TEXT) = ?', (group_name_clean, s_id_str))

        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": f"Group '{group_name_clean}' formed successfully!"})
    except Exception as e:
        print(f"🚨 Error forming group: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500



@app.route('/api/my_group/<student_id>', methods=['GET', 'OPTIONS'])
def get_my_group(student_id):
    if request.method == 'OPTIONS':
        return jsonify({"status": "success"}), 200
    try:
        conn = get_db_connection()
        
     
        conn.execute('CREATE TABLE IF NOT EXISTS ProjectGroups (group_id INTEGER PRIMARY KEY AUTOINCREMENT, group_name TEXT UNIQUE)')
        
        s_id_str = str(student_id).strip()
        
        student = conn.execute('SELECT Group_Name FROM StudentTab WHERE CAST(Student_ID AS TEXT) = ?', (s_id_str,)).fetchone()
        
        if not student or not student['Group_Name']:
            conn.close()
            return jsonify({"has_group": False}), 200
            
        group_name_clean = str(student['Group_Name']).strip()
        
       
        group_info = conn.execute('SELECT group_id FROM ProjectGroups WHERE group_name COLLATE NOCASE = ?', (group_name_clean,)).fetchone()
        
        if not group_info:
       
            conn.close()
            return jsonify({"has_group": False}), 200
            
        group_id = group_info['group_id']
        
        teammates = conn.execute('SELECT Student_ID, Student_Name, Student_Email FROM StudentTab WHERE Group_Name COLLATE NOCASE = ?', (group_name_clean,)).fetchall()
        conn.close()
        
        members = [{"id": row["Student_ID"], "name": row["Student_Name"], "email": row["Student_Email"]} for row in teammates]
        
        return jsonify({
            "has_group": True,
            "group_id": group_id,
            "group_name": group_name_clean,
            "members": members
        }), 200
        
    except Exception as e:
        print(f"🚨 Error fetching my group: {e}")
        return jsonify({"has_group": False}), 200


@app.route('/api/update_progress', methods=['POST', 'OPTIONS'])
def update_progress():
    if request.method == 'OPTIONS':
        return jsonify({"status": "success"}), 200
    try:
        data = request.json
        project_id = data.get('project_id')
        progress = data.get('progress')
        phase = data.get('phase')
        feedback = data.get('feedback')
        

        from datetime import datetime
        today_str = datetime.today().strftime('%b %d')
        
        conn = get_db_connection()
        

        try:
            conn.execute("ALTER TABLE ProgressReportTab ADD COLUMN Log_Date TEXT")
        except:
            pass
            
        
        last_week_row = conn.execute('''
            SELECT MAX(Week_Number) FROM ProgressReportTab 
            WHERE ProjectTab_Project_ID = ?
        ''', (project_id,)).fetchone()
        
        last_week = last_week_row[0] if last_week_row and last_week_row[0] is not None else 0
        next_week = last_week + 1

      
        conn.execute('''
            INSERT INTO ProgressReportTab (Progress_Percentage, Week_Number, ProjectTab_Project_ID, Phase, Feedback, Log_Date)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (float(progress), int(next_week), int(project_id), phase, feedback, today_str))
        
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": f"Progress saved for Week {next_week}"}), 200
    except Exception as e:
        print(f"🚨 Error updating progress in ProgressReportTab: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    


@app.route('/api/get_progress', methods=['GET'])
def get_progress():
    try:
        conn = get_db_connection()
   
        rows = conn.execute('''
            SELECT ProjectTab_Project_ID as project_id, Progress_Percentage as progress, Week_Number as week, Phase as phase, Feedback as feedback
            FROM ProgressReportTab 
            WHERE Report_ID IN (SELECT MAX(Report_ID) FROM ProgressReportTab GROUP BY ProjectTab_Project_ID)
        ''').fetchall()
        conn.close()
        return jsonify([dict(row) for row in rows]), 200
    except Exception as e:
        print(f"🚨 Error fetching progress history: {e}")
        return jsonify([]), 200

 

@app.route('/api/feedback_history/<int:supervisor_id>', methods=['GET'])
def get_feedback_history(supervisor_id):
    try:
        conn = get_db_connection()
        try:
            conn.execute("ALTER TABLE ProgressReportTab ADD COLUMN Log_Date TEXT")
        except:
            pass
            
      
        query = '''
            SELECT p.Phase as ph, p.Feedback as fb, p.Log_Date as d, r.Group_Name as g
            FROM ProgressReportTab p
            JOIN ProjectRequestTab r ON p.ProjectTab_Project_ID = r.Request_ID
            WHERE r.Supervisor_ID = ? AND p.Feedback IS NOT NULL AND p.Feedback != ''
            ORDER BY p.Report_ID DESC
        '''
        rows = conn.execute(query, (supervisor_id,)).fetchall()
        conn.close()
        
        return jsonify([dict(row) for row in rows]), 200
    except Exception as e:
        print(f"🚨 Error fetching feedback history: {e}")
        return jsonify([]), 200




UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/api/files/upload', methods=['POST', 'OPTIONS'])
def upload_file():
    if request.method == 'OPTIONS':
        return jsonify({"status": "success"}), 200
    try:
        if 'file' not in request.files:
            return jsonify({"status": "error", "message": "لم يتم العثور على ملف."}), 400
        
        file = request.files['file']
        project_id = request.form.get('project_id')
        
        if file.filename == '':
            return jsonify({"status": "error", "message": "لم يتم اختيار ملف."}), 400
            
        if file and project_id:

            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            
         
            upload_date = datetime.now().strftime("%Y-%m-%d %H:%M")
            
      
            conn = get_db_connection()
            conn.execute('''
                INSERT INTO ProjectFileTab (File_Name, File_Path, Upload_Date, ProjectTab_Project_ID)
                VALUES (?, ?, ?, ?)
            ''', (filename, filepath, upload_date, int(project_id)))
            conn.commit()
            conn.close()
            
            return jsonify({"status": "success", "message": "File uploaded successfully!"}), 201
    except Exception as e:
        print(f"🚨 File upload error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/files/<int:project_id>', methods=['GET'])
def get_files(project_id):
    try:
        conn = get_db_connection()
        files = conn.execute('SELECT File_ID as id, File_Name as name, Upload_Date as date FROM ProjectFileTab WHERE ProjectTab_Project_ID = ? ORDER BY File_ID DESC', (project_id,)).fetchall()
        conn.close()
        return jsonify([dict(row) for row in files]), 200
    except Exception as e:
        return jsonify([]), 500


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


@app.route('/api/files/delete/<int:file_id>', methods=['DELETE', 'OPTIONS'])
def delete_file(file_id):
    if request.method == 'OPTIONS':
        return jsonify({"status": "success"}), 200
    try:
        conn = get_db_connection()
        file_record = conn.execute('SELECT File_Path FROM ProjectFileTab WHERE File_ID = ?', (file_id,)).fetchone()
        if file_record and os.path.exists(file_record['File_Path']):
            os.remove(file_record['File_Path'])
            
        conn.execute('DELETE FROM ProjectFileTab WHERE File_ID = ?', (file_id,))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "File deleted"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == '__main__':
    init_db() 
    app.run(host='0.0.0.0', port=5000, debug=True)