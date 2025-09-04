# Frontend and Backend Server Status

## ✅ **Servers Running**

### **Backend Server**
- **URL**: http://127.0.0.1:8000
- **Status**: ✅ Running
- **API Endpoints**: Available at http://127.0.0.1:8000/api/

### **Frontend Server**
- **URL**: http://localhost:5173
- **Status**: ✅ Running
- **React App**: Available at http://localhost:5173

## 🔗 **Testing Email Links**

Now you can test the email links you received:

### **1. Account Activation Link**
- **URL Format**: `http://localhost:5173/activate/{token}/`
- **Example**: `http://localhost:5173/activate/a3b7eae7-4d7c-4bbd-b64f-866e1e3aa7dc/`
- **What to expect**: Account activation page where you can set your password

### **2. Password Reset Flow**
- **Step 1**: Go to http://localhost:5173/login
- **Step 2**: Click "Forgot your password?"
- **Step 3**: Enter your email address
- **Step 4**: Check email for OTP code
- **Step 5**: Enter OTP and set new password

## 🧪 **Test the Complete Flow**

### **Option 1: Test with Existing Super Admin**
1. Go to http://localhost:5173
2. Login with:
   - Email: `csu.aiml@gmail.com`
   - Password: `CSUvapt--0011**`
3. Navigate to "User Management"
4. Create a new user
5. Check email for activation link

### **Option 2: Test Password Reset**
1. Go to http://localhost:5173/login
2. Click "Forgot your password?"
3. Enter `csu.aiml@gmail.com`
4. Check email for OTP
5. Complete password reset

## 📧 **Email Links Should Now Work**

The activation and password reset components are now accessible at:
- **Activation**: http://localhost:5173/activate/{token}/
- **Login**: http://localhost:5173/login
- **Dashboard**: http://localhost:5173 (after login)

## 🔍 **Troubleshooting**

If the links still don't work:

1. **Check if frontend is running**: Visit http://localhost:5173
2. **Check if backend is running**: Visit http://127.0.0.1:8000/admin/
3. **Verify email tokens**: Check that tokens haven't expired (24h for activation, 10min for OTP)
4. **Check browser console**: Look for any JavaScript errors

## 🎯 **Expected Behavior**

### **Activation Link**
- Should show "Activate Your Account" page
- Should display user's name
- Should have password and confirm password fields
- Should redirect to login after successful activation

### **Password Reset**
- Should show "Reset Password" form
- Should have email input → OTP input → new password fields
- Should redirect to login after successful reset
