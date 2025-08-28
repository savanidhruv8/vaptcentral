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

print("=== REPROCESSING PROPOSALS AND SCOPES ===")

# Get the Excel file with processed VAPT data
upload = ExcelUpload.objects.get(id=2)  # The one with 94 VAPT results
print(f"Processing: {upload.file.name}")

try:
    # Clear existing proposal and scope data for this upload
    existing_proposals = Proposal.objects.filter(excel_upload=upload).count()
    existing_scopes = Scope.objects.filter(excel_upload=upload).count()
    
    print(f"Clearing existing data:")
    print(f"  - Proposals: {existing_proposals}")
    print(f"  - Scopes: {existing_scopes}")
    
    Proposal.objects.filter(excel_upload=upload).delete()
    Scope.objects.filter(excel_upload=upload).delete()
    
    # Create processor and reprocess only proposals and scopes
    processor = ExcelProcessor(upload)
    
    # Process individual sheets manually for better control
    import pandas as pd
    excel_file = pd.ExcelFile(upload.file.path)
    
    results = {
        'proposals': 0,
        'scopes': 0,
        'errors': []
    }
    
    for sheet_name in excel_file.sheet_names:
        sheet_name_lower = sheet_name.lower()
        
        if 'proposal' in sheet_name_lower:
            print(f"\nProcessing Proposal sheet: {sheet_name}")
            try:
                count = processor._process_proposal_sheet(excel_file, sheet_name)
                results['proposals'] += count
                print(f"  -> Processed {count} proposals")
            except Exception as e:
                error_msg = f"Error processing proposal sheet {sheet_name}: {str(e)}"
                results['errors'].append(error_msg)
                print(f"  -> ERROR: {error_msg}")
                
        elif 'scope' in sheet_name_lower:
            print(f"\nProcessing Scope sheet: {sheet_name}")
            try:
                count = processor._process_scope_sheet(excel_file, sheet_name)
                results['scopes'] += count
                print(f"  -> Processed {count} scopes")
            except Exception as e:
                error_msg = f"Error processing scope sheet {sheet_name}: {str(e)}"
                results['errors'].append(error_msg)
                print(f"  -> ERROR: {error_msg}")
    
    # Recalculate KPIs to include new data
    try:
        processor._calculate_kpis()
        print("\nKPIs recalculated successfully")
    except Exception as e:
        print(f"Warning: KPI calculation failed: {e}")
    
    print(f"\n=== PROCESSING RESULTS ===")
    print(f"Proposals processed: {results['proposals']}")
    print(f"Scopes processed: {results['scopes']}")
    print(f"VAPT Results (unchanged): {VaptResult.objects.filter(excel_upload=upload).count()}")
    
    if results['errors']:
        print(f"\nErrors encountered:")
        for error in results['errors']:
            print(f"  - {error}")
    else:
        print("\nNo errors encountered!")
        
    # Update upload status
    upload.processed = True
    upload.save()
    
    print("\n=== FINAL STATISTICS ===")
    print(f"Total VAPT Results: {VaptResult.objects.count()}")
    print(f"Total Proposals: {Proposal.objects.count()}")
    print(f"Total Scopes: {Scope.objects.count()}")

except Exception as e:
    print(f"ERROR: Failed to reprocess: {e}")