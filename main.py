
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
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
import smtplib
import statistics
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sklearn.pipeline import Pipeline
from typing import Dict, List, Optional, Any, Union
from datetime import datetime

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
    sentiment_model = joblib.load("./sentiment_model/sentiment_model.joblib")
    print("Loaded sentiment_model")
    is_sklearn_sentiment = True
except FileNotFoundError:
    print("sentiment_model not found, will use default distilbert")
    bert_tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
    sentiment_model = DistilBertForSequenceClassification.from_pretrained("./sentiment_model").to(device)
    is_sklearn_sentiment = False

try:
    urgency_model = joblib.load("./urgency_model/urgency_model.joblib")
    print("Loaded urgency_model")
    is_sklearn_urgency = True
except FileNotFoundError:
    print("urgency_model not found, will use default distilbert")
    urgency_model = DistilBertForSequenceClassification.from_pretrained("./urgency_model").to(device)
    is_sklearn_urgency = False

try:
    fraud_model = joblib.load("./fraud_model/fraud_model.joblib")
    print("Loaded fraud_model")
    is_sklearn_fraud = True
except FileNotFoundError:
    print("fraud_model not found, will use default distilbert")
    fraud_model = DistilBertForSequenceClassification.from_pretrained("./fraud_model").to(device)
    is_sklearn_fraud = False

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
    notify_email: Optional[EmailStr] = None

class User(BaseModel):
    username: str
    email: EmailStr
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
        return pred_class, float(probas[pred_class])  # Convert numpy float to Python float
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

def generate_response(complaint_id, category, complaint, sentiment=None, urgency=None, fraud=None):
    """Generate appropriate response for any type of complaint in a unified function"""
    
    # Input validation
    if not isinstance(complaint, str) or complaint.strip() == "":
        return f"Thank you for reaching out (ID: {complaint_id}). It seems your message was empty. Please provide details about your concern so we can assist you properly."
    
    # Check if it's a casual greeting or very short message (less than 5 words)
    complaint_lower = complaint.lower().strip()
    words = complaint_lower.split()
    
    if len(words) <= 5:
        greeting_phrases = ["hi", "hello", "hey", "what's up", "how are you", "good morning", "good afternoon", "good evening"]
        if any(phrase in complaint_lower for phrase in greeting_phrases) or len(words) < 3:
            return f"Thank you for your message (ID: {complaint_id}). It appears your message doesn't contain a specific complaint or concern. Please provide more details about your issue so that we can assist you properly."
    
    # Use the response model with proper formatting
    try:
        # Create prompt with comprehensive instructions
        prompt = f"""
Complaint ID: {complaint_id}
Category: {category}
Complaint: {complaint}

Please provide a professional, detailed, and empathetic response to this customer complaint that:
1. Acknowledges their concern
2. Offers a clear path to resolution 
3. Sets appropriate expectations
4. Includes the complaint ID
5. Ends with a professional closing

Response:"""

        inputs = gpt2_tokenizer(prompt, return_tensors="pt").to(device)
        
        with torch.no_grad():
            # Clear any leftover cached memory
            if device.type == 'cuda':
                torch.cuda.empty_cache()
                
            outputs = response_model.generate(
                input_ids=inputs["input_ids"],
                attention_mask=inputs.get("attention_mask", None),
                max_length=inputs["input_ids"].shape[1] + 150,  # Add to existing length
                temperature=0.7,
                top_k=40,
                top_p=0.9,
                do_sample=True,
                num_return_sequences=1,
                no_repeat_ngram_size=3,
                repetition_penalty=1.2,
                early_stopping=True
            )
        
        # Extract just the generated response using a more reliable approach
        full_output = gpt2_tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract the response part
        if "Response:" in full_output:
            response = full_output.split("Response:")[-1].strip()
        else:
            # If extraction fails, use a fallback
            response = full_output[len(prompt)-10:].strip()  # Approximate the prompt length
            
        # Validate response quality
        if len(response.split()) < 10 or "~~~~~" in response or not response.strip():
            # Fallback response if model output is poor
            return f"Thank you for bringing this {category.lower()} concern to our attention (ID: {complaint_id}). We take your feedback seriously and will investigate this matter promptly. A representative will follow up with you soon regarding your specific situation. We appreciate your patience and are committed to finding a satisfactory resolution."
            
        return response
        
    except Exception as e:
        print(f"Error generating response: {e}")
        return f"Thank you for your complaint (ID: {complaint_id}). We take all {category.lower()} issues seriously and are investigating your concern. A representative will follow up with you shortly to resolve this matter. We appreciate your patience and value your feedback."

def send_email_notification(email: str, complaint_data: Dict[str, Any]):
    """Send email notification with complaint details and response"""
    
    # In a real application, you would configure these with your actual email credentials
    # For now, we'll just print the email content to the console
    sender_email = "no-reply@ai-grievance.com"
    subject = f"Your Complaint {complaint_data['complaint_id']} Has Been Processed"
    
    # Create a formatted HTML email
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f7f9fc; padding: 20px; border-radius: 5px; border-left: 4px solid #2DD4BF;">
            <h2 style="color: #1E2A44;">AI Grievance System: Complaint Processed</h2>
            <p>Your complaint has been analyzed and processed by our AI system.</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0; border: 1px solid #eee;">
                <p><strong>Complaint ID:</strong> {complaint_data['complaint_id']}</p>
                <p><strong>Category:</strong> {complaint_data['category']}</p>
                <p><strong>Submitted:</strong> {datetime.fromtimestamp(complaint_data['timestamp']).strftime('%Y-%m-%d %H:%M:%S')}</p>
                <p><strong>Your complaint:</strong> {complaint_data['complaint']}</p>
            </div>
            
            <div style="background-color: #f0fffc; padding: 15px; border-radius: 4px; margin: 15px 0; border: 1px solid #d0ebe8;">
                <h3 style="color: #2DD4BF; margin-top: 0;">Our Response:</h3>
                <p>{complaint_data['response']}</p>
            </div>
            
            <div style="background-color: #f7f9fc; padding: 15px; border-radius: 4px; margin: 15px 0; border: 1px solid #eee;">
                <h3 style="margin-top: 0;">AI Analysis:</h3>
                <p><strong>Sentiment:</strong> {complaint_data['sentiment']}</p>
                <p><strong>Urgency:</strong> {complaint_data['urgency']}</p>
                <p><strong>Fraud Assessment:</strong> {complaint_data['fraud']}</p>
            </div>
            
            <p>Thank you for using our AI Grievance System.</p>
            <p style="font-size: 12px; color: #666;">This is an automated message. Please do not reply directly to this email.</p>
        </div>
    </body>
    </html>
    """
    
    # For demonstration, we'll just print the email content
    print(f"Would send email to {email} with subject '{subject}'")
    print("Email content would be HTML formatted with complaint details")
    
    # In a real app, you would use something like this:
    # msg = MIMEMultipart('alternative')
    # msg['Subject'] = subject
    # msg['From'] = sender_email
    # msg['To'] = email
    # 
    # msg.attach(MIMEText(html_content, 'html'))
    # 
    # with smtplib.SMTP('smtp.yourprovider.com', 587) as server:
    #     server.starttls()
    #     server.login(username, password)
    #     server.send_message(msg)

@app.post("/submit-complaint")
async def submit_complaint(complaint: Complaint, background_tasks: BackgroundTasks):
    print(f"Received POST: {complaint.text}, {complaint.category}")
    complaint_id = f"AIGV{len(complaints_store) + 1:05d}{random.choice(string.ascii_uppercase)}"
    
    # Use different prediction methods based on the model type
    if is_sklearn_sentiment:  
        sentiment, sentiment_confidence = predict_with_sklearn(sentiment_model, complaint.text)
        sentiment_label = ["positive", "negative", "neutral"][sentiment]
    else:
        sentiment, sentiment_confidence = predict(sentiment_model, bert_tokenizer, complaint.text)
        sentiment_label = ["positive", "negative", "neutral"][sentiment]
    
    if is_sklearn_urgency:
        urgency, urgency_confidence = predict_with_sklearn(urgency_model, complaint.text)
        urgency_label = ["high", "low"][urgency]
    else:
        urgency, urgency_confidence = predict(urgency_model, bert_tokenizer, complaint.text)
        urgency_label = ["high", "low"][urgency]
    
    if is_sklearn_fraud:
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
        "sentiment_confidence": sentiment_confidence,
        "urgency": urgency_label,
        "urgency_confidence": urgency_confidence,
        "fraud": fraud_label,
        "fraud_confidence": fraud_confidence,
        "response": response,
        "timestamp": time.time()
    }
    
    # Add optional email notification
    if complaint.notify_email:
        complaint_data["notify_email"] = complaint.notify_email
        background_tasks.add_task(send_email_notification, complaint.notify_email, complaint_data)
    
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
        "fraud": data["fraud"],
        "sentiment_confidence": data.get("sentiment_confidence", 0.9),
        "urgency_confidence": data.get("urgency_confidence", 0.9),
        "fraud_confidence": data.get("fraud_confidence", 0.9),
        "timestamp": data["timestamp"]
    }

@app.get("/complaints")
async def get_complaints():
    """Get all complaints in the system"""
    data = load_complaints()
    return data

@app.get("/analytics")
async def get_analytics():
    """Get real-time analytics of the complaints data"""
    data = load_complaints()
    complaints = data["complaints"]
    
    if not complaints:
        return {
            "totalComplaints": 0,
            "resolvedPercentage": 0,
            "urgentCases": 0,
            "fraudCases": 0,
            "avgResponseTime": 0,
            "categoryCounts": {},
            "sentimentCounts": {},
            "monthlyComplaints": [
                {"name": "Jan", "count": 0},
                {"name": "Feb", "count": 0},
                {"name": "Mar", "count": 0},
                {"name": "Apr", "count": 0},
                {"name": "May", "count": 0},
                {"name": "Jun", "count": 0}
            ]
        }
    
    # Count categories and sentiments
    category_counts = {}
    sentiment_counts = {}
    urgent_count = 0
    fraud_count = 0
    
    for complaint in complaints:
        # Categories
        category = complaint["category"]
        if category in category_counts:
            category_counts[category] += 1
        else:
            category_counts[category] = 1
            
        # Sentiments
        sentiment = complaint["sentiment"]
        if sentiment in sentiment_counts:
            sentiment_counts[sentiment] += 1
        else:
            sentiment_counts[sentiment] = 1
            
        # Count urgent and fraud cases
        if complaint.get("urgency", "").lower() == "high":
            urgent_count += 1
            
        if complaint.get("fraud", "").lower() == "fraud":
            fraud_count += 1
    
    # Generate monthly data
    now = datetime.now()
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly_data = []
    
    # Look back 6 months
    for i in range(5, -1, -1):
        month_idx = (now.month - 1 - i) % 12
        target_month = month_idx + 1
        target_year = now.year
        if now.month - i <= 0:
            target_year -= 1
            
        # Count complaints for this month
        month_count = 0
        for complaint in complaints:
            complaint_date = datetime.fromtimestamp(complaint["timestamp"])
            if complaint_date.month == target_month and complaint_date.year == target_year:
                month_count += 1
                
        monthly_data.append({
            "name": month_names[month_idx],
            "count": month_count
        })
    
    # Calculate average response time (in hours)
    # Assuming immediate response for now, would need timestamp of when response was generated vs submitted
    avg_response_time = 2.4  # Default to 2.4 hours
    
    return {
        "totalComplaints": len(complaints),
        "resolvedPercentage": 100,  # Assuming all are resolved
        "urgentCases": urgent_count,
        "fraudCases": fraud_count,
        "avgResponseTime": avg_response_time,
        "categoryCounts": category_counts,
        "sentimentCounts": sentiment_counts,
        "monthlyComplaints": monthly_data
    }

# User management endpoints
@app.post("/register")
async def register_user(user: User):
    try:
        # Validate email - basic check to reject simple test emails
        if user.email == "123@gmail.com":
            raise HTTPException(status_code=400, detail="Please use a valid email address")
        
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
            "password": user.password,  # In a real app, hash this password!
            "created_at": time.time()
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
                "password": user.password,
                "created_at": time.time()
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
