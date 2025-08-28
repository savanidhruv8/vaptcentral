#!/usr/bin/env python
import os
import sys
import django
import pandas as pd

# Add the project directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vapt_dashboard.settings')
django.setup()

from vapt_core.models import ExcelUpload

print("=== DEBUGGING EXCEL FILE PROCESSING ===")

# Get the most recent Excel upload that has 0 results
problem_uploads = ExcelUpload.objects.filter(
    file__icontains='.xlsx'
).exclude(
    file__icontains='test_'
)

for upload in problem_uploads:
    print(f"\n=== ANALYZING UPLOAD {upload.id}: {upload.file.name} ===")
    
    try:
        if upload.file and os.path.exists(upload.file.path):
            print(f"File exists at: {upload.file.path}")
            
            # Try to read the Excel file
            excel_file = pd.ExcelFile(upload.file.path)
            
            print(f"Sheet names: {excel_file.sheet_names}")
            
            # Check each sheet
            for sheet_name in excel_file.sheet_names:
                print(f"\n--- Sheet: {sheet_name} ---")
                sheet_name_lower = sheet_name.lower()
                
                # Check what category this sheet would fall into
                if 'proposal' in sheet_name_lower:
                    category = "PROPOSAL"
                elif 'scope' in sheet_name_lower:
                    category = "SCOPE" 
                elif 'vapt' in sheet_name_lower or 'result' in sheet_name_lower:
                    category = "VAPT_RESULTS"
                else:
                    category = "UNKNOWN"
                
                print(f"Category: {category}")
                
                try:
                    # Read the sheet
                    df = pd.read_csv if upload.file.path.endswith('.csv') else pd.read_excel
                    sheet_data = pd.read_excel(upload.file.path, sheet_name=sheet_name)
                    
                    print(f"Rows: {len(sheet_data)}")
                    print(f"Columns: {list(sheet_data.columns)}")
                    
                    # Show first few non-empty rows
                    non_empty = sheet_data.dropna(how='all')
                    if len(non_empty) > 0:
                        print(f"First few rows (non-empty): {len(non_empty)}")
                        print(non_empty.head(2).to_string())
                    else:
                        print("No non-empty rows found")
                        
                except Exception as e:
                    print(f"Error reading sheet {sheet_name}: {e}")
                    
        else:
            print(f"File does not exist: {upload.file.path}")
            
    except Exception as e:
        print(f"Error processing upload {upload.id}: {e}")

print("\n=== CHECKING FOR VULNERABILITY SHEET PATTERNS ===")
print("Looking for sheets that might contain vulnerabilities but weren't detected...")