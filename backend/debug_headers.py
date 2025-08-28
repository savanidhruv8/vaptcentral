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

print("=== ANALYZING COLUMN HEADERS FOR PROPOSALS AND SCOPES ===")

# Get the Excel file with processed VAPT data
upload = ExcelUpload.objects.get(id=2)  # The one with 94 VAPT results
print(f"Analyzing: {upload.file.name}")

try:
    excel_file = pd.ExcelFile(upload.file.path)
    
    for sheet_name in excel_file.sheet_names:
        print(f"\n=== SHEET: {sheet_name} ===")
        sheet_name_lower = sheet_name.lower()
        
        # Check if this could be a proposal or scope sheet
        if 'proposal' in sheet_name_lower:
            print(">>> This is a PROPOSAL sheet")
            category = "PROPOSAL"
        elif 'scope' in sheet_name_lower:
            print(">>> This is a SCOPE sheet")
            category = "SCOPE"
        else:
            print(">>> Category: OTHER")
            continue
            
        # Read the sheet to analyze headers
        try:
            df = pd.read_excel(upload.file.path, sheet_name=sheet_name)
            print(f"Total rows: {len(df)}")
            print(f"Total columns: {len(df.columns)}")
            
            print("\n--- RAW COLUMN HEADERS ---")
            for i, col in enumerate(df.columns):
                print(f"{i}: '{col}'")
            
            print("\n--- FIRST FEW ROWS (to find real headers) ---")
            for idx in range(min(10, len(df))):
                row_data = []
                for col in df.columns[:8]:  # Show first 8 columns only
                    cell_value = df.iloc[idx][col]
                    if pd.notna(cell_value) and str(cell_value).strip():
                        row_data.append(f"'{str(cell_value).strip()}'")
                    else:
                        row_data.append("''")
                print(f"Row {idx}: {' | '.join(row_data)}")
            
            print(f"\n--- LOOKING FOR KEY HEADER PATTERNS ---")
            # Look for rows that might contain actual headers
            for idx in range(min(15, len(df))):
                row_values = []
                for col in df.columns:
                    cell_value = df.iloc[idx][col]
                    if pd.notna(cell_value):
                        val = str(cell_value).strip().lower()
                        if any(keyword in val for keyword in [
                            's.no', 'domain', 'testing', 'methodology', 'deliverable', 
                            'dependency', 'stakeholder', 'scope', 'penetration'
                        ]):
                            row_values.append(f"'{cell_value}'")
                        elif val and len(val) > 1:
                            row_values.append(f"'{cell_value}'")
                
                if len(row_values) >= 3:  # If we found multiple potential headers
                    print(f"Potential header row {idx}: {' | '.join(row_values)}")
            
        except Exception as e:
            print(f"Error reading sheet: {e}")

except Exception as e:
    print(f"Error processing file: {e}")

print("\n=== CURRENT PROCESSOR LOGIC ===")
print("Looking for these patterns:")
print("PROPOSALS: 'proposal' in sheet name")
print("SCOPES: 'scope' in sheet name") 
print("VAPT: 'vapt' or 'result' in sheet name")