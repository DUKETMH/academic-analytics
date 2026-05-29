-- ============================================================
--  Academic Analytics Platform — Seed Data
--  Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- Departments
INSERT INTO departments (code, name, faculty, head_of_dept) VALUES
  ('CSC','Computer Science',       'Faculty of Computing',    'Prof. A. Okafor'),
  ('EEE','Electrical Engineering', 'Faculty of Engineering',  'Prof. B. Nwosu'),
  ('MEE','Mechanical Engineering', 'Faculty of Engineering',  'Prof. C. Eze'),
  ('CVE','Civil Engineering',      'Faculty of Engineering',  'Dr. D. Amadi'),
  ('CHE','Chemical Engineering',   'Faculty of Engineering',  'Dr. E. Ogbonna')
ON CONFLICT DO NOTHING;

-- Courses
INSERT INTO courses (code, title, department_id, credits, semester, level) VALUES
  ('CSC101','Introduction to Computing',     1,3,1,100),('CSC102','Computer Programming I',        1,3,1,100),
  ('CSC103','Discrete Mathematics',          1,3,2,100),('CSC104','Computer Programming II',       1,3,2,100),
  ('CSC201','Data Structures & Algorithms',  1,3,1,200),('CSC202','Database Systems',              1,3,1,200),
  ('CSC203','Computer Architecture',         1,3,2,200),('CSC204','Operating Systems',             1,3,2,200),
  ('CSC301','Software Engineering',          1,3,1,300),('CSC302','Computer Networks',             1,3,1,300),
  ('CSC303','Artificial Intelligence',       1,3,2,300),('CSC304','Web Technologies',              1,3,2,300),
  ('CSC401','Machine Learning',              1,3,1,400),('CSC402','Final Year Project I',          1,6,1,400),
  ('CSC403','Information Security',          1,3,2,400),('CSC404','Final Year Project II',         1,6,2,400),
  ('EEE201','Circuit Theory',                2,3,1,200),('EEE202','Electronics I',                 2,3,2,200),
  ('EEE301','Power Systems',                 2,3,1,300),('EEE302','Control Systems',               2,3,2,300),
  ('MEE201','Engineering Mechanics',         3,3,1,200),('MEE301','Thermodynamics',                3,3,1,300),
  ('CVE201','Structural Analysis',           4,3,1,200),('CVE301','Geotechnical Engineering',      4,3,1,300),
  ('CHE201','Chemical Process Principles',   5,3,1,200),('CHE301','Reaction Engineering',          5,3,1,300)
ON CONFLICT DO NOTHING;

-- Users (password = "Password123" bcrypt hash)
INSERT INTO users (id, email, password_hash, full_name, role) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001','admin@university.edu.ng',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4D9fzCcyNW','Dr. Admin User','admin'),
  ('aaaaaaaa-0000-0000-0000-000000000002','lecturer@university.edu.ng',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4D9fzCcyNW','Dr. Chukwu Emeka','lecturer'),
  ('aaaaaaaa-0000-0000-0000-000000000003','student@university.edu.ng',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4D9fzCcyNW','Adaeze Nwosu','student')
ON CONFLICT DO NOTHING;

-- Students
INSERT INTO students (matric_number,full_name,email,gender,department_id,level,session,admission_year) VALUES
  ('CSC/19/001','Adaeze Nwosu',        'adaeze.nwosu@student.edu.ng',    'Female',1,400,'2023/2024',2019),
  ('CSC/19/002','Emeka Okonkwo',       'emeka.okonkwo@student.edu.ng',   'Male',  1,400,'2023/2024',2019),
  ('CSC/19/003','Chioma Eze',          'chioma.eze@student.edu.ng',      'Female',1,400,'2023/2024',2019),
  ('CSC/19/004','Tunde Adeyemi',       'tunde.adeyemi@student.edu.ng',   'Male',  1,400,'2023/2024',2019),
  ('CSC/19/005','Ngozi Okafor',        'ngozi.okafor@student.edu.ng',    'Female',1,400,'2023/2024',2019),
  ('CSC/19/006','Chidi Ugwu',          'chidi.ugwu@student.edu.ng',      'Male',  1,400,'2023/2024',2019),
  ('CSC/19/007','Amara Obiora',        'amara.obiora@student.edu.ng',    'Female',1,400,'2023/2024',2019),
  ('CSC/19/008','Ikenna Mbah',         'ikenna.mbah@student.edu.ng',     'Male',  1,400,'2023/2024',2019),
  ('CSC/19/009','Blessing Ogbu',       'blessing.ogbu@student.edu.ng',   'Female',1,400,'2023/2024',2019),
  ('CSC/19/010','Obinna Chukwu',       'obinna.chukwu@student.edu.ng',   'Male',  1,400,'2023/2024',2019),
  ('CSC/20/001','Sola Adesanya',       'sola.adesanya@student.edu.ng',   'Male',  1,300,'2023/2024',2020),
  ('CSC/20/002','Funmi Adeleke',       'funmi.adeleke@student.edu.ng',   'Female',1,300,'2023/2024',2020),
  ('CSC/20/003','Babatunde Fashola',   'babatunde.f@student.edu.ng',     'Male',  1,300,'2023/2024',2020),
  ('CSC/20/004','Yewande Bello',       'yewande.bello@student.edu.ng',   'Female',1,300,'2023/2024',2020),
  ('CSC/20/005','Seun Makinde',        'seun.makinde@student.edu.ng',    'Male',  1,300,'2023/2024',2020),
  ('CSC/21/001','Zainab Umar',         'zainab.umar@student.edu.ng',     'Female',1,200,'2023/2024',2021),
  ('CSC/21/002','Musa Aliyu',          'musa.aliyu@student.edu.ng',      'Male',  1,200,'2023/2024',2021),
  ('CSC/21/003','Hauwa Sule',          'hauwa.sule@student.edu.ng',      'Female',1,200,'2023/2024',2021),
  ('CSC/21/004','Lawal Abdullahi',     'lawal.abdullahi@student.edu.ng', 'Male',  1,200,'2023/2024',2021),
  ('CSC/21/005','Fatima Dangote',      'fatima.dangote@student.edu.ng',  'Female',1,200,'2023/2024',2021),
  ('EEE/19/001','Rotimi Akande',       'rotimi.akande@student.edu.ng',   'Male',  2,400,'2023/2024',2019),
  ('EEE/19/002','Taiwo Oduola',        'taiwo.oduola@student.edu.ng',    'Female',2,400,'2023/2024',2019),
  ('EEE/19/003','Kehinde Oduola',      'kehinde.oduola@student.edu.ng',  'Male',  2,400,'2023/2024',2019),
  ('EEE/19/004','Busayo Idowu',        'busayo.idowu@student.edu.ng',    'Female',2,400,'2023/2024',2019),
  ('EEE/19/005','Gbenga Oseni',        'gbenga.oseni@student.edu.ng',    'Male',  2,400,'2023/2024',2019),
  ('EEE/20/001','Jumoke Salami',       'jumoke.salami@student.edu.ng',   'Female',2,300,'2023/2024',2020),
  ('EEE/20/002','Kayode Fayemi',       'kayode.fayemi@student.edu.ng',   'Male',  2,300,'2023/2024',2020),
  ('EEE/20/003','Adeola Tinubu',       'adeola.tinubu@student.edu.ng',   'Female',2,300,'2023/2024',2020),
  ('MEE/19/001','Chibuzor Obi',        'chibuzor.obi@student.edu.ng',    'Male',  3,400,'2023/2024',2019),
  ('MEE/19/002','Ifunanya Onuoha',     'ifunanya.o@student.edu.ng',      'Female',3,400,'2023/2024',2019),
  ('MEE/19/003','Kenechukwu Agu',      'kenechukwu.agu@student.edu.ng',  'Male',  3,400,'2023/2024',2019),
  ('MEE/20/001','Adaku Nwosu',         'adaku.nwosu@student.edu.ng',     'Female',3,300,'2023/2024',2020),
  ('MEE/20/002','Uzochukwu Dike',      'uzochukwu.dike@student.edu.ng',  'Male',  3,300,'2023/2024',2020),
  ('CVE/19/001','Perpetua Onyekwere',  'perpetua.o@student.edu.ng',      'Female',4,400,'2023/2024',2019),
  ('CVE/19/002','Godwin Nnaji',        'godwin.nnaji@student.edu.ng',    'Male',  4,400,'2023/2024',2019),
  ('CVE/19/003','Chiamaka Ihejirika',  'chiamaka.i@student.edu.ng',      'Female',4,400,'2023/2024',2019),
  ('CVE/20/001','Nnamdi Okonkwo',      'nnamdi.okonkwo@student.edu.ng',  'Male',  4,300,'2023/2024',2020),
  ('CVE/20/002','Obiageli Okafor',     'obiageli.o@student.edu.ng',      'Female',4,300,'2023/2024',2020),
  ('CHE/19/001','Onyinye Nwosu',       'onyinye.nwosu@student.edu.ng',   'Female',5,400,'2023/2024',2019),
  ('CHE/19/002','Ikechukwu Eze',       'ikechukwu.eze@student.edu.ng',   'Male',  5,400,'2023/2024',2019),
  ('CHE/19/003','Adaobi Obioma',       'adaobi.obioma@student.edu.ng',   'Female',5,400,'2023/2024',2019),
  ('CHE/20/001','Chinonso Obi',        'chinonso.obi@student.edu.ng',    'Male',  5,300,'2023/2024',2020),
  ('CHE/20/002','Ugochi Eze',          'ugochi.eze@student.edu.ng',      'Female',5,300,'2023/2024',2020)
ON CONFLICT DO NOTHING;

-- Grades for CSC 400L students
WITH score_data(matric,course_code,ca,exam,sess,sem) AS (VALUES
  ('CSC/19/001','CSC401',27,62,'2023/2024',1), ('CSC/19/001','CSC402',28,65,'2023/2024',1),
  ('CSC/19/001','CSC403',26,60,'2023/2024',2), ('CSC/19/001','CSC404',29,66,'2023/2024',2),
  ('CSC/19/002','CSC401',20,45,'2023/2024',1), ('CSC/19/002','CSC402',22,48,'2023/2024',1),
  ('CSC/19/002','CSC403',18,42,'2023/2024',2), ('CSC/19/002','CSC404',21,44,'2023/2024',2),
  ('CSC/19/003','CSC401',29,68,'2023/2024',1), ('CSC/19/003','CSC402',30,70,'2023/2024',1),
  ('CSC/19/003','CSC403',28,65,'2023/2024',2), ('CSC/19/003','CSC404',29,69,'2023/2024',2),
  ('CSC/19/004','CSC401',12,25,'2023/2024',1), ('CSC/19/004','CSC402',14,28,'2023/2024',1),
  ('CSC/19/004','CSC403',10,22,'2023/2024',2), ('CSC/19/004','CSC404',13,26,'2023/2024',2),
  ('CSC/19/005','CSC401',25,58,'2023/2024',1), ('CSC/19/005','CSC402',26,60,'2023/2024',1),
  ('CSC/19/005','CSC403',24,55,'2023/2024',2), ('CSC/19/005','CSC404',25,58,'2023/2024',2),
  ('CSC/19/006','CSC401',16,32,'2023/2024',1), ('CSC/19/006','CSC402',17,34,'2023/2024',1),
  ('CSC/19/006','CSC403',15,30,'2023/2024',2), ('CSC/19/006','CSC404',18,33,'2023/2024',2),
  ('CSC/19/007','CSC401',27,63,'2023/2024',1), ('CSC/19/007','CSC402',28,65,'2023/2024',1),
  ('CSC/19/007','CSC403',26,61,'2023/2024',2), ('CSC/19/007','CSC404',27,64,'2023/2024',2),
  ('CSC/19/008','CSC401',13,26,'2023/2024',1), ('CSC/19/008','CSC402',14,27,'2023/2024',1),
  ('CSC/19/008','CSC403',11,24,'2023/2024',2), ('CSC/19/008','CSC404',15,28,'2023/2024',2),
  ('CSC/19/009','CSC401',22,50,'2023/2024',1), ('CSC/19/009','CSC402',23,52,'2023/2024',1),
  ('CSC/19/009','CSC403',21,48,'2023/2024',2), ('CSC/19/009','CSC404',22,50,'2023/2024',2),
  ('CSC/19/010','CSC401',24,56,'2023/2024',1), ('CSC/19/010','CSC402',25,57,'2023/2024',1),
  ('CSC/19/010','CSC403',23,54,'2023/2024',2), ('CSC/19/010','CSC404',24,55,'2023/2024',2)
)
INSERT INTO grades (student_id,course_id,ca_score,exam_score,letter_grade,grade_point,session,semester)
SELECT s.id, c.id, sd.ca, sd.exam,
  CASE WHEN sd.ca+sd.exam>=70 THEN 'A' WHEN sd.ca+sd.exam>=60 THEN 'B'
       WHEN sd.ca+sd.exam>=50 THEN 'C' WHEN sd.ca+sd.exam>=45 THEN 'D'
       WHEN sd.ca+sd.exam>=40 THEN 'E' ELSE 'F' END,
  CASE WHEN sd.ca+sd.exam>=70 THEN 5.0 WHEN sd.ca+sd.exam>=60 THEN 4.0
       WHEN sd.ca+sd.exam>=50 THEN 3.0 WHEN sd.ca+sd.exam>=45 THEN 2.0
       WHEN sd.ca+sd.exam>=40 THEN 1.0 ELSE 0.0 END,
  sd.sess, sd.sem
FROM score_data sd
JOIN students s ON s.matric_number=sd.matric
JOIN courses  c ON c.code=sd.course_code
ON CONFLICT DO NOTHING;

-- At-risk flags (seeded from computed grades)
INSERT INTO at_risk_flags (student_id,risk_score,risk_level,cgpa,total_failures,key_factors,session)
SELECT s.id,
  CASE s.matric_number
    WHEN 'CSC/19/004' THEN 0.89 WHEN 'CSC/19/006' THEN 0.82
    WHEN 'CSC/19/008' THEN 0.78 WHEN 'CSC/19/002' THEN 0.61
    WHEN 'EEE/19/002' THEN 0.58 ELSE 0.42
  END,
  CASE s.matric_number
    WHEN 'CSC/19/004' THEN 'high'   WHEN 'CSC/19/006' THEN 'high'
    WHEN 'CSC/19/008' THEN 'high'   WHEN 'CSC/19/002' THEN 'medium'
    WHEN 'EEE/19/002' THEN 'medium' ELSE 'low'
  END,
  sg.cgpa,
  COALESCE(sg.failed_courses,0),
  CASE s.matric_number
    WHEN 'CSC/19/004' THEN '["Low CA scores","Multiple failures","High absenteeism"]'::jsonb
    WHEN 'CSC/19/006' THEN '["Below-average exam scores","Failed 2 courses"]'::jsonb
    WHEN 'CSC/19/008' THEN '["Consistently low scores","Poor CA performance"]'::jsonb
    WHEN 'CSC/19/002' THEN '["Declining trend","Low study time"]'::jsonb
    WHEN 'EEE/19/002' THEN '["Borderline CGPA","Poor exam performance"]'::jsonb
    ELSE '["Monitor performance"]'::jsonb
  END,
  '2023/2024'
FROM students s
JOIN student_gpa sg ON sg.student_id = s.id
WHERE s.matric_number IN ('CSC/19/004','CSC/19/006','CSC/19/008','CSC/19/002','EEE/19/002')
ON CONFLICT DO NOTHING;
