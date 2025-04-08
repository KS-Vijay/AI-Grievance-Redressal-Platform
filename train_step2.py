import pandas as pd
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, TrainingArguments, Trainer
import torch
import numpy as np
from torch.utils.data import Dataset as TorchDataset, DataLoader

# Check GPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")
if not torch.cuda.is_available():
    print("WARNING: GPU not detected! Training will be slower.")

# Load dataset
csv_path = "synthetic_complaints.csv"  # Adjust if needed
df = pd.read_csv(csv_path)
print(f"Loaded {len(df)} rows")

# Label functions
def label_sentiment(complaint):
    complaint = complaint.lower()
    if any(word in complaint for word in ["great", "perfect", "thanks", "love"]):
        return 0
    elif any(word in complaint for word in ["terrible", "broke", "sorry", "fake"]):
        return 1
    return 2

def label_urgency(complaint):
    complaint = complaint.lower()
    if any(word in complaint for word in ["urgent", "now", "asap", "days"]):
        return 0
    return 1

def label_fraud(complaint):
    complaint = complaint.lower()
    if any(word in complaint for word in ["fake", "scam", "suspicious", "spam"]):
        return 0
    return 1

# Apply labels
df["sentiment"] = df["complaint"].apply(label_sentiment)
df["urgency"] = df["complaint"].apply(label_urgency)
df["fraud"] = df["complaint"].apply(label_fraud)
print("Labeled dataset")

# Initialize tokenizer
tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")

# Create custom PyTorch dataset class
class ComplaintDataset(TorchDataset):
    def __init__(self, texts, labels, tokenizer, max_length=128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length
        
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = self.texts[idx]
        label = self.labels[idx]
        
        encoding = self.tokenizer(
            text,
            truncation=True,
            max_length=self.max_length,
            padding="max_length",
            return_tensors="pt"
        )
        
        return {
            "input_ids": encoding["input_ids"].flatten(),
            "attention_mask": encoding["attention_mask"].flatten(),
            "labels": torch.tensor(label, dtype=torch.long)
        }

# Split function
def train_test_split(df, test_size=0.1):
    test_size = int(len(df) * test_size)
    df_shuffled = df.sample(frac=1, random_state=42)  # Shuffle with a fixed seed
    train_df = df_shuffled[test_size:]
    test_df = df_shuffled[:test_size]
    return train_df, test_df

# Training settings
train_df, test_df = train_test_split(df)
print(f"Split into {len(train_df)} training and {len(test_df)} test examples")

# Function to train a model
def train_model(label_column, num_labels, model_name):
    print(f"Training {model_name} model...")
    
    # Create datasets
    train_dataset = ComplaintDataset(
        texts=train_df["complaint"].tolist(),
        labels=train_df[label_column].tolist(),
        tokenizer=tokenizer
    )
    
    test_dataset = ComplaintDataset(
        texts=test_df["complaint"].tolist(),
        labels=test_df[label_column].tolist(),
        tokenizer=tokenizer
    )
    
    # Initialize model
    model = DistilBertForSequenceClassification.from_pretrained(
        "distilbert-base-uncased", 
        num_labels=num_labels,
        ignore_mismatched_sizes=True
    )
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=f"./results_{model_name}",
        num_train_epochs=2,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        save_steps=5000,
        save_total_limit=2,
        logging_steps=100,
        evaluation_strategy="epoch",
        fp16=torch.cuda.is_available(),
        report_to="none"  # Disable W&B
    )
    
    # Initialize trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset
    )
    
    # Train the model
    trainer.train()
    
    # Save model
    model.save_pretrained(f"{model_name}_model")
    print(f"{model_name.capitalize()} model saved.")
    
    return model

# Train all models
sentiment_model = train_model("sentiment", 3, "sentiment")
urgency_model = train_model("urgency", 2, "urgency")
fraud_model = train_model("fraud", 2, "fraud")

print("All models trained and saved successfully!")