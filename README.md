# Academic Analytics Platform

Interactive Data Analytics Platform for Academic Performance Evaluation.

**Stack:** React + Vite (frontend) · Flask (API) · PostgreSQL via Supabase (database) · Scikit-learn Random Forest (ML)

---

## 🚀 Local Setup (Step-by-step)

### 1. Prerequisites

- Node.js 18+ ([nodejs.org](https://nodejs.org))
- Python 3.11+ ([python.org](https://python.org))
- Git

---

### 2. Clone & install

```bash
git clone <your-repo-url>
cd academic-analytics

# Frontend dependencies
npm install

# Python dependencies
pip install -r requirements.txt
```

---

### 3. Set up Supabase (free)

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a name (e.g. `academic-analytics`) and set a database password
3. Once created, go to **Project Settings → Database**
4. Copy the **Connection string (URI mode)** — it looks like:
   ```
   postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
   ```
5. Go to **SQL Editor → New Query**, paste the contents of `database/schema.sql`, and click **Run**
6. Paste the contents of `database/seed.sql` and click **Run**

---

### 4. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-REF].supabase.co:5432/postgres
JWT_SECRET=any-long-random-string-here
```

Generate a JWT secret:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

### 5. Train the ML model (one-time)

```bash
cd ml
python train_model.py
cd ..
```

This downloads the UCI Student Performance dataset and saves `ml/model.pkl`, `ml/scaler.pkl`, and `ml/feature_names.pkl`.

> If the UCI URL is unreachable, the script automatically falls back to a synthetic dataset.

---

### 6. Run locally

**Terminal 1 — Flask API:**
```bash
python api/index.py
# → Runs on http://localhost:5000
```

**Terminal 2 — React dev server:**
```bash
npm run dev
# → Runs on http://localhost:5173
# Vite auto-proxies /api/* → localhost:5000
```

Open [http://localhost:5173](http://localhost:5173)

**Demo login credentials:**

| Role     | Email                          | Password    |
|----------|-------------------------------|-------------|
| Admin    | admin@university.edu.ng        | Password123 |
| Lecturer | lecturer@university.edu.ng     | Password123 |
| Student  | student@university.edu.ng      | Password123 |

---

## ☁️ Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Framework preset: **Other** (Vercel auto-detects via `vercel.json`)
4. Add Environment Variables:
   - `DATABASE_URL` → your Supabase connection string
   - `JWT_SECRET`   → your secret key
5. Click **Deploy**

### 3. Upload ML model files to Vercel

Because `.pkl` files are in `.gitignore`, you need to either:

**Option A (recommended):** Remove `*.pkl` from `.gitignore` and commit the trained model files:
```bash
# In .gitignore, comment out the *.pkl line
git add ml/model.pkl ml/scaler.pkl ml/feature_names.pkl
git commit -m "Add trained ML model"
git push
```

**Option B:** Add a Vercel build command that trains the model:
In Vercel dashboard → Settings → Build Command:
```
npm run build && cd ml && python train_model.py
```

---

## 📁 Project Structure

```
academic-analytics/
├── api/
│   └── index.py          ← Flask API (Vercel serverless)
├── database/
│   ├── schema.sql         ← Run in Supabase SQL Editor
│   └── seed.sql           ← Sample data
├── ml/
│   ├── train_model.py     ← Run once to generate model.pkl
│   ├── model.pkl          ← Generated after training
│   ├── scaler.pkl         ← Generated after training
│   └── feature_names.pkl  ← Generated after training
├── src/
│   ├── components/
│   │   ├── charts/        ← Recharts visualisations
│   │   ├── layout/        ← Sidebar + Layout shell
│   │   └── ui/            ← StatCard, Badge, Spinner etc.
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useStudents.js
│   │   └── useAnalytics.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Students.jsx
│   │   ├── StudentDetail.jsx
│   │   └── AtRisk.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── requirements.txt
├── tailwind.config.js
├── vite.config.js
└── vercel.json
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✓ | Current user |
| GET | `/api/students` | ✓ | All students (filterable) |
| GET | `/api/students/:id` | ✓ | Student + grade records |
| GET | `/api/analytics/summary` | ✓ | KPI summary |
| GET | `/api/analytics/by-department` | ✓ | Dept performance |
| GET | `/api/analytics/trends` | ✓ | CGPA trends |
| GET | `/api/analytics/grade-distribution` | ✓ | Grade breakdown |
| GET | `/api/predictions/at-risk` | ✓ | At-risk student list |
| POST | `/api/predictions/predict` | ✓ | Run ML prediction |
| GET | `/api/departments` | ✓ | All departments |

All protected routes require `Authorization: Bearer <token>` header.
