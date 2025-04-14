
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

def send_complaint_notification(to_email, complaint_data):
    """
    Send an email notification with complaint details and response
    
    Args:
        to_email: Recipient email address
        complaint_data: Dictionary containing complaint details
    """
    # For demonstration purposes - in a production environment you would use real SMTP credentials
    sender_email = "notifications@ai-grievance.com"
    smtp_server = "smtp.your-email-provider.com"
    smtp_port = 587
    smtp_username = "your-username"
    smtp_password = "your-password"
    
    subject = f"Your Complaint {complaint_data['complaint_id']} Has Been Processed"
    
    # Create HTML email content with formatting
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
                
                <div style="margin-top: 15px; background-color: #eef2f7; padding: 10px; border-radius: 4px;">
                    <p style="margin: 5px 0;"><strong>AI Confidence:</strong></p>
                    <p style="margin: 5px 0;">Sentiment: {int(complaint_data.get('sentiment_confidence', 0.9) * 100)}%</p>
                    <p style="margin: 5px 0;">Urgency: {int(complaint_data.get('urgency_confidence', 0.9) * 100)}%</p>
                    <p style="margin: 5px 0;">Fraud: {int(complaint_data.get('fraud_confidence', 0.9) * 100)}%</p>
                </div>
            </div>
            
            <p>Thank you for using our AI Grievance System.</p>
            <p style="font-size: 12px; color: #666;">This is an automated message. Please do not reply directly to this email.</p>
        </div>
    </body>
    </html>
    """
    
    # Create plain text version as fallback
    text_content = f"""
    AI Grievance System: Complaint Processed
    
    Your complaint has been analyzed and processed by our AI system.
    
    Complaint ID: {complaint_data['complaint_id']}
    Category: {complaint_data['category']}
    Submitted: {datetime.fromtimestamp(complaint_data['timestamp']).strftime('%Y-%m-%d %H:%M:%S')}
    Your complaint: {complaint_data['complaint']}
    
    Our Response:
    {complaint_data['response']}
    
    AI Analysis:
    Sentiment: {complaint_data['sentiment']}
    Urgency: {complaint_data['urgency']}
    Fraud Assessment: {complaint_data['fraud']}
    
    Thank you for using our AI Grievance System.
    """
    
    # For demonstration purposes, just print to console instead of sending
    print(f"Would send email to {to_email} with subject: {subject}")
    print("Email content would include the complaint details and AI response")
    
    # In a production environment, uncomment the following to actually send emails:
    """
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = sender_email
        msg['To'] = to_email
        
        part1 = MIMEText(text_content, 'plain')
        part2 = MIMEText(html_content, 'html')
        
        msg.attach(part1)
        msg.attach(part2)
        
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.ehlo()
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
            
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
    """
    return True
