# Email Configuration Guide for VAPT Dashboard

## Current Email Test Results

✅ **Email Functionality Working:**
- User activation tokens generated correctly
- Password reset OTP codes generated correctly  
- Email templates created properly
- Activation URLs generated correctly

❌ **Email Sending Issue:**
- Gmail SMTP authentication required
- Need to configure app password for Gmail

## How to Fix Email Sending

### 1. Enable Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security" → "2-Step Verification"
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password

### 2. Update Environment Variables

Create a `.env` file in the `backend` directory with:

```env
# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=csu.aiml@gmail.com
EMAIL_HOST_PASSWORD=your-16-character-app-password
DEFAULT_FROM_EMAIL=csu.aiml@gmail.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Test Email Functionality

After updating the `.env` file, run:

```bash
python test_email_functionality.py
```

## Email Features Tested

### ✅ User Activation Email
- **Purpose**: Sent when super admin creates a new user
- **Content**: Welcome message + activation link
- **Link**: `http://localhost:5173/activate/{token}/`
- **Expiry**: 24 hours

### ✅ Password Reset Email  
- **Purpose**: Sent when user requests password reset
- **Content**: OTP code for verification
- **OTP**: 6-digit code
- **Expiry**: 10 minutes

### ✅ Email Templates
- **Activation Subject**: "VAPT Dashboard - Account Activation for {Name}"
- **Reset Subject**: "VAPT Dashboard - Password Reset for {Name}"
- **Professional formatting** with user details

## Test Results Summary

| Feature | Status | Details |
|---------|--------|---------|
| Email Configuration | ✅ Working | SMTP settings correct |
| Activation Tokens | ✅ Generated | UUID format, 24h expiry |
| OTP Codes | ✅ Generated | 6-digit, 10min expiry |
| Email Templates | ✅ Created | Professional formatting |
| SMTP Authentication | ❌ Needs Setup | App password required |

## Next Steps

1. **Set up Gmail app password** (see instructions above)
2. **Update .env file** with credentials
3. **Re-run email tests** to verify sending
4. **Test activation links** in browser
5. **Test OTP verification** in frontend

## Alternative Email Services

If Gmail doesn't work, you can use:
- **SendGrid**: Free tier available
- **Mailgun**: Free tier available  
- **AWS SES**: Low cost, reliable
- **Outlook/Hotmail**: Similar setup to Gmail

## Testing Commands

```bash
# Test email functionality
python test_email_functionality.py

# Create test user for manual testing
python manage.py shell
```

```python
# In Django shell
from django.contrib.auth import get_user_model
User = get_user_model()

# Create test user
user = User.objects.create_user(
    username='testuser',
    email='test@example.com',
    password='testpass123',
    first_name='Test',
    last_name='User',
    role='general_user'
)

# Send activation email
user.send_activation_email()

# Send password reset email  
user.send_password_reset_email()
```
