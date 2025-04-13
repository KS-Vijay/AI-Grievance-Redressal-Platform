
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # Add this
from pydantic import BaseModel
import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, GPT2Tokenizer, GPT2LMHeadModel
import uvicorn
import time
import random
import string
import json
import os
import joblib
import numpy as np
from sklearn.pipeline import Pipeline

# Create data directory if it doesn't exist
os.makedirs("data", exist_ok=True)

# Initialize complaints file if it doesn't exist
if not os.path.exists("data/complaints.json"):
    with open("data/complaints.json", "w") as f:
        json.dump({"complaints": []}, f)

# Initialize users file if it doesn't exist
if not os.path.exists("data/users.json"):
    with open("data/users.json", "w") as f:
        json.dump({"users": []}, f)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origins=["*"]
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Load scikit-learn models for classification
try:
    sentiment_model = joblib.load("./sentiment_model.joblib")
    print("Loaded sentiment_model")
except FileNotFoundError:
    print("sentiment_model not found, will use default distilbert")
    bert_tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
    sentiment_model = DistilBertForSequenceClassification.from_pretrained("./sentiment_model").to(device)

try:
    urgency_model = joblib.load("./urgency_model.joblib")
    print("Loaded urgency_model")
except FileNotFoundError:
    print("urgency_model not found, will use default distilbert")
    urgency_model = DistilBertForSequenceClassification.from_pretrained("./urgency_model").to(device)

try:
    fraud_model = joblib.load("./fraud_model.joblib")
    print("Loaded fraud_model")
except FileNotFoundError:
    print("fraud_model not found, will use default distilbert")
    fraud_model = DistilBertForSequenceClassification.from_pretrained("./fraud_model").to(device)

# Load the GPT2 model for response generation
try:
    gpt2_tokenizer = GPT2Tokenizer.from_pretrained("./complaint_model")
    response_model = GPT2LMHeadModel.from_pretrained("./complaint_model").to(device)
    print("Loaded complaint_model for response generation")
except:
    print("complaint_model not found, will use default response_model")
    gpt2_tokenizer = GPT2Tokenizer.from_pretrained("./response_model")
    response_model = GPT2LMHeadModel.from_pretrained("./response_model").to(device)
    
if hasattr(gpt2_tokenizer, 'pad_token') and gpt2_tokenizer.pad_token is None:
    gpt2_tokenizer.pad_token = gpt2_tokenizer.eos_token

class Complaint(BaseModel):
    text: str
    category: str

class User(BaseModel):
    username: str
    email: str
    password: str

complaints_store = {}

def load_complaints():
    try:
        with open("data/complaints.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"complaints": []}

def save_complaint(complaint_data):
    data = load_complaints()
    data["complaints"].append(complaint_data)
    with open("data/complaints.json", "w") as f:
        json.dump(data, f, indent=2)

def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = ' '.join(text.split())
    return text

def predict_with_sklearn(model, text):
    """Use a scikit-learn pipeline model for prediction"""
    if isinstance(model, Pipeline):
        cleaned_text = clean_text(text)
        probas = model.predict_proba([cleaned_text])[0]
        pred_class = model.predict([cleaned_text])[0]
        return pred_class, probas[pred_class]
    else:
        # Fallback to the original prediction method
        return predict(model, bert_tokenizer, text)

def predict(model, tokenizer, text):
    """Original prediction method using transformers models"""
    inputs = tokenizer(text, return_tensors="pt").to(device)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.logits.argmax(-1).item(), 0.90  # Fixed confidence since we don't have actual probas

def detect_financial_complaint(text):
    """Check if a complaint is financial in nature"""
    financial_keywords = ['refund', 'money back', 'overcharg', 'billing', 'charged twice',
                    'double charged', 'reimbursement', 'payment', 'charged incorrectly']
    
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in financial_keywords)

def generate_financial_response(complaint_id):
    """Generate a response for financial complaints"""
    return f"Thank you for bringing this financial matter to our attention. We take billing concerns seriously. Please email the transaction details to support@grievance.com, referencing complaint ID {complaint_id}. Our financial team will investigate this promptly."

def generate_response(complaint_id, category, complaint, sentiment, urgency, fraud):
    # Check if it's a financial complaint
    if category.lower() == "payment" or detect_financial_complaint(complaint):
        return generate_financial_response(complaint_id)
    
    # Otherwise use the response model
    prompt = (
        f"Complaint ID: {complaint_id} | Category: {category} | Complaint: {complaint} | "
        f"Sentiment: {sentiment} | Urgency: {urgency} | Fraud: {fraud} | Response: "
    )
    inputs = gpt2_tokenizer(prompt, return_tensors="pt").to(device)
    with torch.no_grad():
        outputs = response_model.generate(
            **inputs,
            max_new_tokens=50,
            temperature=0.7,
            top_k=50,
            do_sample=True
        )
    return gpt2_tokenizer.decode(outputs[0], skip_special_tokens=True).split("Response: ")[-1].strip()

@app.post("/submit-complaint")
async def submit_complaint(complaint: Complaint):
    print(f"Received POST: {complaint.text}, {complaint.category}")
    complaint_id = f"AIGV{len(complaints_store) + 1:05d}{random.choice(string.ascii_uppercase)}"
    
    # Use different prediction methods based on the model type
    if hasattr(sentiment_model, 'predict_proba'):  # Check if it's a sklearn model
        sentiment, sentiment_confidence = predict_with_sklearn(sentiment_model, complaint.text)
        sentiment_label = ["positive", "negative", "neutral"][sentiment]
    else:
        sentiment, sentiment_confidence = predict(sentiment_model, bert_tokenizer, complaint.text)
        sentiment_label = ["positive", "negative", "neutral"][sentiment]
    
    if hasattr(urgency_model, 'predict_proba'):
        urgency, urgency_confidence = predict_with_sklearn(urgency_model, complaint.text)
        urgency_label = ["high", "low"][urgency]
    else:
        urgency, urgency_confidence = predict(urgency_model, bert_tokenizer, complaint.text)
        urgency_label = ["high", "low"][urgency]
    
    if hasattr(fraud_model, 'predict_proba'):
        fraud, fraud_confidence = predict_with_sklearn(fraud_model, complaint.text)
        fraud_label = ["fraud", "legit"][fraud]
    else:
        fraud, fraud_confidence = predict(fraud_model, bert_tokenizer, complaint.text)
        fraud_label = ["fraud", "legit"][fraud]
    
    response = generate_response(complaint_id, complaint.category, complaint.text, sentiment_label, urgency_label, fraud_label)
    
    complaint_data = {
        "complaint_id": complaint_id,
        "category": complaint.category,
        "complaint": complaint.text,
        "sentiment": sentiment_label,
        "urgency": urgency_label,
        "fraud": fraud_label,
        "response": response,
        "timestamp": time.time()
    }
    
    complaints_store[complaint_id] = complaint_data
    
    # Save to JSON file
    save_complaint(complaint_data)
    
    return {"complaint_id": complaint_id, "message": "Complaint submitted, processing..."}

@app.get("/get-response/{complaint_id}")
async def get_response(complaint_id: str):
    if complaint_id not in complaints_store:
        # Try to load from the JSON file
        data = load_complaints()
        found = False
        for complaint in data["complaints"]:
            if complaint["complaint_id"] == complaint_id:
                return complaint
                
        if not found:
            raise HTTPException(status_code=404, detail="Complaint ID not found")
    
    data = complaints_store[complaint_id]
    if time.time() - data["timestamp"] < 5:
        time.sleep(5 - (time.time() - data["timestamp"]))
    return {
        "complaint_id": data["complaint_id"],
        "category": data["category"],
        "complaint": data["complaint"],
        "response": data["response"],
        "sentiment": data["sentiment"],
        "urgency": data["urgency"],
        "fraud": data["fraud"]
    }

# User management endpoints
@app.post("/register")
async def register_user(user: User):
    try:
        # Load existing users
        with open("data/users.json", "r") as f:
            data = json.load(f)
        
        # Check if email already exists
        for existing_user in data["users"]:
            if existing_user["email"] == user.email:
                raise HTTPException(status_code=400, detail="Email already registered")
        
        # Add new user
        data["users"].append({
            "username": user.username,
            "email": user.email,
            "password": user.password  # In a real app, hash this password!
        })
        
        # Save updated users
        with open("data/users.json", "w") as f:
            json.dump(data, f, indent=2)
        
        return {"message": "User registered successfully"}
    
    except FileNotFoundError:
        # Create users file if it doesn't exist
        with open("data/users.json", "w") as f:
            json.dump({"users": [{
                "username": user.username,
                "email": user.email,
                "password": user.password
            }]}, f, indent=2)
        return {"message": "User registered successfully"}

@app.post("/login")
async def login_user(user: dict):
    try:
        with open("data/users.json", "r") as f:
            data = json.load(f)
        
        for existing_user in data["users"]:
            if existing_user["email"] == user["email"] and existing_user["password"] == user["password"]:
                return {"status": "success", "user": {"username": existing_user["username"], "email": existing_user["email"]}}
        
        return {"status": "error", "message": "Invalid credentials"}
    
    except FileNotFoundError:
        return {"status": "error", "message": "No users found. Please sign up first."}

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
