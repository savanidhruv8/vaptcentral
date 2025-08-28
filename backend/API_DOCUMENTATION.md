# VAPT Dashboard Backend API Documentation

## Base URL
```
http://127.0.0.1:8001
```

## Authentication
Currently, all APIs are accessible without authentication (for development purposes).

## API Endpoints

### 1. Excel Upload Management

#### Upload Excel File
- **URL**: `/api/excel-uploads/`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Body**: 
  - `file`: Excel file containing VAPT data
- **Response**: Upload details and processing results
- **Example**:
```bash
curl -X POST http://127.0.0.1:8001/api/excel-uploads/ \
  -F "file=@test_vapt_data.xlsx"
```

#### List Uploads
- **URL**: `/api/excel-uploads/`
- **Method**: `GET`
- **Response**: List of all uploaded files

#### Reprocess Upload
- **URL**: `/api/excel-uploads/{id}/reprocess/`
- **Method**: `POST`
- **Response**: Reprocessing results

### 2. Proposals

#### List Proposals
- **URL**: `/api/proposals/`
- **Method**: `GET`
- **Query Parameters**:
  - `excel_upload`: Filter by upload ID
  - `year`: Filter by last tested year
  - `stakeholder`: Filter by stakeholder name
- **Example**:
```bash
curl "http://127.0.0.1:8001/api/proposals/?year=2024-25"
```

#### Get Proposal
- **URL**: `/api/proposals/{id}/`
- **Method**: `GET`

#### Create Proposal
- **URL**: `/api/proposals/`
- **Method**: `POST`
- **Body**: Proposal data in JSON format

#### Update Proposal
- **URL**: `/api/proposals/{id}/`
- **Method**: `PUT/PATCH`

#### Delete Proposal
- **URL**: `/api/proposals/{id}/`
- **Method**: `DELETE`

### 3. Scopes

#### List Scopes
- **URL**: `/api/scopes/`
- **Method**: `GET`
- **Query Parameters**:
  - `excel_upload`: Filter by upload ID
  - `impact`: Filter by impact level
  - `year`: Filter by last tested year
  - `stakeholder`: Filter by stakeholder name

#### Get Scope
- **URL**: `/api/scopes/{id}/`
- **Method**: `GET`

#### Create/Update/Delete Scope
- Similar to Proposals endpoints

### 4. VAPT Results

#### List VAPT Results
- **URL**: `/api/vapt-results/`
- **Method**: `GET`
- **Query Parameters**:
  - `excel_upload`: Filter by upload ID
  - `criticality`: Filter by criticality level
  - `environment`: Filter by tested environment
  - `result`: Filter by test result
- **Example**:
```bash
curl "http://127.0.0.1:8001/api/vapt-results/?criticality=HIGH"
```

#### Get VAPT Result
- **URL**: `/api/vapt-results/{id}/`
- **Method**: `GET`

#### Create/Update/Delete VAPT Result
- Similar to other endpoints

### 5. KPI Metrics

#### List KPI Metrics
- **URL**: `/api/kpi-metrics/`
- **Method**: `GET`
- **Query Parameters**:
  - `excel_upload`: Filter by upload ID

#### Get KPI Metrics
- **URL**: `/api/kpi-metrics/{id}/`
- **Method**: `GET`

### 6. Analytics & Dashboard

#### Dashboard Statistics
- **URL**: `/api/dashboard-stats/`
- **Method**: `GET`
- **Response**: Overall statistics and recent uploads
- **Example Response**:
```json
{
  "total_uploads": 1,
  "total_proposals": 3,
  "total_scopes": 3,
  "total_vulnerabilities": 3,
  "critical_vulnerabilities": 0,
  "high_vulnerabilities": 2,
  "recent_uploads": [...]
}
```

#### Vulnerability Analytics
- **URL**: `/api/vulnerability-analytics/`
- **Method**: `GET`
- **Query Parameters**:
  - `excel_upload`: Filter by upload ID
- **Response**: Vulnerability statistics by criticality, environment, result, and trends
- **Example Response**:
```json
{
  "by_criticality": {"HIGH": 2, "MEDIUM": 1},
  "by_environment": {"PRODUCTION": 1, "STAGING": 1, "DEVELOPMENT": 1},
  "by_result": {"FAIL": 3},
  "trend_data": {"Jul 2025": 3, "Jun 2025": 0, ...}
}
```

#### Timeline Analysis
- **URL**: `/api/timeline-analysis/`
- **Method**: `GET`
- **Query Parameters**:
  - `excel_upload`: Filter by upload ID
- **Response**: Timeline analysis and overdue items

#### Export Data
- **URL**: `/api/export-data/`
- **Method**: `GET`
- **Query Parameters**:
  - `type`: Data type to export (`proposals`, `scopes`, `vapt_results`, `all`)
  - `excel_upload`: Filter by upload ID
- **Example**:
```bash
curl "http://127.0.0.1:8001/api/export-data/?type=proposals"
```

## Excel File Format

The system expects Excel files with the following sheets:

### 1. Proposal Sheet (named "Proposal" or contains "proposal")
Required columns:
- S.No / S_No
- Domain
- Different Avenues of the testing scope
- Overview of the methodology
- Key Dilevirables / Key Deliverables
- Key Dependencies
- Est.testdate
- Est.startdate
- Timeline of testing
- Timeline of remediation
- Stake holder / Stakeholder
- Last tested year
- Requirement statements

### 2. Scope Sheet (named "Scope" or contains "scope")
Required columns:
- S.No / S_No
- Penetration testing
- Description
- Key Dilevirables / Key Deliverables
- Key Dependencies
- Est.testdate
- Est.startdate
- Timeline of testing
- Timeline of remediation
- Stake holder / Stakeholder
- Last tested year
- Requirement statements
- Impact of these tests

### 3. VAPT Results Sheet (named "VAPT Results" or contains "vapt" or "result")
Required columns:
- Vulnerabilities ID / Vulnerability ID
- Name of vulnerability
- Description
- Tested environment
- Result
- Reporting evidence
- Source of identifcation / Source of identification
- Criticiality based on CVSS score
- Criticiality based on business context
- Stake holders / Stakeholders
- Remarks from stakeholders

## Response Formats

All responses are in JSON format. Error responses include:
```json
{
  "error": "Error description"
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

## Models

### ExcelUpload
- id: Integer
- file: File path
- uploaded_at: DateTime
- processed: Boolean
- processed_at: DateTime

### Proposal
- id: Integer
- excel_upload: Foreign Key
- s_no: Integer
- domain: String
- testing_scope_avenues: Text
- methodology_overview: Text
- key_deliverables: Text
- key_dependencies: Text
- est_test_date: Date
- est_start_date: Date
- testing_timeline: String
- remediation_timeline: String
- stakeholder: String
- last_tested_year: String (choices: 2024-25, 2025-26)
- requirement_statements: Text
- created_at: DateTime
- updated_at: DateTime

### Scope
- Similar to Proposal with additional:
- penetration_testing: String
- impact_of_tests: String (choices: LOW, MEDIUM, HIGH, CRITICAL)

### VaptResult
- id: Integer
- excel_upload: Foreign Key
- vulnerability_id: String (unique)
- vulnerability_name: String
- description: Text
- tested_environment: String (choices: PRODUCTION, STAGING, DEVELOPMENT, UAT)
- result: String (choices: PASS, FAIL, NOT_APPLICABLE, PARTIAL)
- reporting_evidence: Text
- source_of_identification: String
- cvss_criticality: String (choices: LOW, MEDIUM, HIGH, CRITICAL)
- business_criticality: String (choices: LOW, MEDIUM, HIGH, CRITICAL)
- stakeholders: String
- stakeholder_remarks: Text
- created_at: DateTime
- updated_at: DateTime

### KPIMetrics
- id: Integer
- excel_upload: OneToOne Foreign Key
- total_proposals: Integer
- proposals_by_year: JSON
- total_scopes: Integer
- scopes_by_impact: JSON
- scopes_by_year: JSON
- total_vulnerabilities: Integer
- vulnerabilities_by_criticality: JSON
- vulnerabilities_by_environment: JSON
- vulnerabilities_by_result: JSON
- avg_testing_timeline: Float
- avg_remediation_timeline: Float
- calculated_at: DateTime

## Testing

The backend has been tested with all endpoints and functionality working correctly. Use the provided test Excel file for testing uploads and processing.

## Admin Interface

Access the Django admin interface at:
```
http://127.0.0.1:8001/admin/
```

Default credentials:
- Username: admin
- Password: admin123

## Next Steps

1. Implement authentication and authorization
2. Add pagination for large datasets
3. Implement caching for analytics endpoints
4. Add API rate limiting
5. Create comprehensive frontend integration
6. Add more detailed validation and error handling
7. Implement background task processing for large files
8. Add audit logging