import pandas as pd
import random
from faker import Faker

# Initialize Faker for realistic text
fake = Faker()

# Define categories
categories = ["product", "payment", "employee", "vendor", "legal", "other"]

# Complaint and response templates with matched intent
data_templates = {
    "product": {
        "negative": [
            ("The {product} broke after {days} days of use.", "We're sorry the {product} broke; we'll investigate and get back to you."),
            ("Your {product} is terrible quality!", "Apologies for the {product} quality issue; our team is on it.")
        ],
        "positive": [
            ("The {product} works perfectly, great job!", "Thanks for the feedback on the {product}; glad you're satisfied!")
        ],
        "fraud": [
            ("I got a fake {product}—this is a scam!", "Suspected fake {product} detected; please email proof to support@startupgrievance.com.")
        ]
    },
    "payment": {
        "negative": [
            ("Payment of ${amount} was delayed by {days} days!", "Sorry for the ${amount} payment delay; we're resolving it now."),
            ("You overcharged me by ${amount}!", "We apologize for the ${amount} overcharge; we'll refund you soon.")
        ],
        "positive": [
            ("Payment of ${amount} went through smoothly.", "Great to hear the ${amount} payment processed well; thanks!")
        ],
        "fraud": [
            ("This ${amount} payment link looks suspicious!", "Possible fraud with the ${amount} payment; email proof to support@startupgrievance.com.")
        ]
    },
    "employee": {
        "negative": [
            ("Employee {name} was rude on {date}.", "We'll address {name}'s behavior from {date}; apologies for the trouble."),
            ("Staff ignored my request for {days} days.", "Sorry your request was ignored for {days} days; we're fixing this.")
        ],
        "positive": [
            ("{name} did an amazing job helping me!", "Thanks for praising {name}; we'll let them know!")
        ],
        "fraud": [
            ("Fake employee {name} contacted me!", "Fake {name} reported; please send proof to support@startupgrievance.com.")
        ]
    },
    "vendor": {
        "negative": [
            ("Vendor {vendor} didn't deliver {item} on time.", "Apologies for {vendor}'s delay with {item}; we're following up."),
            ("Vendor {vendor} overcharged us by ${amount}!", "Sorry for {vendor}'s ${amount} overcharge; we'll handle it.")
        ],
        "positive": [
            ("Vendor {vendor} delivered {item} perfectly.", "Glad {vendor} met expectations with {item}; thanks for the feedback!")
        ],
        "fraud": [
            ("Vendor {vendor} sent spam about {item}!", "Spam from {vendor} about {item} noted; email proof to support@startupgrievance.com.")
        ]
    },
    "legal": {
        "negative": [
            ("Your contract violates {regulation}!", "We'll review the {regulation} violation concern promptly."),
            ("Urgent: {clause} clause needs fixing!", "The {clause} issue is urgent; we're looking into it now.")
        ],
        "positive": [
            ("Legal terms for {clause} are clear.", "Good to know the {clause} terms work for you; thanks!")
        ],
        "fraud": [
            ("This {clause} doc looks fraudulent!", "Suspected fraud with {clause}; please email support@startupgrievance.com.")
        ]
    },
    "other": {
        "negative": [
            ("Issue with {thing} has lasted {days} days!", "We're sorry the {thing} issue persisted for {days} days; it's in progress."),
            ("Problem with {thing} is unacceptable!", "Apologies for the {thing} problem; we're addressing it.")
        ],
        "positive": [
            ("Everything's great with {thing}!", "Thanks for the {thing} feedback; happy it's working!")
        ],
        "fraud": [
            ("Spam about {thing} keeps coming!", "Spam regarding {thing} noted; send proof to support@startupgrievance.com.")
        ]
    }
}

# Generate 30,000 rows
data = []
for _ in range(30000):
    category = random.choice(categories)
    intent = random.choice(["negative", "positive", "fraud"])  # Randomly pick intent
    complaint_template, response_template = random.choice(data_templates[category][intent])
    
    # Fill templates with clean, realistic data
    if category == "product":
        product = fake.word()
        data_dict = {"product": product}
        if "{days}" in complaint_template:
            data_dict["days"] = random.randint(1, 30)
        complaint = complaint_template.format(**data_dict)
        response = response_template.format(**data_dict)
    elif category == "payment":
        amount = random.randint(10, 1000)
        data_dict = {"amount": amount}
        if "{days}" in complaint_template:
            data_dict["days"] = random.randint(1, 15)
        complaint = complaint_template.format(**data_dict)
        response = response_template.format(**data_dict)
    elif category == "employee":
        name = fake.name()
        data_dict = {"name": name}
        if "{date}" in complaint_template:
            data_dict["date"] = fake.date_this_month()
        if "{days}" in complaint_template:
            data_dict["days"] = random.randint(1, 10)
        complaint = complaint_template.format(**data_dict)
        response = response_template.format(**data_dict)
    elif category == "vendor":
        vendor = fake.company()
        item = fake.word()
        data_dict = {"vendor": vendor, "item": item}
        if "{amount}" in complaint_template:
            data_dict["amount"] = random.randint(50, 500)
        complaint = complaint_template.format(**data_dict)
        response = response_template.format(**data_dict)
    elif category == "legal":
        data_dict = {}
        if "{regulation}" in complaint_template:
            data_dict["regulation"] = fake.word()
        if "{clause}" in complaint_template:
            data_dict["clause"] = fake.word()
        complaint = complaint_template.format(**data_dict)
        response = response_template.format(**data_dict)
    else:  # other
        thing = fake.word()
        data_dict = {"thing": thing}
        if "{days}" in complaint_template:
            data_dict["days"] = random.randint(1, 20)
        complaint = complaint_template.format(**data_dict)
        response = response_template.format(**data_dict)
    
    # Clean any unexpected symbols
    complaint = complaint.replace("\n", " ").strip()
    response = response.replace("\n", " ").strip()
    
    data.append({"category": category, "intent": intent, "complaint": complaint, "response": response})

# Save to CSV
df = pd.DataFrame(data)
df.to_csv("synthetic_complaints.csv", index=False)
print("Generated 30,000 rows and saved to synthetic_complaints.csv")