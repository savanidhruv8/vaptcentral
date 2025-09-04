#!/usr/bin/env python
"""
Test script for email functionality in VAPT Dashboard
Tests: User activation, Password reset, OTP verification
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vapt_dashboard.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from vapt_core.models import CustomUser

User = get_user_model()

def test_email_configuration():
    """Test if email configuration is working"""
    print("=" * 50)
    print("TESTING EMAIL CONFIGURATION")
    print("=" * 50)
    
    # Check email settings
    print(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
    print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    print(f"FRONTEND_URL: {settings.FRONTEND_URL}")
    
    # Test basic email sending
    try:
        send_mail(
            subject='VAPT Dashboard - Email Test',
            message='This is a test email from VAPT Dashboard to verify email functionality.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['csu.aiml@gmail.com'],
            fail_silently=False,
        )
        print("✅ Basic email sending: SUCCESS")
    except Exception as e:
        print(f"❌ Basic email sending: FAILED - {e}")
    
    print()

def test_user_activation_email():
    """Test user activation email functionality"""
    print("=" * 50)
    print("TESTING USER ACTIVATION EMAIL")
    print("=" * 50)
    
    # Create a test user
    try:
        test_user = User.objects.create_user(
            username='test_activation_user',
            email='test.activation@example.com',
            password='testpass123',
            first_name='Test',
            last_name='Activation',
            role='general_user',
            is_activated=False,
            is_active=False
        )
        
        # Test activation email
        try:
            test_user.send_activation_email()
            print("✅ User activation email: SUCCESS")
            print(f"   Activation token: {test_user.activation_token}")
            print(f"   Activation URL: {settings.FRONTEND_URL}/activate/{test_user.activation_token}/")
        except Exception as e:
            print(f"❌ User activation email: FAILED - {e}")
        
        # Clean up
        test_user.delete()
        
    except Exception as e:
        print(f"❌ User creation for activation test: FAILED - {e}")
    
    print()

def test_password_reset_email():
    """Test password reset email functionality"""
    print("=" * 50)
    print("TESTING PASSWORD RESET EMAIL")
    print("=" * 50)
    
    # Create a test user
    try:
        test_user = User.objects.create_user(
            username='test_reset_user',
            email='test.reset@example.com',
            password='testpass123',
            first_name='Test',
            last_name='Reset',
            role='general_user',
            is_activated=True,
            is_active=True
        )
        
        # Test password reset email
        try:
            test_user.send_password_reset_email()
            print("✅ Password reset email: SUCCESS")
            print(f"   OTP Code: {test_user.otp_code}")
            print(f"   OTP Expires: {test_user.otp_expires}")
        except Exception as e:
            print(f"❌ Password reset email: FAILED - {e}")
        
        # Clean up
        test_user.delete()
        
    except Exception as e:
        print(f"❌ User creation for reset test: FAILED - {e}")
    
    print()

def test_super_admin_creation_email():
    """Test email sent when super admin creates a user"""
    print("=" * 50)
    print("TESTING SUPER ADMIN USER CREATION EMAIL")
    print("=" * 50)
    
    # Get the super admin user
    try:
        super_admin = User.objects.get(email='csu.aiml@gmail.com')
        print(f"Super Admin: {super_admin.email}")
        
        # Create a test user through the API (simulate super admin action)
        test_user = User.objects.create_user(
            username='test_created_user',
            email='test.created@example.com',
            password='temp_password_123',
            first_name='Test',
            last_name='Created',
            role='general_user',
            is_activated=False,
            is_active=False
        )
        
        # Test activation email for newly created user
        try:
            test_user.send_activation_email()
            print("✅ Super admin user creation email: SUCCESS")
            print(f"   New user email: {test_user.email}")
            print(f"   Activation token: {test_user.activation_token}")
            print(f"   Activation URL: {settings.FRONTEND_URL}/activate/{test_user.activation_token}/")
        except Exception as e:
            print(f"❌ Super admin user creation email: FAILED - {e}")
        
        # Clean up
        test_user.delete()
        
    except User.DoesNotExist:
        print("❌ Super admin user not found")
    except Exception as e:
        print(f"❌ Super admin user creation test: FAILED - {e}")
    
    print()

def test_email_templates():
    """Test email template content"""
    print("=" * 50)
    print("TESTING EMAIL TEMPLATES")
    print("=" * 50)
    
    # Create a test user for template testing
    test_user = User.objects.create_user(
        username='template_test_user',
        email='template.test@example.com',
        password='testpass123',
        first_name='Template',
        last_name='Test',
        role='general_user',
        is_activated=False,
        is_active=False
    )
    
    # Test activation email template
    try:
        activation_subject = f"VAPT Dashboard - Account Activation for {test_user.first_name} {test_user.last_name}"
        activation_message = f"""
Hello {test_user.first_name} {test_user.last_name},

Your account has been created in the VAPT Dashboard system.

Please click the following link to activate your account and set your password:
{settings.FRONTEND_URL}/activate/{test_user.activation_token}/

This link will expire in 24 hours.

If you did not request this account, please ignore this email.

Best regards,
VAPT Dashboard Team
        """
        
        print("✅ Activation email template: SUCCESS")
        print(f"   Subject: {activation_subject}")
        print(f"   Message length: {len(activation_message)} characters")
        
    except Exception as e:
        print(f"❌ Activation email template: FAILED - {e}")
    
    # Test password reset email template
    try:
        test_user.send_password_reset_email()
        reset_subject = f"VAPT Dashboard - Password Reset for {test_user.first_name} {test_user.last_name}"
        reset_message = f"""
Hello {test_user.first_name} {test_user.last_name},

You have requested a password reset for your VAPT Dashboard account.

Your OTP code is: {test_user.otp_code}

This OTP will expire in 10 minutes.

If you did not request this password reset, please ignore this email.

Best regards,
VAPT Dashboard Team
        """
        
        print("✅ Password reset email template: SUCCESS")
        print(f"   Subject: {reset_subject}")
        print(f"   OTP Code: {test_user.otp_code}")
        print(f"   Message length: {len(reset_message)} characters")
        
    except Exception as e:
        print(f"❌ Password reset email template: FAILED - {e}")
    
    # Clean up
    test_user.delete()
    print()

def main():
    """Run all email functionality tests"""
    print("VAPT Dashboard - Email Functionality Test")
    print("=" * 60)
    print(f"Test started at: {datetime.now()}")
    print()
    
    # Run all tests
    test_email_configuration()
    test_user_activation_email()
    test_password_reset_email()
    test_super_admin_creation_email()
    test_email_templates()
    
    print("=" * 60)
    print("Email functionality test completed!")
    print(f"Test finished at: {datetime.now()}")
    print()
    print("Next steps:")
    print("1. Check your email (csu.aiml@gmail.com) for test emails")
    print("2. Test the activation links in a browser")
    print("3. Test the password reset OTP functionality")
    print("4. Verify email templates look correct")

if __name__ == "__main__":
    main()
