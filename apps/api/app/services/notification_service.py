# apps/api/app/services/notification_service.py
"""
Email notification service for dashboard sharing
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import settings


class NotificationService:
    """Service for sending email notifications"""

    @staticmethod
    async def send_dashboard_shared_notification(
        recipient_email: str,
        recipient_name: str,
        dashboard_name: str,
        owner_name: str,
        permissions: dict,
        dashboard_url: str,
    ) -> bool:
        """
        Send email notification when a dashboard is shared
        
        Args:
            recipient_email: Email of the user receiving the share
            recipient_name: Name of the recipient
            dashboard_name: Name of the dashboard being shared
            owner_name: Name of the dashboard owner
            permissions: Dict with can_view, can_comment, can_edit boolean values
            dashboard_url: URL to view the dashboard
        """
        try:
            subject = f"📊 {owner_name} shared a dashboard with you"

            # Format permissions for display
            permission_list = []
            if permissions.can_view:
                permission_list.append("View dashboards and charts")
            if permissions.can_comment:
                permission_list.append("Add comments and feedback")
            if permissions.can_edit:
                permission_list.append("Modify and edit dashboard")
            
            permissions_text = ", ".join(permission_list) if permission_list else "No permissions granted"

            # HTML email template
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #0066cc;">Dashboard Shared with You 📊</h2>
                        
                        <p>Hi {recipient_name},</p>
                        
                        <p><strong>{owner_name}</strong> has shared a dashboard with you:</p>
                        
                        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #0066cc;">{dashboard_name}</h3>
                            <p><strong>Your Permissions:</strong></p>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                {''.join(f'<li style="margin: 5px 0;">{perm}</li>' for perm in permission_list)}
                            </ul>
                        </div>
                        
                        <div style="margin: 20px 0;">
                            <a href="{dashboard_url}" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                View Dashboard
                            </a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        
                        <p style="font-size: 12px; color: #666;">
                            You received this email because a dashboard was shared with you. 
                            If you don't want to receive these emails, you can adjust your notification settings.
                        </p>
                    </div>
                </body>
            </html>
            """

            # Plain text version
            text_content = f"""
Dashboard Shared with You

Hi {recipient_name},

{owner_name} has shared a dashboard with you:

Dashboard: {dashboard_name}

Your Permissions:
{chr(10).join(f'• {perm}' for perm in permission_list)}

View Dashboard: {dashboard_url}

---

You received this email because a dashboard was shared with you.
"""

            # Send email
            return NotificationService._send_email(
                recipient_email=recipient_email,
                subject=subject,
                html_content=html_content,
                text_content=text_content,
            )

        except Exception as e:
            print(f"Failed to send dashboard share notification: {str(e)}")
            return False

    @staticmethod
    def _send_email(
        recipient_email: str,
        subject: str,
        html_content: str,
        text_content: str,
    ) -> bool:
        """
        Internal method to send email using SMTP
        """
        try:
            # Check if email is configured
            if not settings.SMTP_SERVER or not settings.SMTP_USERNAME:
                print("Email service not configured")
                return False

            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.SMTP_FROM_EMAIL
            msg["To"] = recipient_email

            # Attach both HTML and plain text versions
            msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            # Send email
            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                if settings.SMTP_TLS:
                    server.starttls()
                if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.send_message(msg)

            return True

        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            return False
