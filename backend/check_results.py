#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vapt_dashboard.settings')
django.setup()

from vapt_core.models import VaptResult

print("=== CHECKING VULNERABILITY RESULT VALUES ===")

# Get unique result values
results = VaptResult.objects.values_list('result', flat=True).distinct()
print(f"Unique result values: {list(results)}")

# Get sample data
print("\n=== SAMPLE VULNERABILITY DATA ===")
for vuln in VaptResult.objects.all()[:5]:
    print(f"ID: {vuln.vulnerability_id}")
    print(f"  Name: {vuln.vulnerability_name}")
    print(f"  Result: '{vuln.result}'")
    print(f"  Environment: {vuln.tested_environment}")
    print(f"  CVSS: {vuln.cvss_criticality}")
    print(f"  Business: {vuln.business_criticality}")
    print()

print("=== RESULT VALUE COUNTS ===")
from django.db.models import Count
result_counts = VaptResult.objects.values('result').annotate(count=Count('result'))
for item in result_counts:
    print(f"{item['result']}: {item['count']}")