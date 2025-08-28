#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vapt_dashboard.settings')
django.setup()

from vapt_core.models import ExcelUpload, VaptResult, Proposal, Scope, KPIMetrics

print("=== DATABASE STATISTICS ===")
print(f"Total VAPT Results: {VaptResult.objects.count()}")
print(f"Total Proposals: {Proposal.objects.count()}")
print(f"Total Scopes: {Scope.objects.count()}")
print(f"Total Uploads: {ExcelUpload.objects.count()}")

print("\n=== BY UPLOAD ===")
for upload in ExcelUpload.objects.all():
    vapt_count = VaptResult.objects.filter(excel_upload=upload).count()
    proposal_count = Proposal.objects.filter(excel_upload=upload).count()
    scope_count = Scope.objects.filter(excel_upload=upload).count()
    
    print(f"Upload {upload.id} ({upload.file.name}):")
    print(f"  - VAPT Results: {vapt_count}")
    print(f"  - Proposals: {proposal_count}")
    print(f"  - Scopes: {scope_count}")
    print(f"  - Processed: {upload.processed}")
    print()

print("=== KPI METRICS ===")
kpi_count = KPIMetrics.objects.count()
print(f"Total KPI records: {kpi_count}")
for kpi in KPIMetrics.objects.all():
    print(f"KPI for Upload {kpi.excel_upload.id}: {kpi.metrics}")