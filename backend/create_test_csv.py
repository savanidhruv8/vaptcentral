import pandas as pd
import os

def create_test_csv_files():
    """Create test CSV files for VAPT dashboard testing"""
    
    # Create Vulnerability Results CSV
    vuln_data = {
        'Vulnerability ID': ['VAPT-2024-004', 'VAPT-2024-005', 'VAPT-2024-006', 'VAPT-2024-007'],
        'Name of Vulnerability': [
            'Cross-Site Scripting (XSS) in Search Form',
            'Insecure Direct Object Reference',
            'Weak Password Policy',
            'Unvalidated Redirects and Forwards'
        ],
        'Description': [
            'XSS vulnerability found in search functionality allowing script injection',
            'Direct access to user data without proper authorization checks',
            'Password policy allows weak passwords compromising security',
            'Application redirects users to untrusted external sites'
        ],
        'Tested Environment': ['PRODUCTION', 'STAGING', 'DEVELOPMENT', 'UAT'],
        'Result': ['FAIL', 'FAIL', 'FAIL', 'FAIL'],
        'Reporting Evidence': [
            'Screenshot showing XSS payload execution',
            'Log files showing unauthorized access',
            'Password policy configuration screenshot',
            'URL manipulation demonstration'
        ],
        'Source of Identification': [
            'Automated Scanning',
            'Manual Testing',
            'Policy Review',
            'Code Review'
        ],
        'Criticality based on CVSS Score': ['MEDIUM', 'HIGH', 'LOW', 'MEDIUM'],
        'Criticality based on Business Context': ['HIGH', 'CRITICAL', 'MEDIUM', 'HIGH'],
        'Stakeholders': [
            'Development Team, Security Team',
            'IT Team, Development Team',
            'Security Team, HR Team',
            'Development Team'
        ],
        'Remarks from Stakeholders': [
            'Fix scheduled for next sprint',
            'Immediate action required',
            'Policy update in progress',
            'Framework update needed'
        ]
    }
    
    # Create Proposals CSV
    proposal_data = {
        'S.No': [4, 5, 6],
        'Domain': ['Cloud Infrastructure', 'IoT Devices', 'Database Security'],
        'Different Avenues of the Testing Scope': [
            'AWS Security, Container Security, Serverless',
            'Device Authentication, Communication Protocols',
            'SQL Injection, Access Controls, Encryption'
        ],
        'Overview of the Methodology': [
            'Cloud Security Framework Assessment',
            'IoT Security Testing Methodology',
            'Database Security Assessment Framework'
        ],
        'Key Deliverables': [
            'Cloud Security Report, Remediation Plan',
            'IoT Security Assessment, Device Inventory',
            'Database Security Report, Access Review'
        ],
        'Key Dependencies': [
            'Cloud Environment Access',
            'Device Physical Access',
            'Database Administrator Support'
        ],
        'Est.testdate': ['2024-06-15', '2024-07-20', '2024-08-10'],
        'Est.startdate': ['2024-06-01', '2024-07-01', '2024-08-01'],
        'Timeline of testing': ['2 weeks', '3 weeks', '1.5 weeks'],
        'Timeline of remediation': ['3 weeks', '4 weeks', '2 weeks'],
        'Stake holder': ['Cloud Team', 'IoT Team', 'Database Team'],
        'Last tested year': ['2024-25', '2024-25', '2024-25'],
        'Requirement statements': [
            'Comprehensive cloud security assessment',
            'IoT device security evaluation',
            'Database security and compliance review'
        ]
    }
    
    # Create Scopes CSV
    scope_data = {
        'S.No': [4, 5, 6],
        'Penetration Testing': [
            'Cloud Penetration Testing',
            'IoT Device Testing',
            'Database Penetration Testing'
        ],
        'Description': [
            'Testing cloud infrastructure for security vulnerabilities',
            'Testing IoT devices for security weaknesses',
            'Testing database security and access controls'
        ],
        'Key Deliverables': [
            'Cloud penetration test report',
            'IoT security assessment report',
            'Database security audit report'
        ],
        'Key Dependencies': [
            'Cloud platform access and documentation',
            'IoT device access and specifications',
            'Database schemas and access credentials'
        ],
        'Est.testdate': ['2024-06-15', '2024-07-20', '2024-08-10'],
        'Est.startdate': ['2024-06-01', '2024-07-01', '2024-08-01'],
        'Timeline of testing': ['2 weeks', '3 weeks', '1.5 weeks'],
        'Timeline of remediation': ['3 weeks', '4 weeks', '2 weeks'],
        'Stake holder': ['Cloud Team', 'IoT Team', 'Database Team'],
        'Last tested year': ['2024-25', '2024-25', '2024-25'],
        'Requirement statements': [
            'Cloud security compliance testing',
            'IoT device security assessment',
            'Database security audit requirements'
        ],
        'Impact of these tests': ['HIGH', 'CRITICAL', 'HIGH']
    }
    
    # Create CSV files
    vuln_df = pd.DataFrame(vuln_data)
    proposal_df = pd.DataFrame(proposal_data)
    scope_df = pd.DataFrame(scope_data)
    
    # Save to CSV files
    vuln_df.to_csv('test_vulnerabilities.csv', index=False)
    proposal_df.to_csv('test_proposals.csv', index=False)
    scope_df.to_csv('test_scopes.csv', index=False)
    
    print("Created CSV test files:")
    print("   - test_vulnerabilities.csv (4 vulnerabilities)")
    print("   - test_proposals.csv (3 proposals)")
    print("   - test_scopes.csv (3 scopes)")
    print("\nYou can upload these files through the frontend to test CSV functionality.")

if __name__ == "__main__":
    create_test_csv_files()