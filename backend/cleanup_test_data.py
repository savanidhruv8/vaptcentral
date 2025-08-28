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

print("=== CLEANING UP TEST DATA ===")

# Identify test/dummy data uploads
test_uploads = []
real_uploads = []

for upload in ExcelUpload.objects.all():
    file_name = upload.file.name.lower()
    if ('test_' in file_name or 
        'test.' in file_name or
        upload.file.name.startswith('excel_uploads/test')):
        test_uploads.append(upload)
        print(f"MARKED FOR DELETION - Test Upload {upload.id}: {upload.file.name}")
    else:
        real_uploads.append(upload)
        vapt_count = VaptResult.objects.filter(excel_upload=upload).count()
        proposal_count = Proposal.objects.filter(excel_upload=upload).count()
        scope_count = Scope.objects.filter(excel_upload=upload).count()
        print(f"KEEPING - Real Upload {upload.id}: {upload.file.name}")
        print(f"  - VAPT Results: {vapt_count}")
        print(f"  - Proposals: {proposal_count}")
        print(f"  - Scopes: {scope_count}")

print(f"\nFound {len(test_uploads)} test uploads and {len(real_uploads)} real uploads")

if test_uploads:
    print("\n=== DELETING TEST DATA ===")
    for upload in test_uploads:
        # Delete related data
        vapt_deleted = VaptResult.objects.filter(excel_upload=upload).count()
        proposal_deleted = Proposal.objects.filter(excel_upload=upload).count()
        scope_deleted = Scope.objects.filter(excel_upload=upload).count()
        kpi_deleted = KPIMetrics.objects.filter(excel_upload=upload).count()
        
        VaptResult.objects.filter(excel_upload=upload).delete()
        Proposal.objects.filter(excel_upload=upload).delete()
        Scope.objects.filter(excel_upload=upload).delete()
        KPIMetrics.objects.filter(excel_upload=upload).delete()
        
        print(f"Deleted from Upload {upload.id}:")
        print(f"  - VAPT Results: {vapt_deleted}")
        print(f"  - Proposals: {proposal_deleted}")
        print(f"  - Scopes: {scope_deleted}")
        print(f"  - KPI Metrics: {kpi_deleted}")
        
        # Delete the upload record
        upload.delete()
        print(f"  - Upload record deleted")

print(f"\n=== FINAL STATISTICS (REAL DATA ONLY) ===")
print(f"Total VAPT Results: {VaptResult.objects.count()}")
print(f"Total Proposals: {Proposal.objects.count()}")
print(f"Total Scopes: {Scope.objects.count()}")
print(f"Total Uploads: {ExcelUpload.objects.count()}")

print("\n=== REMAINING UPLOADS (REAL DATA) ===")
for upload in ExcelUpload.objects.all():
    vapt_count = VaptResult.objects.filter(excel_upload=upload).count()
    proposal_count = Proposal.objects.filter(excel_upload=upload).count()
    scope_count = Scope.objects.filter(excel_upload=upload).count()
    
    print(f"Upload {upload.id}: {upload.file.name}")
    print(f"  - VAPT Results: {vapt_count}")
    print(f"  - Proposals: {proposal_count}")
    print(f"  - Scopes: {scope_count}")
    print(f"  - Uploaded: {upload.uploaded_at}")
    print()