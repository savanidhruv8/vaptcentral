# VAPT Dashboard - Complete Full Stack Application

A comprehensive full-stack web application for managing VAPT (Vulnerability Assessment and Penetration Testing) activities with Excel file processing, data visualization, and analytics.

## 🚀 Complete Implementation

### ✅ Backend (Django REST API)
- **Location**: `./backend/`
- **Technology**: Django 4.2.7 with DRF
- **Features**: Excel processing, REST APIs, KPI calculations, Admin interface
- **Server**: http://127.0.0.1

### ✅ Frontend (React with Vite)
- **Location**: `./frontend/`
- **Technology**: React + Vite + Tailwind CSS
- **Features**: Dashboard, file upload, data tables, analytics charts
- **Server**: http://localhost:5173

## 🏃‍♂️ Quick Start

### 1. Start Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8001
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Access Application
- **Dashboard**: http://localhost:5173
- **API**: http://127.0.0.1:8001/api
- **Admin**: http://127.0.0.1:8001/admin (admin/admin123)

## 📊 Features Implemented

### Dashboard & Analytics
- Real-time statistics and KPIs
- Interactive charts (pie, bar, line charts)
- Vulnerability trend analysis
- Color-coded severity indicators

### File Processing
- Drag & drop Excel file upload
- Automatic sheet detection and processing
- Support for Proposal, Scope, and VAPT Results sheets
- Data validation and error handling

### Data Management
- Filterable data tables
- CRUD operations for all entities
- Advanced search and filtering
- Export functionality

### User Interface
- Modern, responsive design
- Professional navigation
- Loading states and error handling
- Mobile-friendly interface

## 📁 Project Structure

```
VAPTCENTRAL/
├── backend/                    # Django Backend
│   ├── vapt_dashboard/        # Main Django project
│   ├── vapt_core/            # Core app with models, views, APIs
│   ├── requirements.txt      # Python dependencies
│   ├── db.sqlite3           # SQLite database
│   └── API_DOCUMENTATION.md # Complete API docs
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API service layer
│   │   └── App.jsx          # Main app component
│   ├── package.json         # Node dependencies
│   └── tailwind.config.js   # Tailwind configuration
└── README.md                # This file
```

## 🛠️ Technology Stack

### Backend
- **Django 4.2.7** - Web framework
- **Django REST Framework** - API development
- **pandas + openpyxl** - Excel processing
- **SQLite** - Database
- **CORS Headers** - Cross-origin support

### Frontend
- **React** - Frontend framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Hero Icons** - Icon library

## 📈 Key Features

### Excel Processing Engine
- Automatically detects and processes multiple sheet types
- Handles various column name formats and data types
- Generates KPIs and analytics automatically
- Error handling and validation

### REST API Endpoints
- Full CRUD operations for all data types
- Advanced filtering and search capabilities
- Analytics and dashboard endpoints
- File upload and processing APIs

### Interactive Dashboard
- Real-time data visualization
- Responsive charts and graphs
- Filterable data tables
- Professional UI/UX design

## 🧪 Testing

### Sample Data
The backend includes a test data generator (`backend/test_vapt_data.py`) that creates sample Excel files with:
- 3 Proposals with different domains and stakeholders
- 3 Scopes with various impact levels
- 3 Vulnerability results with different criticality levels

### Upload Testing
1. Run `python test_vapt_data.py` in the backend directory
2. Upload the generated `test_vapt_data.xlsx` through the frontend
3. Explore the dashboard, tables, and analytics

## 🎯 Production Ready Features

### Security
- CORS configuration
- Input validation
- SQL injection protection
- File upload validation

### Performance
- Efficient database queries
- Optimized frontend bundle
- Lazy loading components
- Error boundaries

### Scalability
- Modular component architecture
- RESTful API design
- Efficient data processing
- Responsive design patterns

## 📖 Documentation

- **Backend API**: `./backend/API_DOCUMENTATION.md`
- **Backend Setup**: `./backend/README.md`
- **Frontend Guide**: `./frontend/README.md`

## 🚦 Current Status

Both backend and frontend are **fully functional** and **running successfully**:

- ✅ Django backend server running on port 8001
- ✅ React frontend server running on port 5173
- ✅ API integration working correctly
- ✅ File upload and processing functional
- ✅ All dashboard features operational
- ✅ Charts and analytics displaying data
- ✅ Data tables with filtering working

## 🔧 Next Steps for Production

1. **Database**: Switch from SQLite to PostgreSQL/MySQL
2. **Authentication**: Implement user authentication and authorization
3. **Deployment**: Set up production deployment (Docker, AWS, etc.)
4. **Monitoring**: Add logging and monitoring
5. **Testing**: Add comprehensive test suites
6. **Security**: Implement production security measures

The application is now ready for development, testing, and can be easily deployed to production with the suggested enhancements.

---

**🎉 Full Stack VAPT Dashboard Successfully Implemented!**
