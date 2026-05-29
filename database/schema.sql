-- ============================================================
--  Academic Analytics Platform — Database Schema
--  Run this in: Supabase SQL Editor → New Query → Run
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('student','lecturer','admin')),
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Departments
CREATE TABLE IF NOT EXISTS departments (
    id           SERIAL PRIMARY KEY,
    code         VARCHAR(10)  UNIQUE NOT NULL,
    name         VARCHAR(255) NOT NULL,
    faculty      VARCHAR(255) NOT NULL,
    head_of_dept VARCHAR(255),
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
    id            SERIAL PRIMARY KEY,
    code          VARCHAR(20)  UNIQUE NOT NULL,
    title         VARCHAR(255) NOT NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    credits       INTEGER NOT NULL DEFAULT 3,
    semester      INTEGER NOT NULL CHECK (semester IN (1,2)),
    level         INTEGER NOT NULL CHECK (level IN (100,200,300,400,500)),
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS students (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matric_number  VARCHAR(30) UNIQUE NOT NULL,
    full_name      VARCHAR(255) NOT NULL,
    email          VARCHAR(255) UNIQUE NOT NULL,
    gender         VARCHAR(10) CHECK (gender IN ('Male','Female')),
    date_of_birth  DATE,
    department_id  INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    level          INTEGER NOT NULL CHECK (level IN (100,200,300,400,500)),
    session        VARCHAR(20) NOT NULL,
    admission_year INTEGER,
    user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Grades
CREATE TABLE IF NOT EXISTS grades (
    id           SERIAL PRIMARY KEY,
    student_id   UUID    NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id    INTEGER NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
    ca_score     NUMERIC(5,2) CHECK (ca_score   BETWEEN 0 AND 30),
    exam_score   NUMERIC(5,2) CHECK (exam_score BETWEEN 0 AND 70),
    total_score  NUMERIC(5,2) GENERATED ALWAYS AS (ca_score + exam_score) STORED,
    letter_grade VARCHAR(2),
    grade_point  NUMERIC(3,1),
    session      VARCHAR(20) NOT NULL,
    semester     INTEGER     NOT NULL CHECK (semester IN (1,2)),
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, course_id, session, semester)
);

-- At-Risk Flags
CREATE TABLE IF NOT EXISTS at_risk_flags (
    id            SERIAL PRIMARY KEY,
    student_id    UUID    NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    risk_score    NUMERIC(5,4) NOT NULL CHECK (risk_score BETWEEN 0 AND 1),
    risk_level    VARCHAR(10)  NOT NULL CHECK (risk_level IN ('high','medium','low')),
    cgpa          NUMERIC(4,2),
    total_failures INTEGER DEFAULT 0,
    avg_attendance NUMERIC(5,2),
    key_factors   JSONB,
    predicted_at  TIMESTAMPTZ DEFAULT NOW(),
    session       VARCHAR(20) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_students_dept    ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_level   ON students(level);
CREATE INDEX IF NOT EXISTS idx_grades_student   ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_session   ON grades(session);
CREATE INDEX IF NOT EXISTS idx_at_risk_student  ON at_risk_flags(student_id);
CREATE INDEX IF NOT EXISTS idx_at_risk_level    ON at_risk_flags(risk_level);

-- Auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- View: student CGPA summary
CREATE OR REPLACE VIEW student_gpa AS
SELECT
    s.id AS student_id,
    s.matric_number, s.full_name, s.level, s.session,
    d.name AS department,
    ROUND(SUM(g.grade_point * c.credits) / NULLIF(SUM(c.credits),0), 2) AS cgpa,
    COUNT(g.id) AS courses_taken,
    SUM(CASE WHEN g.grade_point < 1.0 THEN 1 ELSE 0 END) AS failed_courses
FROM students s
LEFT JOIN grades g      ON g.student_id = s.id
LEFT JOIN courses c     ON c.id = g.course_id
LEFT JOIN departments d ON d.id = s.department_id
GROUP BY s.id, s.matric_number, s.full_name, s.level, s.session, d.name;

-- View: department performance summary
CREATE OR REPLACE VIEW department_performance AS
SELECT
    d.id AS department_id, d.name AS department, d.faculty,
    COUNT(DISTINCT s.id)  AS total_students,
    ROUND(AVG(sg.cgpa)::numeric, 2) AS avg_cgpa,
    COUNT(DISTINCT CASE WHEN sg.cgpa >= 1.0 THEN s.id END)            AS passing_students,
    COUNT(DISTINCT CASE WHEN ar.risk_level = 'high' THEN s.id END)    AS high_risk_count
FROM departments d
LEFT JOIN students s     ON s.department_id = d.id
LEFT JOIN student_gpa sg ON sg.student_id = s.id
LEFT JOIN at_risk_flags ar ON ar.student_id = s.id
    AND ar.session = (SELECT MAX(session) FROM at_risk_flags)
GROUP BY d.id, d.name, d.faculty;
