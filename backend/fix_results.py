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

from vapt_core.models import ExcelUpload, VaptResult

print("=== FIXING VULNERABILITY RESULTS ===")

upload = ExcelUpload.objects.get(id=2)
print(f"Processing: {upload.file.name}")

# Read the Excel sheet to get correct results
df = pd.read_excel(upload.file.path, sheet_name="VAPT Results (2024-25)")

# Create mapping of vulnerability ID to correct result
result_mapping = {}
for _, row in df.iterrows():
    vuln_id = row.get('Vulnerbaility ID', '')
    result = row.get('Result', '')
    if pd.notna(vuln_id) and pd.notna(result):
        result_mapping[str(vuln_id).strip()] = str(result).strip()

print(f"Found {len(result_mapping)} result mappings")

# Update database records
updated_count = 0
for vuln in VaptResult.objects.filter(excel_upload=upload):
    if vuln.vulnerability_id in result_mapping:
        correct_result = result_mapping[vuln.vulnerability_id]
        if vuln.result != correct_result:
            print(f"Updating {vuln.vulnerability_id}: '{vuln.result}' -> '{correct_result}'")
            vuln.result = correct_result
            vuln.save()
            updated_count += 1

print(f"\nUpdated {updated_count} vulnerability results")

# Show updated statistics
print("\n=== UPDATED RESULT COUNTS ===")
from django.db.models import Count
result_counts = VaptResult.objects.values('result').annotate(count=Count('result'))
for item in result_counts:
    print(f"{item['result']}: {item['count']}")

print("\n=== SAMPLE UPDATED DATA ===")
for vuln in VaptResult.objects.all()[:5]:
    print(f"{vuln.vulnerability_id}: {vuln.result}")