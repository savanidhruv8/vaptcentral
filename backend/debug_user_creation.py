import requests
import json

# Test user creation API
BASE_URL = "http://127.0.0.1:8000/api"

def test_user_creation():
    """Test the user creation endpoint"""
    
    # First, login as super admin to get token
    login_data = {
        "email": "csu.aiml@gmail.com",
        "password": "CSUvapt--0011**"
    }
    
    print("1. Logging in as super admin...")
    login_response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
    
    if login_response.status_code != 200:
        print(f"Login failed: {login_response.status_code}")
        print(f"Response: {login_response.text}")
        return
    
    login_data = login_response.json()
    token = login_data['access']
    user = login_data['user']
    
    print(f"Login successful. User role: {user['role']}")
    
    # Test user creation data
    user_data = {
        "username": "testuser123",
        "email": "testuser123@example.com",
        "first_name": "Test",
        "last_name": "User",
        "company_name": "Test Company",
        "contact": "1234567890",
        "role": "general_user"
    }
    
    print(f"\n2. Creating user with data: {json.dumps(user_data, indent=2)}")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    create_response = requests.post(f"{BASE_URL}/users/", json=user_data, headers=headers)
    
    print(f"Response status: {create_response.status_code}")
    print(f"Response headers: {dict(create_response.headers)}")
    print(f"Response body: {create_response.text}")
    
    if create_response.status_code == 201:
        print("✅ User creation successful!")
        created_user = create_response.json()
        print(f"Created user: {json.dumps(created_user, indent=2)}")
    else:
        print("❌ User creation failed!")
        try:
            error_data = create_response.json()
            print(f"Error details: {json.dumps(error_data, indent=2)}")
        except:
            print(f"Raw error: {create_response.text}")

if __name__ == "__main__":
    test_user_creation()
