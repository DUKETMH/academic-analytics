"""
Academic Analytics Platform — Flask API
Entry point for Vercel Python serverless + local dev.
Run locally: python api/index.py
"""

import os, sys, datetime
from functools import wraps
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv(ROOT / ".env")

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

DATABASE_URL  = os.environ.get("DATABASE_URL", "")
JWT_SECRET    = os.environ.get("JWT_SECRET", "dev-secret-change-me")
JWT_EXP_HOURS = 24

# ── DB ────────────────────────────────────────────────────────────────────────
_engine = None

def get_engine():
    global _engine
    if _engine is None and DATABASE_URL:
        _engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    return _engine

def db_query(sql, params=None):
    try:
        engine = get_engine()
        if engine is None:
            return None
        with engine.connect() as conn:
            result = conn.execute(text(sql), params or {})
            cols = result.keys()
            return [dict(zip(cols, row)) for row in result.fetchall()]
    except Exception as e:
        print(f"[DB] Query failed, using fallback: {e}")
        return None

def db_execute(sql, params=None):
    try:
        engine = get_engine()
        if engine is None:
            return None
        with engine.begin() as conn:
            return conn.execute(text(sql), params or {}).rowcount
    except Exception as e:
        print(f"[DB] Execute failed: {e}")
        return None

# ── JWT ───────────────────────────────────────────────────────────────────────
def create_token(user_id, email, role):
    payload = {
        "sub":   user_id,
        "email": email,
        "role":  role,
        "exp":   datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXP_HOURS),
        "iat":   datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "Authorization header missing"}), 401
        try:
            data = jwt.decode(auth.split(" ", 1)[1], JWT_SECRET, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        return f(data, *args, **kwargs)
    return decorated

# ── ML ────────────────────────────────────────────────────────────────────────
_model = _scaler = _feature_names = None

def load_ml():
    global _model, _scaler, _feature_names
    if _model is not None:
        return True
    try:
        import joblib
        ml = ROOT / "ml"
        _model         = joblib.load(ml / "model.pkl")
        _scaler        = joblib.load(ml / "scaler.pkl")
        _feature_names = joblib.load(ml / "feature_names.pkl")
        return True
    except Exception as e:
        print(f"[ML] {e}")
        return False

# ── Mock data fallback ────────────────────────────────────────────────────────
MOCK_STUDENTS = [
    {"id":"s1",  "matric_number":"CSC/19/001","full_name":"Adaeze Nwosu",       "email":"adaeze@student.edu.ng",   "gender":"Female","department":"Computer Science",       "level":400,"session":"2023/2024","cgpa":4.20,"failed_courses":0,"courses_taken":4},
    {"id":"s2",  "matric_number":"CSC/19/002","full_name":"Emeka Okonkwo",      "email":"emeka@student.edu.ng",    "gender":"Male",  "department":"Computer Science",       "level":400,"session":"2023/2024","cgpa":2.80,"failed_courses":1,"courses_taken":4},
    {"id":"s3",  "matric_number":"CSC/19/003","full_name":"Chioma Eze",         "email":"chioma@student.edu.ng",   "gender":"Female","department":"Computer Science",       "level":400,"session":"2023/2024","cgpa":4.80,"failed_courses":0,"courses_taken":4},
    {"id":"s4",  "matric_number":"CSC/19/004","full_name":"Tunde Adeyemi",      "email":"tunde@student.edu.ng",    "gender":"Male",  "department":"Computer Science",       "level":400,"session":"2023/2024","cgpa":1.20,"failed_courses":3,"courses_taken":4},
    {"id":"s5",  "matric_number":"CSC/19/005","full_name":"Ngozi Okafor",       "email":"ngozi@student.edu.ng",    "gender":"Female","department":"Computer Science",       "level":400,"session":"2023/2024","cgpa":3.60,"failed_courses":0,"courses_taken":4},
    {"id":"s6",  "matric_number":"EEE/19/001","full_name":"Rotimi Akande",      "email":"rotimi@student.edu.ng",   "gender":"Male",  "department":"Electrical Engineering", "level":400,"session":"2023/2024","cgpa":3.20,"failed_courses":0,"courses_taken":4},
    {"id":"s7",  "matric_number":"EEE/19/002","full_name":"Taiwo Oduola",       "email":"taiwo@student.edu.ng",    "gender":"Female","department":"Electrical Engineering", "level":400,"session":"2023/2024","cgpa":2.60,"failed_courses":1,"courses_taken":4},
    {"id":"s8",  "matric_number":"MEE/19/001","full_name":"Chibuzor Obi",       "email":"chibuzor@student.edu.ng", "gender":"Male",  "department":"Mechanical Engineering", "level":400,"session":"2023/2024","cgpa":3.80,"failed_courses":0,"courses_taken":4},
    {"id":"s9",  "matric_number":"CVE/19/001","full_name":"Perpetua Onyekwere", "email":"perpetua@student.edu.ng", "gender":"Female","department":"Civil Engineering",      "level":400,"session":"2023/2024","cgpa":4.00,"failed_courses":0,"courses_taken":4},
    {"id":"s10", "matric_number":"CHE/19/001","full_name":"Onyinye Nwosu",      "email":"onyinye@student.edu.ng",  "gender":"Female","department":"Chemical Engineering",   "level":400,"session":"2023/2024","cgpa":3.40,"failed_courses":0,"courses_taken":4},
    {"id":"s11", "matric_number":"CSC/19/006","full_name":"Chidi Ugwu",         "email":"chidi@student.edu.ng",    "gender":"Male",  "department":"Computer Science",       "level":400,"session":"2023/2024","cgpa":1.60,"failed_courses":2,"courses_taken":4},
    {"id":"s12", "matric_number":"CSC/19/007","full_name":"Amara Obiora",       "email":"amara@student.edu.ng",    "gender":"Female","department":"Computer Science",       "level":400,"session":"2023/2024","cgpa":3.90,"failed_courses":0,"courses_taken":4},
]

MOCK_ANALYTICS = {
    "summary": {"total_students":44,"avg_cgpa":3.12,"at_risk_count":8,"pass_rate":81.8,"total_courses":26,"active_session":"2023/2024"},
    "by_department": [
        {"department":"Computer Science",       "avg_cgpa":3.18,"total_students":15,"high_risk_count":3},
        {"department":"Electrical Engineering", "avg_cgpa":3.05,"total_students":8, "high_risk_count":2},
        {"department":"Mechanical Engineering", "avg_cgpa":3.42,"total_students":7, "high_risk_count":1},
        {"department":"Civil Engineering",      "avg_cgpa":3.28,"total_students":7, "high_risk_count":1},
        {"department":"Chemical Engineering",   "avg_cgpa":2.90,"total_students":7, "high_risk_count":1},
    ],
    "trends": [
        {"session":"2019/2020","avg_cgpa":2.88,"pass_rate":75.2},
        {"session":"2020/2021","avg_cgpa":2.95,"pass_rate":77.1},
        {"session":"2021/2022","avg_cgpa":3.02,"pass_rate":79.4},
        {"session":"2022/2023","avg_cgpa":3.08,"pass_rate":80.6},
        {"session":"2023/2024","avg_cgpa":3.12,"pass_rate":81.8},
    ],
    "grade_distribution": [
        {"grade":"A (70-100)","count":42,"percentage":18.4},
        {"grade":"B (60-69)", "count":78,"percentage":34.2},
        {"grade":"C (50-59)", "count":61,"percentage":26.8},
        {"grade":"D (45-49)", "count":23,"percentage":10.1},
        {"grade":"E (40-44)", "count":12,"percentage":5.3},
        {"grade":"F (<40)",   "count":12,"percentage":5.3},
    ],
}

MOCK_AT_RISK = [
    {"id":"s4", "matric_number":"CSC/19/004","full_name":"Tunde Adeyemi", "department":"Computer Science",       "level":400,"cgpa":1.20,"risk_score":0.89,"risk_level":"high",  "key_factors":["Low CA scores","Multiple failures","High absenteeism"]},
    {"id":"s11","matric_number":"CSC/19/006","full_name":"Chidi Ugwu",    "department":"Computer Science",       "level":400,"cgpa":1.60,"risk_score":0.82,"risk_level":"high",  "key_factors":["Below-average exam scores","Failed 2 courses"]},
    {"id":"s2", "matric_number":"CSC/19/002","full_name":"Emeka Okonkwo", "department":"Computer Science",       "level":400,"cgpa":2.80,"risk_score":0.61,"risk_level":"medium","key_factors":["Declining trend","Low study time"]},
    {"id":"s7", "matric_number":"EEE/19/002","full_name":"Taiwo Oduola",  "department":"Electrical Engineering", "level":400,"cgpa":2.60,"risk_score":0.58,"risk_level":"medium","key_factors":["Borderline CGPA","Poor exam performance"]},
]

# ═══════════════════════════════════════════════════════════════════════════════
# ROUTES
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/health")
def health():
    return jsonify({"status":"ok","version":"1.0.0","db":bool(DATABASE_URL)})

# ── Auth ──────────────────────────────────────────────────────────────────────
@app.route("/api/auth/login", methods=["POST"])
def login():
    data     = request.get_json(silent=True) or {}
    email    = data.get("email","").strip().lower()
    password = data.get("password","")
    if not email or not password:
        return jsonify({"error":"Email and password required"}), 400

    rows = db_query("SELECT id,email,password_hash,full_name,role FROM users WHERE email=:e", {"e":email})
    if rows:
        u = rows[0]
        if not check_password_hash(u["password_hash"], password):
            return jsonify({"error":"Invalid credentials"}), 401
        token = create_token(str(u["id"]), u["email"], u["role"])
        return jsonify({"token":token,"user":{"id":str(u["id"]),"email":u["email"],"full_name":u["full_name"],"role":u["role"]}})

    # Demo fallback
    DEMO = {
        "admin@university.edu.ng":    ("Admin User",    "admin"),
        "lecturer@university.edu.ng": ("Dr. Chukwu Emeka","lecturer"),
        "student@university.edu.ng":  ("Adaeze Nwosu",  "student"),
    }
    if email in DEMO and password == "Password123":
        name, role = DEMO[email]
        return jsonify({"token":create_token(email,email,role),"user":{"id":email,"email":email,"full_name":name,"role":role}})

    return jsonify({"error":"Invalid credentials"}), 401

@app.route("/api/auth/me")
@token_required
def me(u):
    return jsonify({"user":u})

# ── Students ──────────────────────────────────────────────────────────────────
@app.route("/api/students")
@token_required
def get_students(u):
    dept    = request.args.get("department")
    level   = request.args.get("level")
    session = request.args.get("session")
    sql = """
        SELECT s.id,s.matric_number,s.full_name,s.email,s.gender,s.level,s.session,
               d.name AS department,
               COALESCE(sg.cgpa,0) AS cgpa,
               COALESCE(sg.failed_courses,0) AS failed_courses,
               COALESCE(sg.courses_taken,0) AS courses_taken
        FROM students s
        LEFT JOIN departments d  ON d.id=s.department_id
        LEFT JOIN student_gpa sg ON sg.student_id=s.id
        WHERE 1=1
    """
    params = {}
    if dept:    sql += " AND d.name=:dept";    params["dept"]    = dept
    if level:   sql += " AND s.level=:level";  params["level"]   = int(level)
    if session: sql += " AND s.session=:sess"; params["sess"]    = session
    sql += " ORDER BY d.name,s.level,s.full_name"

    rows = db_query(sql, params)
    if rows is None:
        students = MOCK_STUDENTS
        if dept:  students = [s for s in students if s["department"]==dept]
        if level: students = [s for s in students if s["level"]==int(level)]
        return jsonify({"students":students,"total":len(students),"source":"mock"})
    return jsonify({"students":[dict(r) for r in rows],"total":len(rows),"source":"database"})

@app.route("/api/students/<sid>")
@token_required
def get_student(u, sid):
    rows = db_query("SELECT s.*,d.name AS department FROM students s LEFT JOIN departments d ON d.id=s.department_id WHERE s.id=:sid", {"sid":sid})
    if not rows:
        return jsonify({"error":"Student not found"}), 404
    student = dict(rows[0])
    grades  = db_query("""
        SELECT c.code,c.title,c.credits,g.ca_score,g.exam_score,g.total_score,
               g.letter_grade,g.grade_point,g.session,g.semester
        FROM grades g JOIN courses c ON c.id=g.course_id
        WHERE g.student_id=:sid ORDER BY g.session DESC,g.semester,c.code
    """, {"sid":sid})
    student["grades"] = [dict(g) for g in (grades or [])]
    return jsonify({"student":student})

# ── Analytics ─────────────────────────────────────────────────────────────────
@app.route("/api/analytics/summary")
@token_required
def analytics_summary(u):
    rows = db_query("""
        SELECT COUNT(DISTINCT s.id) AS total_students,
               ROUND(AVG(sg.cgpa)::numeric,2) AS avg_cgpa,
               COUNT(DISTINCT CASE WHEN ar.risk_level='high' THEN s.id END) AS at_risk_count,
               ROUND(100.0*COUNT(DISTINCT CASE WHEN sg.cgpa>=1.0 THEN s.id END)/NULLIF(COUNT(DISTINCT s.id),0),1) AS pass_rate
        FROM students s
        LEFT JOIN student_gpa sg ON sg.student_id=s.id
        LEFT JOIN at_risk_flags ar ON ar.student_id=s.id
    """)
    if rows is None:
        return jsonify(MOCK_ANALYTICS["summary"])
    summary = dict(rows[0])
    summary.update({"total_courses":26,"active_session":"2023/2024"})
    return jsonify(summary)

@app.route("/api/analytics/by-department")
@token_required
def analytics_by_dept(u):
    rows = db_query("SELECT * FROM department_performance ORDER BY avg_cgpa DESC")
    return jsonify([dict(r) for r in rows] if rows is not None else MOCK_ANALYTICS["by_department"])

@app.route("/api/analytics/trends")
@token_required
def analytics_trends(u):
    rows = db_query("""
        SELECT g.session,ROUND(AVG(sg.cgpa)::numeric,2) AS avg_cgpa,
               ROUND(100.0*COUNT(DISTINCT CASE WHEN sg.cgpa>=1.0 THEN sg.student_id END)/NULLIF(COUNT(DISTINCT sg.student_id),0),1) AS pass_rate
        FROM grades g JOIN student_gpa sg ON sg.student_id=g.student_id
        GROUP BY g.session ORDER BY g.session
    """)
    return jsonify([dict(r) for r in rows] if rows is not None else MOCK_ANALYTICS["trends"])

@app.route("/api/analytics/grade-distribution")
@token_required
def grade_distribution(u):
    rows = db_query("""
        SELECT letter_grade AS grade,COUNT(*) AS count,
               ROUND(100.0*COUNT(*)/SUM(COUNT(*)) OVER(),1) AS percentage
        FROM grades GROUP BY letter_grade
        ORDER BY CASE letter_grade WHEN 'A' THEN 1 WHEN 'B' THEN 2 WHEN 'C' THEN 3 WHEN 'D' THEN 4 WHEN 'E' THEN 5 ELSE 6 END
    """)
    return jsonify([dict(r) for r in rows] if rows is not None else MOCK_ANALYTICS["grade_distribution"])

# ── Predictions ───────────────────────────────────────────────────────────────
@app.route("/api/predictions/at-risk")
@token_required
def get_at_risk(u):
    rows = db_query("""
        SELECT s.id,s.matric_number,s.full_name,s.level,d.name AS department,
               sg.cgpa,ar.risk_score,ar.risk_level,ar.key_factors,ar.predicted_at
        FROM at_risk_flags ar
        JOIN students s ON s.id=ar.student_id
        LEFT JOIN departments d  ON d.id=s.department_id
        LEFT JOIN student_gpa sg ON sg.student_id=s.id
        WHERE ar.session='2023/2024' ORDER BY ar.risk_score DESC
    """)
    if rows is None:
        return jsonify({"at_risk":MOCK_AT_RISK,"total":len(MOCK_AT_RISK),"source":"mock"})
    return jsonify({"at_risk":[dict(r) for r in rows],"total":len(rows),"source":"database"})

@app.route("/api/predictions/predict", methods=["POST"])
@token_required
def predict(u):
    import numpy as np
    data     = request.get_json(silent=True) or {}
    features = data.get("features", {})

    if not load_ml():
        G1 = float(features.get("G1",10)); G2 = float(features.get("G2",10))
        failures = int(features.get("failures",0)); absences = int(features.get("absences",0))
        risk  = min(1.0, max(0.0, (1 - (G1+G2)/40)*0.7 + failures*0.15 + min(absences,30)/200))
        level = "high" if risk>=0.65 else "medium" if risk>=0.35 else "low"
        return jsonify({"risk_score":round(risk,4),"risk_level":level,"method":"heuristic"})

    vec = [float(features.get(f,0)) for f in _feature_names]
    X_s = _scaler.transform([vec])
    prob  = float(_model.predict_proba(X_s)[0][1])
    level = "high" if prob>=0.65 else "medium" if prob>=0.35 else "low"
    return jsonify({"risk_score":round(prob,4),"risk_level":level,"at_risk":bool(_model.predict(X_s)[0]),"method":"random_forest"})

# ── Departments ───────────────────────────────────────────────────────────────
@app.route("/api/departments")
@token_required
def get_departments(u):
    rows = db_query("SELECT id,code,name,faculty,head_of_dept FROM departments ORDER BY name")
    if rows is None:
        return jsonify([
            {"id":1,"code":"CSC","name":"Computer Science",       "faculty":"Faculty of Computing"},
            {"id":2,"code":"EEE","name":"Electrical Engineering", "faculty":"Faculty of Engineering"},
            {"id":3,"code":"MEE","name":"Mechanical Engineering", "faculty":"Faculty of Engineering"},
            {"id":4,"code":"CVE","name":"Civil Engineering",      "faculty":"Faculty of Engineering"},
            {"id":5,"code":"CHE","name":"Chemical Engineering",   "faculty":"Faculty of Engineering"},
        ])
    return jsonify([dict(r) for r in rows])

@app.errorhandler(404)
def not_found(e):  return jsonify({"error":"Not found"}), 404
@app.errorhandler(500)
def server_error(e): return jsonify({"error":"Server error"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
