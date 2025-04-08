from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # Add this
from pydantic import BaseModel
import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, GPT2Tokenizer, GPT2LMHeadModel
import uvicorn
import time
import random
import string

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    #allow_origins=["http://localhost:3000","http://localhost:8080","http://localhost:5173"],  # React default
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origins=["*"]
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

bert_tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
print("Loading sentiment_model...")
sentiment_model = DistilBertForSequenceClassification.from_pretrained("./sentiment_model").to(device)
print("Loading urgency_model...")
urgency_model = DistilBertForSequenceClassification.from_pretrained("./urgency_model").to(device)
print("Loading fraud_model...")
fraud_model = DistilBertForSequenceClassification.from_pretrained("./fraud_model").to(device)
gpt2_tokenizer = GPT2Tokenizer.from_pretrained("./response_model")
print("Loading response_model...")
response_model = GPT2LMHeadModel.from_pretrained("./response_model").to(device)
gpt2_tokenizer.pad_token = gpt2_tokenizer.eos_token

class Complaint(BaseModel):
    text: str
    category: str

complaints_store = {}

def predict(model, tokenizer, text):
    inputs = tokenizer(text, return_tensors="pt").to(device)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.logits.argmax(-1).item()

def generate_response(complaint_id, category, complaint, sentiment, urgency, fraud):
    sentiment_map = {0: "positive", 1: "negative", 2: "neutral"}
    urgency_map = {0: "high", 1: "low"}
    fraud_map = {0: "fraud", 1: "legit"}
    prompt = (
        f"Complaint ID: {complaint_id} | Category: {category} | Complaint: {complaint} | "
        f"Sentiment: {sentiment_map[sentiment]} | Urgency: {urgency_map[urgency]} | Fraud: {fraud_map[fraud]} | Response: "
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
    sentiment = predict(sentiment_model, bert_tokenizer, complaint.text)
    urgency = predict(urgency_model, bert_tokenizer, complaint.text)
    fraud = predict(fraud_model, bert_tokenizer, complaint.text)
    response = generate_response(complaint_id, complaint.category, complaint.text, sentiment, urgency, fraud)
    complaints_store[complaint_id] = {
        "complaint_id": complaint_id,
        "category": complaint.category,
        "complaint": complaint.text,
        "sentiment": sentiment,
        "urgency": urgency,
        "fraud": fraud,
        "response": response,
        "timestamp": time.time()
    }
    return {"complaint_id": complaint_id, "message": "Complaint submitted, processing..."}

@app.get("/get-response/{complaint_id}")
async def get_response(complaint_id: str):
    if complaint_id not in complaints_store:
        raise HTTPException(status_code=404, detail="Complaint ID not found")
    data = complaints_store[complaint_id]
    if time.time() - data["timestamp"] < 5:
        time.sleep(5 - (time.time() - data["timestamp"]))
    return {
        "complaint_id": data["complaint_id"],
        "category": data["category"],
        "complaint": data["complaint"],
        "response": data["response"],
        "sentiment": ["positive", "negative", "neutral"][data["sentiment"]],
        "urgency": ["high", "low"][data["urgency"]],
        "fraud": ["fraud", "legit"][data["fraud"]]
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)