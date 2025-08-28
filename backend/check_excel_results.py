#!/usr/bin/env python
import os
import sys
import argparse
import re
import pandas as pd

DEFAULT_SHEET_CANDIDATES = [
    "VAPT Results (2024-25)",
    "VAPT Result (24-25)",
    "VAPT Results",
    "VAPT Result",
]

TARGET_COLUMNS = {
    "environment": [
        "Tested Environment", "Environment", "Env", "Testing Environment"
    ],
    "cvss_criticality": [
        "Criticality based on CVSS score", "CVSS Criticality", "CVSS"
    ],
    "business_criticality": [
        "Criticality Based in Business Context", "Business Criticality", "Business Context Criticality"
    ],
}


def pick_sheet_name(xl):
    sheet_names = xl.sheet_names
    # Exact candidates first
    for cand in DEFAULT_SHEET_CANDIDATES:
        if cand in sheet_names:
            return cand
    # Fuzzy match: contains "vapt" and "result"
    for name in sheet_names:
        lname = name.lower()
        if "vapt" in lname and "result" in lname:
            return name
    # Fallback to first sheet
    return sheet_names[0]


def find_first_matching_column(columns, candidates):
    lowered = {str(c).strip().lower(): c for c in columns}
    for cand in candidates:
        key = cand.strip().lower()
        if key in lowered:
            return lowered[key]
    # fuzzy contains
    for lc, orig in lowered.items():
        for cand in candidates:
            if re.search(re.escape(cand.strip().lower()), lc):
                return orig
    return None


def main():
    parser = argparse.ArgumentParser(description="Inspect VAPT Results sheet and locate key columns")
    parser.add_argument("--file", dest="file_path", default=None, help="Path to Excel file (.xlsx)")
    parser.add_argument("--sheet", dest="sheet_name", default=None, help="Sheet name to read")
    args = parser.parse_args()

    file_path = args.file_path
    if not file_path:
        # Find newest file in media/excel_uploads
        media_dir = os.path.join(os.path.dirname(__file__), "media", "excel_uploads")
        xlsx_files = [
            os.path.join(media_dir, f)
            for f in os.listdir(media_dir)
            if f.lower().endswith((".xlsx", ".xls"))
        ]
        if not xlsx_files:
            print("No Excel files found in media/excel_uploads")
            sys.exit(1)
        file_path = max(xlsx_files, key=os.path.getmtime)

    print(f"Analyzing file: {file_path}")
    xl = pd.ExcelFile(file_path)
    sheet = args.sheet_name or pick_sheet_name(xl)
    print(f"Using sheet: {sheet}")

    df = xl.parse(sheet)
    print(f"Total rows: {len(df)}")
    print("Columns:")
    for c in df.columns:
        print(f" - {c}")

    found = {}
    for key, candidates in TARGET_COLUMNS.items():
        col = find_first_matching_column(df.columns, candidates)
        found[key] = col
        print(f"Detected {key}: {col}")

    # Show sample unique values for environment and both criticalities
    for key in ["environment", "cvss_criticality", "business_criticality"]:
        col = found.get(key)
        if col and col in df.columns:
            vals = df[col].dropna().astype(str).str.strip()
            uniques = vals.value_counts().head(20)
            print(f"\nUnique values for {key} (column '{col}'):")
            print(uniques.to_string())


if __name__ == "__main__":
    main()