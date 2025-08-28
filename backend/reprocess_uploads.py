#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vapt_dashboard.settings')
django.setup()

from vapt_core.models import ExcelUpload, VaptResult, Proposal, Scope
from vapt_core.utils import ExcelProcessor

print("=== REPROCESSING FAILED UPLOADS ===")

# Find uploads that have 0 VAPT results but should have them
failed_uploads = []
for upload in ExcelUpload.objects.filter(file__icontains='.xlsx'):
    vapt_count = VaptResult.objects.filter(excel_upload=upload).count()
    if vapt_count == 0:
        failed_uploads.append(upload)

print(f"Found {len(failed_uploads)} uploads with 0 VAPT results")

for upload in failed_uploads:
    print(f"\n=== Reprocessing Upload {upload.id}: {upload.file.name} ===")
    
    try:
        # Clear existing data for this upload (if any)
        VaptResult.objects.filter(excel_upload=upload).delete()
        Proposal.objects.filter(excel_upload=upload).delete()
        Scope.objects.filter(excel_upload=upload).delete()
        
        # Create processor and reprocess
        processor = ExcelProcessor(upload)
        results = processor.process_excel_file()
        
        print(f"Processing Results:")
        print(f"  - Proposals: {results['proposals']}")
        print(f"  - Scopes: {results['scopes']}")  
        print(f"  - VAPT Results: {results['vapt_results']}")
        
        if results['errors']:
            print(f"  - Errors: {results['errors']}")
            
        # Update upload status
        upload.processed = True
        upload.save()
        
        print("SUCCESS: Reprocessing completed successfully")
        
    except Exception as e:
        print(f"ERROR: Error reprocessing upload {upload.id}: {e}")

print(f"\n=== FINAL STATISTICS ===")
print(f"Total VAPT Results: {VaptResult.objects.count()}")
print(f"Total Proposals: {Proposal.objects.count()}")
print(f"Total Scopes: {Scope.objects.count()}")

print("\n=== BY UPLOAD ===")
for upload in ExcelUpload.objects.all():
    vapt_count = VaptResult.objects.filter(excel_upload=upload).count()
    if vapt_count > 0:
        print(f"Upload {upload.id}: {vapt_count} vulnerabilities")