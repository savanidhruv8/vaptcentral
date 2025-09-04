#!/usr/bin/env python
"""
API Test script for email functionality endpoints
Tests: Password reset, OTP verification, Account activation
"""

import requests
import json

# API Base URL
BASE_URL = "http://127.0.0.1:8000/api"

def test_password_reset_flow():
    """Test password reset API flow"""
    print("=" * 50)
    print("TESTING PASSWORD RESET API FLOW")
    print("=" * 50)
    
    # Step 1: Request password reset
    print("1. Requesting password reset...")
    reset_data = {
        "email": "csu.aiml@gmail.com"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/password-reset/", json=reset_data)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Password reset request: SUCCESS")
        else:
            print("❌ Password reset request: FAILED")
            
    except Exception as e:
        print(f"❌ Password reset request: ERROR - {e}")
    
    print()

def test_activation_endpoints():
    """Test account activation endpoints"""
    print("=" * 50)
    print("TESTING ACCOUNT ACTIVATION ENDPOINTS")
    print("=" * 50)
    
    # Create a test user first
    print("1. Creating test user for activation...")
    
    # You would need to create a user first through the API
    # For now, let's test with a sample token
    sample_token = "test-activation-token-123"
    
    # Test activation user endpoint
    print("2. Testing activation user endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/auth/activation/{sample_token}/")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 404:  # Expected for invalid token
            print("✅ Activation user endpoint: WORKING (404 for invalid token)")
        else:
            print("⚠️  Activation user endpoint: UNEXPECTED RESPONSE")
            
    except Exception as e:
        print(f"❌ Activation user endpoint: ERROR - {e}")
    
    print()

def test_login_endpoint():
    """Test login endpoint"""
    print("=" * 50)
    print("TESTING LOGIN ENDPOINT")
    print("=" * 50)
    
    login_data = {
        "email": "csu.aiml@gmail.com",
        "password": "CSUvapt--0011**"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login: SUCCESS")
            print(f"   Access Token: {data.get('access', 'N/A')[:20]}...")
            print(f"   Refresh Token: {data.get('refresh', 'N/A')[:20]}...")
            print(f"   User Role: {data.get('user', {}).get('role', 'N/A')}")
            return data.get('access')  # Return token for further tests
        else:
            print(f"❌ Login: FAILED - {response.json()}")
            
    except Exception as e:
        print(f"❌ Login: ERROR - {e}")
    
    return None

def test_user_management_with_token(token):
    """Test user management endpoints with authentication"""
    if not token:
        print("❌ No token available for user management tests")
        return
    
    print("=" * 50)
    print("TESTING USER MANAGEMENT ENDPOINTS")
    print("=" * 50)
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test getting user list
    print("1. Testing user list endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/users/", headers=headers)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            users = response.json()
            print(f"✅ User list: SUCCESS - {len(users)} users found")
            for user in users[:3]:  # Show first 3 users
                print(f"   - {user.get('email')} ({user.get('role')})")
        else:
            print(f"❌ User list: FAILED - {response.json()}")
            
    except Exception as e:
        print(f"❌ User list: ERROR - {e}")
    
    print()

def test_api_endpoints():
    """Test all API endpoints"""
    print("VAPT Dashboard - API Email Functionality Test")
    print("=" * 60)
    
    # Test login first to get token
    token = test_login_endpoint()
    
    # Test other endpoints
    test_password_reset_flow()
    test_activation_endpoints()
    
    if token:
        test_user_management_with_token(token)
    
    print("=" * 60)
    print("API testing completed!")
    print()
    print("Next steps:")
    print("1. Configure email credentials in .env file")
    print("2. Test actual email sending")
    print("3. Test frontend integration")
    print("4. Verify activation links work in browser")

if __name__ == "__main__":
    test_api_endpoints()
