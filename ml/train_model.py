"""
Academic Analytics Platform — ML Training Script
=================================================
Trains a Random Forest classifier on the UCI Student Performance Dataset.

Usage:
    cd ml
    python train_model.py

Output:
    ml/model.pkl          — trained RandomForestClassifier
    ml/scaler.pkl         — fitted StandardScaler
    ml/feature_names.pkl  — feature name list (for inference)
"""

import os, sys, io, urllib.request, zipfile
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score

UCI_URL           = "https://archive.ics.uci.edu/ml/machine-learning-databases/00320/student.zip"
OUTPUT_DIR        = os.path.dirname(os.path.abspath(__file__))
AT_RISK_THRESHOLD = 10   # G3 < 10 on 0-20 scale = fail

# ── 1. Load ───────────────────────────────────────────────────────────────────
def load_dataset():
    try:
        print("Downloading UCI Student Performance dataset...")
        with urllib.request.urlopen(UCI_URL, timeout=15) as r:
            zf = zipfile.ZipFile(io.BytesIO(r.read()))
        with zf.open("student-mat.csv") as f:
            df = pd.read_csv(f, sep=";")
        print(f"  Loaded {df.shape[0]} records, {df.shape[1]} columns")
        return df
    except Exception as e:
        print(f"  Download failed ({e}) — using synthetic dataset")
        return generate_synthetic()

def generate_synthetic(n=649):
    rng = np.random.default_rng(42)
    age       = rng.integers(15, 23, n)
    Medu      = rng.integers(0, 5, n)
    Fedu      = rng.integers(0, 5, n)
    studytime = rng.integers(1, 5, n)
    failures  = rng.integers(0, 4, n)
    famrel    = rng.integers(1, 6, n)
    freetime  = rng.integers(1, 6, n)
    goout     = rng.integers(1, 6, n)
    Dalc      = rng.integers(1, 6, n)
    Walc      = rng.integers(1, 6, n)
    health    = rng.integers(1, 6, n)
    absences  = rng.integers(0, 93, n)
    G1        = rng.integers(0, 20, n)
    G2        = rng.integers(0, 20, n)
    base      = 0.4*G1 + 0.4*G2 - 1.5*failures + rng.normal(0, 2, n)
    G3        = np.clip(np.round(base).astype(int), 0, 20)

    return pd.DataFrame({
        "school":    rng.choice(["GP","MS"], n),
        "sex":       rng.choice(["M","F"],   n),
        "age": age, "address": rng.choice(["U","R"], n),
        "famsize":   rng.choice(["LE3","GT3"], n),
        "Pstatus":   rng.choice(["T","A"],    n),
        "Medu": Medu, "Fedu": Fedu, "studytime": studytime, "failures": failures,
        "schoolsup": rng.choice(["yes","no"], n), "famsup":  rng.choice(["yes","no"], n),
        "paid":      rng.choice(["yes","no"], n), "activities": rng.choice(["yes","no"], n),
        "higher":    rng.choice(["yes","no"], n), "internet": rng.choice(["yes","no"], n),
        "romantic":  rng.choice(["yes","no"], n),
        "famrel": famrel, "freetime": freetime, "goout": goout,
        "Dalc": Dalc, "Walc": Walc, "health": health, "absences": absences,
        "G1": G1, "G2": G2, "G3": G3,
    })

# ── 2. Preprocess ─────────────────────────────────────────────────────────────
BINARY  = ["schoolsup","famsup","paid","activities","higher","internet","romantic"]
NOMINAL = ["school","sex","address","famsize","Pstatus"]
NUMERIC = ["age","Medu","Fedu","studytime","failures","famrel","freetime","goout","Dalc","Walc","health","absences","G1","G2"]

def preprocess(df):
    df = df.copy()
    for col in BINARY:
        if col in df.columns:
            df[col] = (df[col].str.lower() == "yes").astype(int)
    for col in NOMINAL:
        if col in df.columns:
            df[col] = LabelEncoder().fit_transform(df[col].astype(str))
    df["at_risk"] = (df["G3"] < AT_RISK_THRESHOLD).astype(int)
    feat_cols = [c for c in NUMERIC + BINARY + NOMINAL if c in df.columns]
    return df[feat_cols].values, df["at_risk"].values, feat_cols

# ── 3. Train ──────────────────────────────────────────────────────────────────
def train(X, y, feature_names):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    scaler = StandardScaler()
    X_tr = scaler.fit_transform(X_train)
    X_te = scaler.transform(X_test)

    model = RandomForestClassifier(
        n_estimators=200, max_depth=10, min_samples_split=4,
        min_samples_leaf=2, class_weight="balanced", random_state=42, n_jobs=-1
    )
    print("\nTraining RandomForestClassifier...")
    model.fit(X_tr, y_train)

    y_pred   = model.predict(X_te)
    y_prob   = model.predict_proba(X_te)[:, 1]
    acc      = accuracy_score(y_test, y_pred)
    roc_auc  = roc_auc_score(y_test, y_prob)
    cv       = cross_val_score(model, scaler.transform(X), y, cv=5, scoring="f1")

    print(f"\n{'='*50}")
    print(f"  Accuracy     : {acc:.4f}  ({acc*100:.2f}%)")
    print(f"  ROC-AUC      : {roc_auc:.4f}")
    print(f"  5-Fold CV F1 : {cv.mean():.4f} ± {cv.std():.4f}")
    print(f"{'='*50}")
    print(classification_report(y_test, y_pred, target_names=["Pass","At-Risk"]))

    print("\nTop 10 Feature Importances:")
    for feat, imp in sorted(zip(feature_names, model.feature_importances_), key=lambda x: -x[1])[:10]:
        print(f"  {feat:<14} {'█'*int(imp*60)} {imp:.4f}")

    return model, scaler

# ── 4. Save ───────────────────────────────────────────────────────────────────
def save(model, scaler, feature_names):
    joblib.dump(model,         os.path.join(OUTPUT_DIR, "model.pkl"))
    joblib.dump(scaler,        os.path.join(OUTPUT_DIR, "scaler.pkl"))
    joblib.dump(feature_names, os.path.join(OUTPUT_DIR, "feature_names.pkl"))
    print(f"\nSaved: model.pkl  scaler.pkl  feature_names.pkl  →  {OUTPUT_DIR}")

# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    df             = load_dataset()
    X, y, feats    = preprocess(df)
    print(f"\nDataset: {len(y)} samples | At-risk: {y.mean()*100:.1f}%")
    model, scaler  = train(X, y, feats)
    save(model, scaler, feats)
    print("\nDone. Flask /api/predictions/predict endpoint is ready.")
