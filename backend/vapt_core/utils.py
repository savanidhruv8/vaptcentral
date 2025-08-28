import pandas as pd
from datetime import datetime
from django.utils import timezone
from .models import ExcelUpload, Proposal, Scope, VaptResult, KPIMetrics


class ExcelProcessor:
    def __init__(self, excel_upload):
        self.excel_upload = excel_upload
        self.file_path = excel_upload.file.path
        
    def process_excel_file(self):
        try:
            file_extension = self.file_path.lower().split('.')[-1]
            
            if file_extension == 'csv':
                return self._process_csv_file()
            else:
                return self._process_excel_file()
        except Exception as e:
            return {
                'proposals': 0,
                'scopes': 0,
                'vapt_results': 0,
                'errors': [f"Error processing file: {str(e)}"]
            }
    
    def _process_excel_file(self):
        try:
            # Read all sheets from Excel file
            excel_file = pd.ExcelFile(self.file_path)
            
            results = {
                'proposals': 0,
                'scopes': 0,
                'vapt_results': 0,
                'errors': []
            }
            
            # Process each sheet
            for sheet_name in excel_file.sheet_names:
                sheet_name_lower = sheet_name.lower()
                
                if 'proposal' in sheet_name_lower:
                    count = self._process_proposal_sheet(excel_file, sheet_name)
                    results['proposals'] = count
                elif 'scope' in sheet_name_lower:
                    count = self._process_scope_sheet(excel_file, sheet_name)
                    results['scopes'] = count
                elif 'vapt' in sheet_name_lower or 'result' in sheet_name_lower:
                    count = self._process_vapt_results_sheet(excel_file, sheet_name)
                    results['vapt_results'] = count
            
            # Calculate KPIs
            self._calculate_kpis()
            
            # Mark as processed
            self.excel_upload.processed = True
            self.excel_upload.processed_at = timezone.now()
            self.excel_upload.save()
            
            return results
            
        except Exception as e:
            results['errors'].append(f"Error processing file: {str(e)}")
            return results
    
    def _process_csv_file(self):
        try:
            # Read CSV file
            df = pd.read_csv(self.file_path)
            
            results = {
                'proposals': 0,
                'scopes': 0,
                'vapt_results': 0,
                'errors': []
            }
            
            # Clean column names
            df.columns = df.columns.str.strip().str.lower()
            
            # Determine the type of CSV based on columns
            columns = set(df.columns)
            
            if 'vulnerability id' in columns or 'vulnerabilities id' in columns:
                # This looks like a VAPT results CSV
                count = self._process_vapt_results_csv(df)
                results['vapt_results'] = count
            elif 'penetration testing' in columns:
                # This looks like a scope CSV
                count = self._process_scope_csv(df)
                results['scopes'] = count
            elif 'domain' in columns and 'testing scope' in ' '.join(columns):
                # This looks like a proposal CSV
                count = self._process_proposal_csv(df)
                results['proposals'] = count
            else:
                # Try to auto-detect by checking for key columns
                if 'domain' in columns:
                    count = self._process_proposal_csv(df)
                    results['proposals'] = count
                elif 'vulnerability' in ' '.join(columns):
                    count = self._process_vapt_results_csv(df)
                    results['vapt_results'] = count
                else:
                    results['errors'].append("Could not determine CSV file type. Please ensure proper column headers.")
            
            # Calculate KPIs
            self._calculate_kpis()
            
            # Mark as processed
            self.excel_upload.processed = True
            self.excel_upload.processed_at = timezone.now()
            self.excel_upload.save()
            
            return results
            
        except Exception as e:
            return {
                'proposals': 0,
                'scopes': 0,
                'vapt_results': 0,
                'errors': [f"Error processing CSV file: {str(e)}"]
            }
    
    def _process_proposal_csv(self, df):
        count = 0
        for _, row in df.iterrows():
            if pd.isna(row.get('s.no', row.get('s_no', None))):
                continue
                
            proposal_data = {
                'excel_upload': self.excel_upload,
                's_no': int(row.get('s.no', row.get('s_no', 0))),
                'domain': str(row.get('domain', '')),
                'testing_scope_avenues': str(row.get('different avenues of the testing scope', row.get('testing scope', ''))),
                'methodology_overview': str(row.get('overview of the methodology', row.get('methodology', ''))),
                'key_deliverables': str(row.get('key dilevirables', row.get('key deliverables', ''))),
                'key_dependencies': str(row.get('key dependencies', '')),
                'est_test_date': self._parse_date(row.get('est.testdate', row.get('est test date', ''))),
                'est_start_date': self._parse_date(row.get('est.startdate', row.get('est start date', ''))),
                'testing_timeline': str(row.get('timeline of testing', row.get('testing timeline', ''))),
                'remediation_timeline': str(row.get('timeline of remediation', row.get('remediation timeline', ''))),
                'stakeholder': str(row.get('stake holder', row.get('stakeholder', ''))),
                'last_tested_year': str(row.get('last tested year', '')),
                'requirement_statements': str(row.get('requirement statements', ''))
            }
            
            # Clean empty strings to None for optional fields
            for key, value in proposal_data.items():
                if value == '' or value == 'nan':
                    proposal_data[key] = None
            
            Proposal.objects.create(**proposal_data)
            count += 1
            
        return count
    
    def _process_scope_csv(self, df):
        count = 0
        for _, row in df.iterrows():
            if pd.isna(row.get('s.no', row.get('s_no', None))):
                continue
                
            scope_data = {
                'excel_upload': self.excel_upload,
                's_no': int(row.get('s.no', row.get('s_no', 0))),
                'penetration_testing': str(row.get('penetration testing', '')),
                'description': str(row.get('description', '')),
                'key_deliverables': str(row.get('key dilevirables', row.get('key deliverables', ''))),
                'key_dependencies': str(row.get('key dependencies', '')),
                'est_test_date': self._parse_date(row.get('est.testdate', row.get('est test date', ''))),
                'est_start_date': self._parse_date(row.get('est.startdate', row.get('est start date', ''))),
                'testing_timeline': str(row.get('timeline of testing', row.get('testing timeline', ''))),
                'remediation_timeline': str(row.get('timeline of remediation', row.get('remediation timeline', ''))),
                'stakeholder': str(row.get('stake holder', row.get('stakeholder', ''))),
                'last_tested_year': str(row.get('last tested year', '')),
                'requirement_statements': str(row.get('requirement statements', '')),
                'impact_of_tests': self._normalize_impact(row.get('impact of these tests', row.get('impact', '')))
            }
            
            # Clean empty strings to None for optional fields
            for key, value in scope_data.items():
                if value == '' or value == 'nan':
                    scope_data[key] = None
            
            Scope.objects.create(**scope_data)
            count += 1
            
        return count
    
    def _process_vapt_results_csv(self, df):
        count = 0
        for _, row in df.iterrows():
            vuln_id = row.get('vulnerabilities id', row.get('vulnerability id', ''))
            if pd.isna(vuln_id) or vuln_id == '':
                continue
                
            vapt_data = {
                'excel_upload': self.excel_upload,
                'vulnerability_id': str(vuln_id),
                'vulnerability_name': str(row.get('name of vulnerability', row.get('vulnerability name', ''))),
                'description': str(row.get('description', '')),
                'tested_environment': self._extract_environment(row.get('tested environment', '')),
                'result': self._normalize_result(row.get('result', '')),
                'reporting_evidence': str(row.get('reporting evidence', '')),
                'source_of_identification': str(row.get('source of identifcation', row.get('source of identification', ''))),
                'cvss_criticality': self._normalize_criticality(row.get('criticiality based on cvss score', row.get('cvss criticality', ''))),
                'business_criticality': self._normalize_criticality(row.get('criticiality based on business context', row.get('business criticality', ''))),
                'stakeholders': str(row.get('stake holders', row.get('stakeholders', ''))),
                'stakeholder_remarks': str(row.get('remarks from stakeholders', row.get('remarks', '')))
            }
            
            # Clean empty strings to None for optional fields
            for key, value in vapt_data.items():
                if value == '' or value == 'nan' or pd.isna(value):
                    if key in ['cvss_criticality', 'business_criticality', 'tested_environment', 'result']:
                        # Set default values for required fields
                        if key == 'cvss_criticality':
                            vapt_data[key] = 'MEDIUM'
                        elif key == 'business_criticality':
                            vapt_data[key] = 'MEDIUM'
                        elif key == 'tested_environment':
                            vapt_data[key] = None
                        elif key == 'result':
                            vapt_data[key] = 'FAIL'
                    else:
                        vapt_data[key] = None
            
            # Skip only if this vulnerability already exists for this same upload
            if not VaptResult.objects.filter(
                vulnerability_id=vapt_data['vulnerability_id'],
                excel_upload=self.excel_upload,
            ).exists():
                VaptResult.objects.create(**vapt_data)
                count += 1
                
        return count
    
    def _process_proposal_sheet(self, excel_file, sheet_name):
        try:
            # Read with header=None first to find actual headers
            df_raw = pd.read_excel(excel_file, sheet_name=sheet_name, header=None)
            
            # Find the row with actual headers (look for 'S.No')
            header_row = None
            for idx in range(min(10, len(df_raw))):
                row_values = df_raw.iloc[idx].astype(str).str.lower()
                if any('s.no' in str(val) for val in row_values):
                    header_row = idx
                    break
            
            if header_row is None:
                print(f"Could not find header row in proposal sheet: {sheet_name}")
                return 0
            
            # Read again with correct header row
            df = pd.read_excel(excel_file, sheet_name=sheet_name, header=header_row)
            
            # Clean column names
            df.columns = df.columns.str.strip().str.lower()
            
            count = 0
            for _, row in df.iterrows():
                s_no = row.get('s.no', row.get('s_no', None))
                if pd.isna(s_no) or s_no == '' or str(s_no) == 'nan':
                    continue
                    
                proposal_data = {
                    'excel_upload': self.excel_upload,
                    's_no': int(row.get('s.no', row.get('s_no', 0))),
                    'domain': str(row.get('domain', '')),
                    'testing_scope_avenues': str(row.get('different avenues of the testing scope', '')),
                    'methodology_overview': str(row.get('overview of the methodology', '')),
                    'key_deliverables': str(row.get('key dilevirables', row.get('key deliverables', ''))),
                    'key_dependencies': str(row.get('key dependencies', '')),
                    'est_test_date': self._parse_date(row.get('est.testdate')),
                    'est_start_date': self._parse_date(row.get('est.startdate')),
                    'testing_timeline': str(row.get('timeline of testing', '')),
                    'remediation_timeline': str(row.get('timeline of remediation', '')),
                    'stakeholder': str(row.get('stake holder', row.get('stakeholder', ''))),
                    'last_tested_year': str(row.get('last tested year', '')),
                    'requirement_statements': str(row.get('requirement statements', ''))
                }
                
                # Clean empty strings and set defaults for required fields
                for key, value in proposal_data.items():
                    if value == '' or value == 'nan' or pd.isna(value) or str(value) == 'nan':
                        if key in ['requirement_statements', 'key_deliverables', 'key_dependencies', 
                                 'testing_scope_avenues', 'methodology_overview', 'domain', 'stakeholder']:
                            # Set default values for required text fields
                            proposal_data[key] = 'TBD' if value == '' or pd.isna(value) else str(value)
                        else:
                            proposal_data[key] = None
                
                Proposal.objects.create(**proposal_data)
                count += 1
                
            return count
            
        except Exception as e:
            print(f"Error processing proposal sheet: {str(e)}")
            return 0
    
    def _process_scope_sheet(self, excel_file, sheet_name):
        try:
            # Read with header=None first to find actual headers
            df_raw = pd.read_excel(excel_file, sheet_name=sheet_name, header=None)
            
            # Find the row with actual headers (look for 'S.No')
            header_row = None
            for idx in range(min(10, len(df_raw))):
                row_values = df_raw.iloc[idx].astype(str).str.lower()
                if any('s.no' in str(val) for val in row_values):
                    header_row = idx
                    break
            
            if header_row is None:
                print(f"Could not find header row in scope sheet: {sheet_name}")
                return 0
            
            # Read again with correct header row
            df = pd.read_excel(excel_file, sheet_name=sheet_name, header=header_row)
            
            # Clean column names
            df.columns = df.columns.str.strip().str.lower()
            
            count = 0
            for _, row in df.iterrows():
                s_no = row.get('s.no', row.get('s_no', None))
                if pd.isna(s_no) or s_no == '' or str(s_no) == 'nan':
                    continue
                    
                scope_data = {
                    'excel_upload': self.excel_upload,
                    's_no': int(row.get('s.no', row.get('s_no', 0))),
                    'penetration_testing': str(row.get('penetration testing', '')),
                    'description': str(row.get('description', '')),
                    'key_deliverables': str(row.get('key dilevirables', row.get('key deliverables', ''))),
                    'key_dependencies': str(row.get('key dependencies', '')),
                    'est_test_date': self._parse_date(row.get('est.testdate')),
                    'est_start_date': self._parse_date(row.get('est.startdate')),
                    'testing_timeline': str(row.get('timeline of testing', '')),
                    'remediation_timeline': str(row.get('timeline of remediation', '')),
                    'stakeholder': str(row.get('stake holder', row.get('stakeholder', ''))),
                    'last_tested_year': str(row.get('last tested year', '')),
                    'requirement_statements': str(row.get('requirement statements', '')),
                    'impact_of_tests': self._normalize_impact(row.get('impact of these tests', ''))
                }
                
                # Clean empty strings and set defaults for required fields
                for key, value in scope_data.items():
                    if value == '' or value == 'nan' or pd.isna(value) or str(value) == 'nan':
                        if key in ['requirement_statements', 'key_deliverables', 'key_dependencies', 
                                 'penetration_testing', 'description', 'stakeholder']:
                            # Set default values for required text fields
                            scope_data[key] = 'TBD' if value == '' or pd.isna(value) else str(value)
                        else:
                            scope_data[key] = None
                
                Scope.objects.create(**scope_data)
                count += 1
                
            return count
            
        except Exception as e:
            print(f"Error processing scope sheet: {str(e)}")
            return 0
    
    def _process_vapt_results_sheet(self, excel_file, sheet_name):
        try:
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            # Clean column names
            df.columns = df.columns.str.strip().str.lower()
            
            count = 0
            for _, row in df.iterrows():
                # Handle both correct and misspelled vulnerability ID column
                vuln_id = row.get('vulnerbaility id', row.get('vulnerability id', row.get('vulnerabilities id', '')))
                if pd.isna(vuln_id) or vuln_id == '' or str(vuln_id) == 'nan':
                    continue
                    
                vapt_data = {
                    'excel_upload': self.excel_upload,
                    'vulnerability_id': str(vuln_id),
                    'vulnerability_name': str(row.get('name of vulnerability', '')),
                    'description': str(row.get('description', '')),
                    'tested_environment': self._extract_environment(row.get('tested environment ', row.get('tested environment', ''))),
                    'result': self._normalize_result(row.get('result', '')),
                    'reporting_evidence': str(row.get('reporting evidence', '')),
                    'source_of_identification': str(row.get('source of identification', '')),
                    'cvss_criticality': self._normalize_criticality(row.get('criticality based on cvss score ', row.get('criticality based on cvss score', ''))),
                    'business_criticality': self._normalize_criticality(row.get('criticality based in business context', row.get('criticality based on business context', ''))),
                    'stakeholders': str(row.get('stakeholder', row.get('stakeholders', ''))),
                    'stakeholder_remarks': str(row.get('remarks from stakeholders', ''))
                }
                
                # Clean empty strings and set defaults for required fields
                for key, value in vapt_data.items():
                    if value == '' or value == 'nan' or pd.isna(value) or str(value) == 'nan':
                        if key in ['cvss_criticality', 'business_criticality', 'tested_environment', 'result']:
                            # Set default values for required fields
                            if key == 'cvss_criticality':
                                vapt_data[key] = 'MEDIUM'
                            elif key == 'business_criticality':
                                vapt_data[key] = 'MEDIUM'
                            elif key == 'tested_environment':
                                vapt_data[key] = None
                            elif key == 'result':
                                vapt_data[key] = 'FAIL'
                        else:
                            vapt_data[key] = None
                
                # Skip only if this vulnerability already exists for this same upload
                if not VaptResult.objects.filter(
                    vulnerability_id=vapt_data['vulnerability_id'],
                    excel_upload=self.excel_upload,
                ).exists():
                    VaptResult.objects.create(**vapt_data)
                    count += 1
                
            return count
            
        except Exception as e:
            print(f"Error processing VAPT results sheet: {str(e)}")
            return 0
    
    def _parse_date(self, date_value):
        if pd.isna(date_value):
            return None
        
        try:
            if isinstance(date_value, str):
                # Try different date formats
                for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%d-%m-%Y']:
                    try:
                        return datetime.strptime(date_value, fmt).date()
                    except ValueError:
                        continue
            elif hasattr(date_value, 'date'):
                return date_value.date()
            return None
        except:
            return None
    
    def _normalize_impact(self, impact_value):
        if pd.isna(impact_value):
            return None
        
        impact_str = str(impact_value).upper()
        if 'CRITICAL' in impact_str:
            return 'CRITICAL'
        elif 'HIGH' in impact_str:
            return 'HIGH'
        elif 'MEDIUM' in impact_str:
            return 'MEDIUM'
        elif 'LOW' in impact_str:
            return 'LOW'
        return None
    
    def _extract_environment(self, env_value):
        # Preserve exact sheet value for Tested Environment (e.g., "Internal Network", "Content Ingestion API")
        if pd.isna(env_value):
            return None
        env_text = str(env_value).strip()
        return env_text if env_text else None
    
    def _normalize_result(self, result_value):
        if pd.isna(result_value) or result_value == '':
            return 'UNKNOWN'
        
        result_str = str(result_value).strip()
        
        # Return the actual result values from the Excel file
        valid_results = [
            'Remediated', 'No evidence of remediation', 'Risk Accepted', 
            'Plan for Remediation', 'Unresolved', 'Risk Avoided'
        ]
        
        # Check if it matches any valid result
        for valid_result in valid_results:
            if result_str.lower() == valid_result.lower():
                return valid_result
        
        # If not found, return the original value
        return result_str
    
    def _normalize_criticality(self, crit_value):
        if pd.isna(crit_value):
            return None
        
        crit_str = str(crit_value).upper()
        if 'CRITICAL' in crit_str:
            return 'CRITICAL'
        elif 'HIGH' in crit_str:
            return 'HIGH'
        elif 'MEDIUM' in crit_str:
            return 'MEDIUM'
        elif 'LOW' in crit_str:
            return 'LOW'
        return None
    
    def _calculate_kpis(self):
        try:
            # Get counts
            proposals = Proposal.objects.filter(excel_upload=self.excel_upload)
            scopes = Scope.objects.filter(excel_upload=self.excel_upload)
            vapt_results = VaptResult.objects.filter(excel_upload=self.excel_upload)
            
            # Proposal metrics
            proposals_by_year = {}
            for proposal in proposals:
                year = proposal.last_tested_year or 'Unknown'
                proposals_by_year[year] = proposals_by_year.get(year, 0) + 1
            
            # Scope metrics
            scopes_by_impact = {}
            scopes_by_year = {}
            for scope in scopes:
                impact = scope.impact_of_tests or 'Unknown'
                scopes_by_impact[impact] = scopes_by_impact.get(impact, 0) + 1
                
                year = scope.last_tested_year or 'Unknown'
                scopes_by_year[year] = scopes_by_year.get(year, 0) + 1
            
            # VAPT Results metrics
            vulns_by_criticality = {}
            vulns_by_environment = {}
            vulns_by_result = {}
            
            for vuln in vapt_results:
                # By criticality
                crit = vuln.cvss_criticality or 'Unknown'
                vulns_by_criticality[crit] = vulns_by_criticality.get(crit, 0) + 1
                
                # By environment
                env = vuln.tested_environment or 'Unknown'
                vulns_by_environment[env] = vulns_by_environment.get(env, 0) + 1
                
                # By result
                result = vuln.result or 'Unknown'
                vulns_by_result[result] = vulns_by_result.get(result, 0) + 1
            
            # Create or update KPI metrics
            kpi_metrics, created = KPIMetrics.objects.get_or_create(
                excel_upload=self.excel_upload,
                defaults={
                    'total_proposals': proposals.count(),
                    'proposals_by_year': proposals_by_year,
                    'total_scopes': scopes.count(),
                    'scopes_by_impact': scopes_by_impact,
                    'scopes_by_year': scopes_by_year,
                    'total_vulnerabilities': vapt_results.count(),
                    'vulnerabilities_by_criticality': vulns_by_criticality,
                    'vulnerabilities_by_environment': vulns_by_environment,
                    'vulnerabilities_by_result': vulns_by_result,
                }
            )
            
            if not created:
                # Update existing metrics
                kpi_metrics.total_proposals = proposals.count()
                kpi_metrics.proposals_by_year = proposals_by_year
                kpi_metrics.total_scopes = scopes.count()
                kpi_metrics.scopes_by_impact = scopes_by_impact
                kpi_metrics.scopes_by_year = scopes_by_year
                kpi_metrics.total_vulnerabilities = vapt_results.count()
                kpi_metrics.vulnerabilities_by_criticality = vulns_by_criticality
                kpi_metrics.vulnerabilities_by_environment = vulns_by_environment
                kpi_metrics.vulnerabilities_by_result = vulns_by_result
                kpi_metrics.save()
            
        except Exception as e:
            print(f"Error calculating KPIs: {str(e)}")


def calculate_global_kpis():
    all_uploads = ExcelUpload.objects.filter(processed=True)
    
    global_stats = {
        'total_uploads': all_uploads.count(),
        'total_proposals': Proposal.objects.count(),
        'total_scopes': Scope.objects.count(),
        'total_vulnerabilities': VaptResult.objects.count(),
        'critical_vulnerabilities': VaptResult.objects.filter(cvss_criticality='CRITICAL').count(),
        'high_vulnerabilities': VaptResult.objects.filter(cvss_criticality='HIGH').count(),
    }
    
    return global_stats