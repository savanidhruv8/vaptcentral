# VAPT Dashboard - User Management System Setup

This document provides comprehensive setup instructions for the VAPT Dashboard with the new user management system.

## Features Implemented

### 🔐 Authentication System
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (Super Admin, Admin, General User)
- **Account activation** via email verification
- **Password reset** with OTP validation
- **Secure login/logout** functionality

### 👥 User Management (Super Admin Only)
- **Create new users** with profile information
- **Promote/demote users** between roles
- **Activate/deactivate** user accounts
- **Edit user profiles** and information
- **Delete users** (except self)
- **View all users** with role and status indicators

### 🎯 Role-Based Permissions
- **Super Admin**: Full access to all features including user management
- **Admin**: Can upload files and access all dashboard features
- **General User**: Can view data but cannot upload files

### 📧 Email Integration
- **Account activation emails** sent when users are created
- **Password reset emails** with OTP codes
- **SMTP configuration** for email delivery

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Database Migration

```bash
# Create and apply migrations for the new user model
python manage.py makemigrations
python manage.py migrate
```

### 3. Create Super Admin User

```bash
# Interactive creation
python manage.py create_super_admin

# Or with parameters
python manage.py create_super_admin --username admin --email admin@example.com --password admin123 --first-name Admin --last-name User
```

### 4. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Django Settings
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite by default)
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3

# Email Configuration (Required for user activation and password reset)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@vaptdashboard.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
CORS_ALLOW_CREDENTIALS=True
```

### 5. Start Backend Server

```bash
python manage.py runserver
```

The backend will be available at `http://127.0.0.1:8000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### 3. Start Frontend Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage Guide

### 1. Initial Login

1. Navigate to `http://localhost:5173`
2. You'll be redirected to the login page
3. Use the super admin credentials created in step 3 of backend setup
4. After successful login, you'll see the dashboard

### 2. User Management (Super Admin Only)

1. Click on "User Management" in the sidebar
2. **Create User**: Click "Create User" button and fill in the form
   - User will receive an activation email
   - They must activate their account before logging in
3. **Promote User**: Click the promote button to make a general user an admin
4. **Activate/Deactivate**: Toggle user account status
5. **Edit User**: Click the edit button to modify user information
6. **Delete User**: Remove users (cannot delete yourself)

### 3. Role-Based Access

- **Super Admin**: Can access all features including user management
- **Admin**: Can upload files and view all data
- **General User**: Can view data but upload button is hidden

### 4. Account Activation Flow

1. Super admin creates a user
2. User receives an activation email with a link
3. User clicks the link and sets their password
4. User can now log in with their credentials

### 5. Password Reset Flow

1. User clicks "Forgot your password?" on login page
2. User enters their email address
3. User receives an OTP code via email
4. User enters the OTP code
5. User sets a new password
6. User can log in with the new password

## API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile
- `POST /api/auth/token/refresh/` - Refresh JWT token

### User Management (Super Admin Only)
- `GET /api/users/` - List all users
- `POST /api/users/` - Create new user
- `PUT /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user
- `POST /api/users/{id}/promote/` - Promote user to admin
- `POST /api/users/{id}/demote/` - Demote admin to general user
- `POST /api/users/{id}/activate/` - Activate user
- `POST /api/users/{id}/deactivate/` - Deactivate user

### Password Reset
- `POST /api/auth/password-reset/` - Request password reset
- `POST /api/auth/verify-otp/` - Verify OTP
- `POST /api/auth/reset-password/` - Reset password

### Account Activation
- `GET /api/auth/activation/{token}/` - Get activation user details
- `POST /api/auth/activate/{token}/` - Activate account

## Security Features

- **JWT tokens** with automatic refresh
- **Role-based permissions** enforced on both frontend and backend
- **Email verification** for account activation
- **OTP-based password reset** for security
- **Token expiration** and blacklisting
- **CORS protection** configured
- **Password validation** using Django's built-in validators

## Troubleshooting

### Common Issues

1. **Email not sending**: Check SMTP configuration in `.env` file
2. **CORS errors**: Verify CORS settings in Django settings
3. **Token expiration**: Tokens automatically refresh, but check JWT settings
4. **User creation fails**: Ensure all required fields are provided
5. **Activation link not working**: Check FRONTEND_URL in backend settings

### Debug Mode

Set `DJANGO_DEBUG=True` in the backend `.env` file for detailed error messages.

## Production Deployment

For production deployment:

1. Set `DJANGO_DEBUG=False`
2. Use a production database (PostgreSQL recommended)
3. Configure proper email service (SendGrid, AWS SES, etc.)
4. Set up proper CORS origins
5. Use environment variables for all sensitive data
6. Enable HTTPS
7. Set up proper logging and monitoring

## Support

For issues or questions, please check the troubleshooting section or contact the development team.
