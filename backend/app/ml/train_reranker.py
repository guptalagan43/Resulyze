"""Training script for XGBoost reranker model using the resume dataset."""

import csv
import json
import os
import logging
from pathlib import Path
import numpy as np
import joblib
import spacy
from sentence_transformers import SentenceTransformer
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Import existing helpers
from app.services.ner_extractor import extract_entities
from app.services.skill_extractor import extract_skills_simple, extract_skills_from_jd
from app.services.matcher import (
    compute_skill_coverage,
    compute_experience_score,
    compute_education_score,
)
from app.services.embedding_service import encode_text, cosine_similarity

# Define JDs with required fields
JDS = [
    {
        "role": "Data Science",
        "title": "Data Scientist",
        "raw_text": "We are looking for a Data Scientist with 3+ years of experience in python, machine learning, sql, scikit-learn, and aws. Master's degree in computer science or equivalent required.",
        "skills": ["python", "machine learning", "sql", "scikit-learn", "aws"],
        "min_experience": 3,
        "education_req": "Master",
    },
    {
        "role": "Java Developer",
        "title": "Senior Java Developer",
        "raw_text": "Looking for a Senior Java Developer with 5+ years of experience in java, spring boot, mysql, microservices, and docker. Bachelor's degree required.",
        "skills": ["java", "spring boot", "mysql", "microservices", "docker"],
        "min_experience": 5,
        "education_req": "Bachelor",
    },
    {
        "role": "Python Developer",
        "title": "Python Django Developer",
        "raw_text": "Seeking a Python Developer with 2+ years of experience in python, django, postgresql, rest api, git, and docker. Bachelor's degree required.",
        "skills": ["python", "django", "postgresql", "rest api", "git", "docker"],
        "min_experience": 2,
        "education_req": "Bachelor",
    },
    {
        "role": "DevOps Engineer",
        "title": "DevOps Engineer",
        "raw_text": "We need a DevOps Engineer with 4+ years of experience in docker, kubernetes, terraform, aws, jenkins, and linux. Bachelor's degree required.",
        "skills": ["docker", "kubernetes", "terraform", "aws", "jenkins", "linux"],
        "min_experience": 4,
        "education_req": "Bachelor",
    },
    {
        "role": "HR",
        "title": "HR Manager",
        "raw_text": "We are looking for an HR Manager with 5+ years of experience in recruitment, onboarding, employee engagement, communication, leadership, and excel. Bachelor's degree required.",
        "skills": ["communication", "leadership", "excel", "project management"],
        "min_experience": 5,
        "education_req": "Bachelor",
    },
]

DATASET_PATH = r"D:\Projects\ITR Project\datasets\dataset3.csv"
MODEL_DIR = Path("app/ml/reranker_model")


def main():
    logger.info("Initializing models...")
    nlp = spacy.load("en_core_web_sm")
    embedder = SentenceTransformer("all-MiniLM-L6-v2")

    logger.info("Loading JDs and encoding their texts...")
    jd_embeddings = {}
    for jd in JDS:
        jd_embeddings[jd["role"]] = encode_text(jd["raw_text"], embedder)

    logger.info("Parsing dataset and generating feature vectors...")
    X = []
    y = []

    count = 0
    with open(DATASET_PATH, "r", encoding="utf-8", errors="ignore") as f:
        reader = csv.reader(f)
        next(reader)  # skip header
        for row in reader:
            if not row or len(row) < 2:
                continue
            category, resume_text = row[0], row[1]
            count += 1
            if count % 100 == 0:
                logger.info(f"Processed {count} resumes...")

            # Extract resume features
            entities = extract_entities(resume_text, nlp)
            skills = extract_skills_simple(resume_text)
            resume_emb = encode_text(resume_text, embedder)

            # Match against each JD
            for jd in JDS:
                sim = cosine_similarity(resume_emb, jd_embeddings[jd["role"]])
                skill_cov = compute_skill_coverage(skills, jd["skills"])
                exp_score = compute_experience_score(
                    entities.get("experience_years"), jd["min_experience"]
                )
                edu_score = compute_education_score(
                    entities.get("education_level"), jd["education_req"]
                )
                cert_score = 0.5  # default

                # Feature vector
                feature_vector = [sim, skill_cov, exp_score, edu_score, cert_score]
                X.append(feature_vector)

                # Label matches JD role
                label = 1 if category.strip().lower() == jd["role"].strip().lower() else 0
                y.append(label)

    X = np.array(X)
    y = np.array(y)

    logger.info(f"Generated {len(X)} samples. Match ratio: {np.mean(y):.4f}")

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    logger.info("Training XGBoost Classifier...")
    model = XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42,
        eval_metric="logloss",
    )
    model.fit(X_train, y_train)

    logger.info("Evaluating model...")
    preds = model.predict(X_test)
    print(classification_report(y_test, preds))

    # Save model
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    model_path = MODEL_DIR / "model.pkl"
    joblib.dump(model, model_path)
    logger.info(f"Model saved successfully to {model_path}")


if __name__ == "__main__":
    main()
