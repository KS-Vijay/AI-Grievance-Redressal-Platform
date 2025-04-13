import pandas as pd
import random
from faker import Faker

# Initialize Faker for realistic text
fake = Faker()

# Define categories
categories = ["product", "payment", "employee", "vendor", "legal", "other"]

# More detailed product types
product_types = {
    "electronics": ["smartphone", "laptop", "tablet", "headphones", "smartwatch", "camera", "speaker", "monitor"],
    "clothing": ["shirt", "pants", "dress", "jacket", "shoes", "hat", "socks", "sweater"],
    "home": ["furniture", "appliance", "cookware", "bedding", "lighting", "decor"],
    "software": ["app", "program", "subscription service", "digital product", "software license"]
}

# More realistic complaint and response templates with matched intent
data_templates = {
    "product": {
        "negative": [
            ("I purchased your {product_type} {timeframe} and it stopped working after only {usage_time}. The {specific_issue} is very frustrating and I need this resolved immediately.", 
             "We sincerely apologize for the issues you're experiencing with your {product_type}. Our quality standards were clearly not met in this case. We'd like to offer you {resolution_option} to address the {specific_issue}. Please contact our support team with your order number for immediate assistance."),
            
            ("The quality of the {product_type} I received is absolutely terrible. The {specific_issue} makes it practically unusable, and it's not at all what I expected for the price I paid.", 
             "We're truly sorry to hear about your disappointing experience with our {product_type}. The {specific_issue} you described is not typical of our products. We'd be happy to {resolution_option} at your earliest convenience. Your satisfaction is our priority."),
            
            ("I'm very disappointed with my recent purchase of your {product_type}. It's missing {missing_feature} which was clearly advertised on your website. This feels like false advertising.", 
             "Thank you for bringing this to our attention. We apologize for the confusion regarding the {missing_feature} on our {product_type}. We'll review our product descriptions to ensure accuracy. In the meantime, we'd like to offer you {resolution_option} to make this right.")
        ],
        "positive": [
            ("I just wanted to let you know that the {product_type} I purchased {timeframe} has exceeded my expectations. The {positive_feature} is exactly what I needed!", 
             "Thank you for your wonderful feedback about our {product_type}! We're delighted to hear that the {positive_feature} has been beneficial for you. We strive to deliver quality products that meet our customers' needs, and your satisfaction means a lot to us."),
            
            ("I've been using your {product_type} for {usage_time} now, and I'm impressed with its durability and performance. The {positive_feature} makes it stand out from competitors.", 
             "We really appreciate you taking the time to share your positive experience with our {product_type}. It's fantastic to hear that you're enjoying the {positive_feature} and finding it durable. Your feedback helps us continue improving our products!")
        ],
        "fraud": [
            ("I believe I received a counterfeit {product_type} from your company. The packaging looks different, the {specific_issue} is obvious, and the authentication code doesn't work on your website.", 
             "We take potential counterfeit products very seriously. The issues you've described with the {specific_issue} are concerning. Please email photos of the product and packaging to our fraud department at security@startupgrievance.com, along with your order details so we can investigate immediately."),
            
            ("Someone claiming to be from your company called asking for my credit card details to verify my {product_type} purchase. This seems like a scam attempt using your brand name.", 
             "Thank you for alerting us to this potential fraud. We NEVER call customers requesting credit card information to verify purchases. Please do not provide any personal information to these callers. We've logged this incident and would appreciate any details you can share about the call at security@startupgrievance.com.")
        ]
    },
    "payment": {
        "negative": [
            ("My payment of ${amount} for order #{order_number} was processed, but I still haven't received confirmation or shipping details after {days} days. This is unacceptable for a purchase of this size.", 
             "We sincerely apologize for the delay with your ${amount} payment for order #{order_number}. This is not our standard process. Our finance team is looking into this immediately, and we'll ensure your order is prioritized. You should receive confirmation within 24 hours."),
            
            ("You've charged me ${amount} twice for the same order #{order_number}! I've checked my bank statement and there are definitely two identical charges from your company on {date}.", 
             "We're extremely sorry about the duplicate charge of ${amount} for order #{order_number}. This was clearly an error on our part. We've already initiated a refund for the second charge, which should appear in your account within 3-5 business days. We're also implementing additional verification steps to prevent this from happening again.")
        ],
        "positive": [
            ("I was really impressed with how smoothly the payment process went for my recent ${amount} purchase. The checkout was intuitive and the confirmation was immediate.", 
             "Thank you for the positive feedback about our payment system! We've worked hard to make the process as seamless as possible, and we're glad your ${amount} transaction went smoothly. We appreciate you taking the time to let us know about your experience."),
            
            ("Your flexible payment options made it possible for me to afford the ${amount} purchase I've been wanting to make. The installment plan is very reasonable and easy to understand.", 
             "We're delighted to hear that our payment options worked well for your needs! Making our products accessible through flexible payment plans is important to us, and we're glad the ${amount} installment plan made your purchase possible.")
        ],
        "fraud": [
            ("I received an email claiming to be from your company with a link to 'verify' a ${amount} payment I never made. The email looks suspicious and I'm concerned it's a phishing attempt.", 
             "Thank you for reporting this suspicious email about a ${amount} payment. This is NOT from our company and appears to be a phishing attempt. Please do not click any links in the email. If possible, forward the email to security@startupgrievance.com so we can investigate. We only send payment confirmation emails for actual purchases, and we never ask customers to verify payments through email links."),
            
            ("Someone tried to use my credit card to make a ${amount} purchase on your website. Thankfully my bank blocked it, but I wanted to alert you to this fraudulent activity.", 
             "We appreciate you alerting us to this fraudulent attempt. We take security very seriously and will flag this incident in our system. Our security team works continuously to prevent unauthorized transactions. If you have any additional information about this ${amount} attempted purchase, please share it with us at security@startupgrievance.com.")
        ]
    },
    "employee": {
        "negative": [
            ("Your employee {name} was extremely rude to me during my visit on {date}. When I asked about {query_topic}, they rolled their eyes and said they were too busy to help. This kind of customer service is unacceptable.", 
             "We're deeply sorry about your negative experience with {name} on {date}. This type of behavior does not reflect our values or service standards. We take this feedback very seriously and will address it directly with {name} and their supervisor. We'd like to make this right - a customer service manager will contact you shortly to discuss how we can best resolve this situation."),
            
            ("I've been trying to get help with {query_topic} for {days} days now. Your staff keeps transferring me between departments, and nobody seems willing to take responsibility. I've wasted hours on this issue already.", 
             "Please accept our sincere apologies for the frustrating experience you've had trying to resolve your {query_topic} issue. Being transferred between departments for {days} days is completely unacceptable. We're reviewing our internal processes to address this breakdown in communication. I've escalated your case to our customer solutions team, and a dedicated representative will contact you within 24 hours to resolve this matter properly.")
        ],
        "positive": [
            ("{name} provided exceptional service when helping me with {query_topic} yesterday. They were knowledgeable, patient, and went above and beyond to solve my problem. You're lucky to have such a dedicated employee!", 
             "Thank you for your wonderful feedback about {name}! We're thrilled to hear about the exceptional service you received with your {query_topic} inquiry. We agree that {name} is a valuable team member, and we'll make sure they and their manager know about your praise. It's customer experiences like yours that inspire our team to maintain high service standards."),
            
            ("I wanted to commend your employee {name} for their outstanding help with my complicated {query_topic} situation. They stayed late to ensure everything was properly resolved and followed up the next day to check if I needed anything else.", 
             "We greatly appreciate you taking the time to recognize {name}'s outstanding assistance with your {query_topic} situation. Going the extra mile and following up are exactly the kind of service excellence we strive for. We'll be sure to celebrate this feedback with {name} and their team. Thank you for sharing this positive experience!")
        ],
        "fraud": [
            ("Someone claiming to be your employee {name} contacted me asking for my personal information to 'verify my account.' They couldn't answer basic questions about your company, which made me suspicious.", 
             "Thank you for reporting this suspicious contact. This person claiming to be {name} is NOT a legitimate representative of our company. We never ask customers to verify account information through unsolicited calls. This appears to be an attempted identity theft. Please report any details you have about this interaction to security@startupgrievance.com and be assured we're investigating this fraudulent use of our company name."),
            
            ("I received a LinkedIn request from someone claiming to be {name}, a recruiter at your company. They immediately asked for my resume with personal details, but the profile looks fake and was just created last week.", 
             "We appreciate you bringing this to our attention. This fake profile of {name} is not associated with our company. Our actual recruiters always use company email addresses and follow professional protocols. We're reporting this fraudulent account to LinkedIn and investigating further. If you have screenshots or additional information, please forward them to security@startupgrievance.com.")
        ]
    },
    "vendor": {
        "negative": [
            ("Your vendor {vendor_name} was supposed to deliver {service_desc} by {deadline}, but we're still waiting with no clear explanation for the delay. This is impacting our entire project timeline.", 
             "We sincerely apologize for the delay with {vendor_name}'s delivery of {service_desc}. This falls short of our partnership standards. We've contacted {vendor_name} directly to address this delay and expedite your delivery. Additionally, we're reviewing our vendor performance monitoring to prevent future issues. Your dedicated account manager will contact you today with a concrete resolution timeline."),
            
            ("The quality of service provided by your vendor {vendor_name} for our {service_desc} project was substandard. There were numerous errors that we've had to correct ourselves, costing us additional time and resources.", 
             "We're truly sorry about the quality issues you've experienced with {vendor_name}'s work on your {service_desc} project. This is completely unacceptable and doesn't reflect our quality standards. We'll conduct a full review of the deliverables and arrange for necessary corrections at no additional cost to you. We're also reassessing our relationship with {vendor_name} based on this feedback.")
        ],
        "positive": [
            ("Your vendor {vendor_name} did an outstanding job with our {service_desc} project. They were professional, met every deadline, and the quality exceeded our expectations. We would definitely use them again.", 
             "Thank you for sharing your positive experience with {vendor_name} on your {service_desc} project! We're delighted to hear about their professionalism and quality work. We carefully select our vendor partners, and it's rewarding to know they're delivering excellent service. We'll pass along your praise to {vendor_name} and make note of your satisfaction for future projects."),
            
            ("We've been working with your vendor {vendor_name} for our {service_desc} needs for the past {timeframe}, and they've consistently delivered excellent results. Their team is responsive and accommodating to our changing requirements.", 
             "We greatly appreciate your positive feedback about {vendor_name}'s consistent performance with your {service_desc} needs over the past {timeframe}. Building long-term partnerships is important to us, and we're pleased that they've been responsive to your changing requirements. This kind of feedback helps us maintain our high standards for vendor selection.")
        ],
        "fraud": [
            ("We received an invoice from {vendor_name} for {service_desc} services we never ordered or received. The invoice looks like it's from your company, but the payment details are different from our previous transactions.", 
             "Thank you for alerting us to this fraudulent invoice from {vendor_name} for {service_desc} services. This is NOT a legitimate billing from our company or our authorized vendors. Please do not pay this invoice. We recommend forwarding the complete invoice to security@startupgrievance.com so we can investigate further and take appropriate action to prevent similar fraud attempts."),
            
            ("A company calling themselves {vendor_name} contacted us claiming to be your new authorized vendor for {service_desc}. They're asking us to update our payment information, but we're suspicious since we received no prior notification from you about this change.", 
             "You were right to be suspicious - {vendor_name} is NOT an authorized vendor for our {service_desc} services. This appears to be a sophisticated fraud attempt. We always provide formal written notification of any vendor changes through official channels. Please report any details about this contact to security@startupgrievance.com, including phone numbers or email addresses they used. We'll investigate immediately.")
        ]
    },
    "legal": {
        "negative": [
            ("Your Terms of Service appear to violate {regulation} regulations, particularly the section on {clause_topic}. This could expose both your company and your users to legal liability.", 
             "Thank you for bringing this potential compliance issue regarding {regulation} to our attention. We take regulatory compliance very seriously. Our legal team is reviewing the {clause_topic} section of our Terms of Service immediately to assess the concern you've raised. We'll make any necessary updates to ensure full compliance and will notify all users of any changes made."),
            
            ("The {clause_topic} clause in your contract is ambiguous and potentially unenforceable under current {jurisdiction} law. This needs to be addressed before we can proceed with our partnership.", 
             "We appreciate your thorough review of our contract and for highlighting the concern with the {clause_topic} clause. You raise a valid point regarding {jurisdiction} law compliance. Our legal team will revise this section to provide clarity and ensure enforceability. We'll send you an updated version within the next 3 business days and are happy to discuss any additional concerns you might have.")
        ],
        "positive": [
            ("I'm impressed with the clarity of your updated Terms of Service, especially the {clause_topic} section. The plain language approach makes it much easier for users to understand their rights and obligations.", 
             "Thank you for your positive feedback about our updated Terms of Service! We made a conscious effort to improve the clarity of our {clause_topic} section and other areas. Our goal is to create transparent, understandable policies for all our users, so your feedback is particularly meaningful. We'll continue this approach with future policy updates."),
            
            ("The legal framework you've established for handling {clause_topic} issues shows thoughtful consideration of both user rights and business necessities. It strikes a good balance that many companies miss.", 
             "We sincerely appreciate your positive assessment of our legal framework for {clause_topic} issues. Our legal and product teams worked collaboratively to create policies that protect both our users and our business interests. Feedback from knowledgeable individuals like yourself helps validate our approach. Thank you for taking the time to share your thoughts.")
        ],
        "fraud": [
            ("We received what appears to be a legal notice from your company regarding {clause_topic}, but the document contains numerous errors and the contact information doesn't match your official channels. We suspect this might be fraudulent.", 
             "Thank you for bringing this suspicious legal notice to our attention. This document regarding {clause_topic} was NOT issued by our legal department. This appears to be a fraudulent attempt using our company name. Please send a copy of this document to security@startupgrievance.com so we can investigate further. All legitimate legal communications from us come through official channels with proper company letterhead and verifiable contact information."),
            
            ("Someone claiming to be your legal representative contacted us about an urgent {clause_topic} matter requiring immediate payment to avoid litigation. The threatening tone and demand for unconventional payment methods raised red flags for us.", 
             "You were right to be suspicious. This was NOT a legitimate communication from our legal department. We never demand payments through unconventional methods, and our communications always provide proper documentation and follow professional protocols. This appears to be a scam attempting to use our company name to extract payments. Please forward any details you have about this communication to security@startupgrievance.com for our investigation.")
        ]
    },
    "other": {
        "negative": [
            ("I've been experiencing persistent issues with {problem_area} for the past {timeframe}. Despite multiple attempts to resolve this through your support channels, the problem continues. This is severely impacting my ability to {user_activity}.", 
             "We sincerely apologize for the ongoing {problem_area} issues you've experienced for {timeframe}. It's clear that our previous support efforts have fallen short, and we understand how frustrating this must be, especially when it impacts your {user_activity}. We're escalating this to our specialized technical team, and a senior support engineer will contact you directly within 24 hours with a comprehensive solution."),
            
            ("The recent changes to your {feature_name} have made the platform much more difficult to use for {user_activity}. The new workflow requires twice as many steps and is extremely unintuitive. Please reconsider this update.", 
             "Thank you for your candid feedback about our recent {feature_name} changes. We appreciate hearing how these updates have negatively impacted your {user_activity} workflow. User experience is important to us, and we clearly missed the mark with these changes. Our product team is reviewing your feedback, and we're already working on improvements to streamline the process. We'll keep you updated on our progress.")
        ],
        "positive": [
            ("The recent update to {feature_name} has significantly improved my experience with {user_activity}. The new interface is intuitive, and the additional functionality saves me hours each week. Great job!", 
             "Thank you for the wonderful feedback about our {feature_name} update! We're thrilled to hear that it's made your {user_activity} more efficient and intuitive. Our development team put a lot of thought into this redesign, and your positive experience validates their efforts. We'll share your comments with the team that worked on this feature."),
            
            ("I just wanted to express my appreciation for your company's approach to {business_area}. Your commitment to {value_prop} really sets you apart from competitors and has made me a loyal customer for {timeframe}.", 
             "We're genuinely touched by your kind words about our approach to {business_area}. Commitment to {value_prop} is core to our company values, and hearing that it resonates with customers like you who have stayed with us for {timeframe} is incredibly rewarding. Thank you for your loyalty and for taking the time to share this feedback.")
        ],
        "fraud": [
            ("I've been receiving emails claiming to offer exclusive {feature_name} access, but they're asking for unusual information and the email addresses don't match your official domain. I think someone might be impersonating your company.", 
             "Thank you for alerting us to these suspicious emails about {feature_name} access. These are NOT legitimate communications from our company. This appears to be a phishing attempt targeting our customers. Please forward any of these emails to security@startupgrievance.com so we can investigate further and take action. We never request sensitive information through unsolicited emails."),
            
            ("There's a website that looks almost identical to yours offering {feature_name} at a steep discount, but with slightly different URL and contact information. I believe this is a fraudulent site attempting to scam your customers.", 
             "We greatly appreciate you reporting this fraudulent website imitating our platform and {feature_name} offerings. This is definitely NOT our legitimate site. We're taking immediate action to have this fake site taken down. If you have the URL or screenshots, please send them to security@startupgrievance.com to assist our investigation. Please advise others to be cautious and only use our official website.")
        ]
    }
}

# Add variety to time references
timeframes = ["last week", "two weeks ago", "yesterday", "a month ago", "recently", "three days ago", "this morning"]
usage_times = ["a few days", "just one week", "barely two weeks", "less than a month", "only 3 uses", "the first day", "a couple of hours"]

# Product specific issues
electronics_issues = ["battery drains too quickly", "screen keeps freezing", "charging port is loose", "touch screen isn't responsive", "overheats during normal use"]
clothing_issues = ["seams are coming apart", "fabric is much thinner than shown", "color is completely different from the website", "sizing is way off", "buttons fell off after one wash"]
home_issues = ["parts were missing from the package", "assembly instructions are incomprehensible", "item arrived damaged", "material quality is poor", "doesn't function as described"]
software_issues = ["constant crashes", "key feature doesn't work", "excessive battery drain", "incompatible with my device", "extremely slow performance"]

# Product positive features
electronics_features = ["battery life", "sleek design", "fast processing speed", "crystal clear display", "intuitive interface"]
clothing_features = ["comfortable fit", "high-quality fabric", "stylish design", "durability after multiple washes", "attention to detail"]
home_features = ["sturdy construction", "elegant design", "practical functionality", "easy assembly", "perfect size for my space"]
software_features = ["user-friendly interface", "reliable performance", "helpful customer support", "regular updates", "seamless integration with my workflow"]

# Payment specifics
order_numbers = [f"{random.randint(10000, 99999)}" for _ in range(100)]
payment_dates = [fake.date_this_month() for _ in range(50)]

# Employee query topics
query_topics = ["product returns", "billing discrepancy", "account access issues", "subscription cancellation", 
               "technical support", "order tracking", "warranty claims", "product recommendations", 
               "service upgrades", "account settings", "payment methods", "shipping options"]

# Vendor services
vendor_services = ["website development", "marketing campaign", "content creation", "IT support", 
                  "graphic design", "equipment maintenance", "training program", "consulting services",
                  "data analysis", "security audit", "software implementation", "inventory management"]

# Legal clauses
legal_clauses = ["data privacy", "intellectual property", "liability limitations", "refund policy", 
                "user content rights", "dispute resolution", "warranty terms", "subscription cancellation",
                "third-party access", "service level agreements", "compliance requirements", "pricing changes"]

# Other categories
problem_areas = ["website navigation", "mobile app performance", "account synchronization", "search functionality",
                "notification system", "checkout process", "profile customization", "content filtering",
                "integration with other tools", "data import/export", "security features", "accessibility options"]

user_activities = ["managing my team", "tracking my orders", "organizing my workflow", "analyzing my data",
                  "communicating with clients", "scheduling appointments", "processing transactions", "creating content",
                  "monitoring performance", "planning my projects", "tracking expenses", "managing inventory"]

features = ["dashboard", "reporting system", "mobile application", "collaboration tools", "automation features",
           "integration capabilities", "user management system", "analytics platform", "notification center",
           "search functionality", "security settings", "customization options"]

business_areas = ["customer service", "product innovation", "sustainability", "user privacy", "community engagement",
                 "ethical business practices", "accessibility", "technical support", "continuous improvement",
                 "transparency", "user education", "responsive design"]

value_props = ["ethical data practices", "environmental responsibility", "user-centered design", "inclusive accessibility",
              "transparent pricing", "exceptional service quality", "continuous innovation", "community support",
              "educational resources", "responsive communication", "attention to detail", "reliability"]

# Resolution options
resolution_options = [
    "a full refund", 
    "a free replacement", 
    "store credit plus a 15% bonus", 
    "an upgrade to our premium model", 
    "complimentary expedited shipping on your replacement", 
    "a personal call from our product specialist", 
    "an extended warranty at no additional cost",
    "to connect you with our senior support team",
    "a discount on your next purchase"
]

# Urgency indicators - words and phrases that suggest urgency
urgent_phrases = [
    "immediately", "urgent", "as soon as possible", "emergency", "critical", 
    "right away", "time-sensitive", "deadline", "crucial", "pressing",
    "can't wait", "promptly", "without delay", "expedite", "quick resolution"
]

# Generate 30,000 rows
data = []
for _ in range(30000):
    category = random.choice(categories)
    intent = random.choice(["negative", "positive", "fraud"])  # Randomly pick intent
    complaint_template, response_template = random.choice(data_templates[category][intent])
    
    # Default label values
    sentiment = 2  # neutral
    urgency = 1    # not urgent
    fraud_flag = 1  # not fraud
    
    # Set sentiment based on intent
    if intent == "positive":
        sentiment = 0  # positive
    elif intent == "negative":
        sentiment = 1  # negative
    
    # Set fraud flag based on intent
    if intent == "fraud":
        fraud_flag = 0  # potential fraud
    
    # Fill templates with more realistic and contextual data
    if category == "product":
        product_category = random.choice(list(product_types.keys()))
        product_type = random.choice(product_types[product_category])
        
        data_dict = {
            "product_type": product_type,
            "timeframe": random.choice(timeframes),
            "usage_time": random.choice(usage_times),
            "resolution_option": random.choice(resolution_options)
        }
        
        # Add specific issues based on product category
        if product_category == "electronics":
            data_dict["specific_issue"] = random.choice(electronics_issues)
            data_dict["positive_feature"] = random.choice(electronics_features)
        elif product_category == "clothing":
            data_dict["specific_issue"] = random.choice(clothing_issues)
            data_dict["positive_feature"] = random.choice(clothing_features)
        elif product_category == "home":
            data_dict["specific_issue"] = random.choice(home_issues)
            data_dict["positive_feature"] = random.choice(home_features)
        else:  # software
            data_dict["specific_issue"] = random.choice(software_issues)
            data_dict["positive_feature"] = random.choice(software_features)
            
        data_dict["missing_feature"] = fake.word() + " " + random.choice(["feature", "functionality", "capability", "option"])
        
        complaint = complaint_template.format(**{k: v for k, v in data_dict.items() if k in complaint_template})
        response = response_template.format(**{k: v for k, v in data_dict.items() if k in response_template})
        
    elif category == "payment":
        amount = random.randint(50, 2000)
        order_number = random.choice(order_numbers)
        date = random.choice(payment_dates)
        days = random.randint(2, 15)
        
        data_dict = {
            "amount": amount,
            "order_number": order_number,
            "date": date,
            "days": days
        }
        
        # Higher amounts might increase urgency
        if amount > 1000 and intent == "negative":
            urgency = 0  # urgent
        
        complaint = complaint_template.format(**{k: v for k, v in data_dict.items() if k in complaint_template})
        response = response_template.format(**{k: v for k, v in data_dict.items() if k in response_template})
        
    elif category == "employee":
        name = fake.name()
        date = fake.date_this_month()
        days = random.randint(2, 10)
        query_topic = random.choice(query_topics)
        
        data_dict = {
            "name": name,
            "date": date,
            "days": days,
            "query_topic": query_topic
        }
        
        # Long waiting periods increase urgency
        if days > 7 and intent == "negative":
            urgency = 0  # urgent
        
        complaint = complaint_template.format(**{k: v for k, v in data_dict.items() if k in complaint_template})
        response = response_template.format(**{k: v for k, v in data_dict.items() if k in response_template})
        
    elif category == "vendor":
        vendor_name = fake.company()
        service_desc = random.choice(vendor_services)
        deadline = fake.date_this_month()
        timeframe = random.choice(["three months", "six months", "a year", "two years"])
        
        data_dict = {
            "vendor_name": vendor_name,
            "service_desc": service_desc,
            "deadline": deadline,
            "timeframe": timeframe
        }
        
        # Certain services are more critical
        if service_desc in ["security audit", "IT support", "equipment maintenance"] and intent == "negative":
            urgency = 0  # urgent
        
        complaint = complaint_template.format(**{k: v for k, v in data_dict.items() if k in complaint_template})
        response = response_template.format(**{k: v for k, v in data_dict.items() if k in response_template})
        
    elif category == "legal":
        regulation = fake.word().capitalize() + " " + random.choice(["Act", "Regulation", "Directive", "Law", "Compliance Standard"])
        jurisdiction = random.choice(["California", "EU", "federal", "international", "industry", "New York", "GDPR"])
        clause_topic = random.choice(legal_clauses)
        
        data_dict = {
            "regulation": regulation,
            "jurisdiction": jurisdiction,
            "clause_topic": clause_topic
        }
        
        # Legal matters are often urgent
        if intent == "negative" or intent == "fraud":
            urgency = 0  # urgent
        
        # Data privacy and security issues are particularly urgent
        if clause_topic in ["data privacy", "security requirements", "liability limitations"]:
            urgency = 0  # urgent
        
        complaint = complaint_template.format(**{k: v for k, v in data_dict.items() if k in complaint_template})
        response = response_template.format(**{k: v for k, v in data_dict.items() if k in response_template})
        
    else:  # other
        problem_area = random.choice(problem_areas)
        timeframe = random.choice(["two weeks", "a month", "several days", "over a week"])
        user_activity = random.choice(user_activities)
        feature_name = random.choice(features)
        business_area = random.choice(business_areas)
        value_prop = random.choice(value_props)
        
        data_dict = {
            "problem_area": problem_area,
            "timeframe": timeframe,
            "user_activity": user_activity,
            "feature_name": feature_name,
            "business_area": business_area,
            "value_prop": value_prop
        }
        
        # Issues with security or critical functionality are urgent
        if problem_area in ["security features", "account synchronization", "checkout process"] and intent == "negative":
            urgency = 0  # urgent
        
        complaint = complaint_template.format(**{k: v for k, v in data_dict.items() if k in complaint_template})
        response = response_template.format(**{k: v for k, v in data_dict.items() if k in response_template})
    
    # Check for urgent phrases in the complaint text
    if any(phrase in complaint.lower() for phrase in urgent_phrases):
        urgency = 0  # mark as urgent
    
    # Clean any unexpected symbols and format
    complaint = complaint.replace("\n", " ").strip()
    response = response.replace("\n", " ").strip()
    
    # Add data to the dataset
    data.append({
        "category": category, 
        "intent": intent, 
        "complaint": complaint, 
        "response": response,
        "sentiment": sentiment,  # 0: positive, 1: negative, 2: neutral
        "urgency": urgency,      # 0: urgent, 1: not urgent
        "fraud": fraud_flag      # 0: potential fraud, 1: not fraud
    })

# Save to CSV
df = pd.DataFrame(data)
df.to_csv("synthetic_complaints.csv", index=False)
print(f"Generated {len(data)} rows of realistic complaints and responses, saved to synthetic_complaints.csv")