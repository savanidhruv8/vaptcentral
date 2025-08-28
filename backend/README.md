# VAPT Dashboard Backend

A Django REST API backend for managing VAPT (Vulnerability Assessment and Penetration Testing) dashboard data.

## Features

- ✅ Excel file upload and processing
- ✅ Automatic data extraction from multiple sheets (Proposals, Scopes, VAPT Results)
- ✅ RESTful APIs for all data operations
- ✅ KPI calculation and metrics
- ✅ Analytics and dashboard statistics
- ✅ Data filtering and search
- ✅ Export functionality
- ✅ Admin interface for data management

## Project Structure

```
backend/
├── manage.py
├── requirements.txt
├── vapt_dashboard/          # Main project settings
│   ├── settings.py
│   ├── urls.py
│   └── ...
├── vapt_core/              # Core application
│   ├── models.py           # Database models
│   ├── views.py            # API views
│   ├── serializers.py      # API serializers
│   ├── utils.py            # Excel processing utilities
│   ├── urls.py             # URL routing
│   └── admin.py            # Admin interface
├── media/                  # Uploaded files
└── db.sqlite3             # SQLite database
```

## Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Create Superuser
```bash
python manage.py createsuperuser
```

### 4. Start Development Server
```bash
python manage.py runserver 127.0.0.1:8001
```

### 5. Test the API
```bash
# Check if server is running
curl http://127.0.0.1:8001/api/dashboard-stats/

# Upload test file
curl -X POST http://127.0.0.1:8001/api/excel-uploads/ \
  -F "file=@test_vapt_data.xlsx"
```

## API Endpoints

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API documentation.

### Key Endpoints:
- `POST /api/excel-uploads/` - Upload Excel files
- `GET /api/dashboard-stats/` - Dashboard statistics
- `GET /api/proposals/` - Proposal data
- `GET /api/scopes/` - Scope data
- `GET /api/vapt-results/` - Vulnerability results
- `GET /api/vulnerability-analytics/` - Analytics data
- `GET /api/export-data/` - Export functionality

## Excel File Format

The system processes Excel files with three main sheets:

1. **Proposal Sheet** - Testing proposals and planning
2. **Scope Sheet** - Testing scope definitions
3. **VAPT Results Sheet** - Vulnerability findings and results

See the API documentation for detailed column specifications.

## Database Models

- **ExcelUpload** - Tracks uploaded files
- **Proposal** - Proposal data from Excel
- **Scope** - Scope data from Excel
- **VaptResult** - Vulnerability results from Excel
- **KPIMetrics** - Calculated metrics and KPIs

## Testing

Run the test Excel file creator:
```bash
python test_vapt_data.py
```

This creates a sample Excel file with test data that can be uploaded through the API.

## Features Implemented

### Excel Processing
- Automatic sheet detection and processing
- Column name normalization
- Data type conversion and validation
- Error handling and reporting

### APIs
- Full CRUD operations for all models
- Advanced filtering and search
- Pagination support
- Export functionality
- Analytics endpoints

### KPI Calculations
- Vulnerability statistics by criticality
- Environment-wise distribution
- Timeline analysis
- Trend data calculation

### Admin Interface
- Full data management capabilities
- File upload tracking
- Search and filtering
- Bulk operations

## Performance Considerations

- Efficient Excel processing with pandas
- Database indexing for key fields
- Optimized query patterns
- JSON field usage for flexible metrics storage

## Security Features

- File upload validation
- SQL injection protection
- CSRF protection
- CORS configuration for frontend integration

## Development Notes

### Current Configuration
- SQLite database for development
- Debug mode enabled
- CORS configured for localhost:3000
- Media files served by Django

### Production Considerations
- Switch to PostgreSQL or MySQL
- Configure proper media file serving
- Enable security features
- Add authentication and authorization
- Implement caching
- Add logging and monitoring

## API Testing Examples

```bash
# Get dashboard stats
curl http://127.0.0.1:8001/api/dashboard-stats/

# Filter vulnerabilities by criticality
curl "http://127.0.0.1:8001/api/vapt-results/?criticality=HIGH"

# Export all proposals
curl "http://127.0.0.1:8001/api/export-data/?type=proposals"

# Get vulnerability analytics
curl http://127.0.0.1:8001/api/vulnerability-analytics/
```

## Error Handling

The API provides detailed error messages and appropriate HTTP status codes:
- 400: Bad Request (validation errors)
- 404: Not Found
- 500: Internal Server Error

## Next Steps

1. **Frontend Integration** - Create React/Vue.js frontend
2. **Authentication** - Implement JWT or session-based auth
3. **File Processing** - Add background task processing
4. **Notifications** - Add email/webhook notifications
5. **Reporting** - Generate PDF reports
6. **Visualization** - Enhanced charts and graphs
7. **Multi-tenancy** - Support multiple organizations
8. **Audit Logging** - Track all changes

## Support

For issues or questions, refer to the API documentation or check the Django admin interface for data management.