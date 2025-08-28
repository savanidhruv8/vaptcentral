from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class ExcelUpload(models.Model):
    file = models.FileField(upload_to='excel_uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Excel Upload - {self.uploaded_at}"


class Proposal(models.Model):
    YEAR_CHOICES = [
        ('2024-25', '2024-25'),
        ('2025-26', '2025-26'),
    ]
    
    excel_upload = models.ForeignKey(ExcelUpload, on_delete=models.CASCADE, related_name='proposals')
    s_no = models.IntegerField()
    domain = models.CharField(max_length=200)
    testing_scope_avenues = models.TextField(help_text="Different Avenues of the testing scope")
    methodology_overview = models.TextField(help_text="Overview of the methodology")
    key_deliverables = models.TextField()
    key_dependencies = models.TextField()
    est_test_date = models.DateField(null=True, blank=True)
    est_start_date = models.DateField(null=True, blank=True)
    testing_timeline = models.CharField(max_length=100, null=True, blank=True)
    remediation_timeline = models.CharField(max_length=100, null=True, blank=True)
    stakeholder = models.CharField(max_length=200)
    last_tested_year = models.CharField(max_length=10, choices=YEAR_CHOICES, null=True, blank=True)
    requirement_statements = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vapt_proposal'
        ordering = ['s_no']
    
    def __str__(self):
        return f"Proposal {self.s_no} - {self.domain}"


class Scope(models.Model):
    YEAR_CHOICES = [
        ('2024-25', '2024-25'),
        ('2025-26', '2025-26'),
    ]
    
    IMPACT_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]
    
    excel_upload = models.ForeignKey(ExcelUpload, on_delete=models.CASCADE, related_name='scopes')
    s_no = models.IntegerField()
    penetration_testing = models.CharField(max_length=200)
    description = models.TextField()
    key_deliverables = models.TextField()
    key_dependencies = models.TextField()
    est_test_date = models.DateField(null=True, blank=True)
    est_start_date = models.DateField(null=True, blank=True)
    testing_timeline = models.CharField(max_length=100, null=True, blank=True)
    remediation_timeline = models.CharField(max_length=100, null=True, blank=True)
    stakeholder = models.CharField(max_length=200)
    last_tested_year = models.CharField(max_length=10, choices=YEAR_CHOICES, null=True, blank=True)
    requirement_statements = models.TextField()
    impact_of_tests = models.CharField(max_length=20, choices=IMPACT_CHOICES, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vapt_scope'
        ordering = ['s_no']
    
    def __str__(self):
        return f"Scope {self.s_no} - {self.penetration_testing}"


class VaptResult(models.Model):
    CRITICALITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'), 
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]
    
    RESULT_CHOICES = [
        ('PASS', 'Pass'),
        ('FAIL', 'Fail'),
        ('NOT_APPLICABLE', 'Not Applicable'),
        ('PARTIAL', 'Partial'),
    ]
    
    ENVIRONMENT_CHOICES = [
        ('PRODUCTION', 'Production'),
        ('STAGING', 'Staging'),
        ('DEVELOPMENT', 'Development'),
        ('UAT', 'UAT'),
    ]
    
    excel_upload = models.ForeignKey(ExcelUpload, on_delete=models.CASCADE, related_name='vapt_results')
    vulnerability_id = models.CharField(max_length=50)
    vulnerability_name = models.CharField(max_length=300)
    description = models.TextField()
    tested_environment = models.CharField(max_length=20, choices=ENVIRONMENT_CHOICES)
    result = models.CharField(max_length=20, choices=RESULT_CHOICES)
    reporting_evidence = models.TextField()
    source_of_identification = models.CharField(max_length=200)
    cvss_criticality = models.CharField(
        max_length=20, 
        choices=CRITICALITY_CHOICES,
        help_text="Criticality based on CVSS score"
    )
    business_criticality = models.CharField(
        max_length=20,
        choices=CRITICALITY_CHOICES, 
        help_text="Criticality based on business context"
    )
    stakeholders = models.CharField(max_length=300)
    stakeholder_remarks = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vapt_results'
        ordering = ['vulnerability_id']
        constraints = [
            models.UniqueConstraint(fields=['excel_upload', 'vulnerability_id'], name='uniq_upload_vuln')
        ]
    
    def __str__(self):
        return f"{self.vulnerability_id} - {self.vulnerability_name}"


class KPIMetrics(models.Model):
    excel_upload = models.OneToOneField(ExcelUpload, on_delete=models.CASCADE, related_name='kpi_metrics')
    
    # Proposal metrics
    total_proposals = models.IntegerField(default=0)
    proposals_by_year = models.JSONField(default=dict)
    
    # Scope metrics  
    total_scopes = models.IntegerField(default=0)
    scopes_by_impact = models.JSONField(default=dict)
    scopes_by_year = models.JSONField(default=dict)
    
    # VAPT Results metrics
    total_vulnerabilities = models.IntegerField(default=0)
    vulnerabilities_by_criticality = models.JSONField(default=dict)
    vulnerabilities_by_environment = models.JSONField(default=dict)
    vulnerabilities_by_result = models.JSONField(default=dict)
    
    # Timeline metrics
    avg_testing_timeline = models.FloatField(null=True, blank=True)
    avg_remediation_timeline = models.FloatField(null=True, blank=True)
    
    calculated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vapt_kpi_metrics'
    
    def __str__(self):
        return f"KPI Metrics for upload {self.excel_upload.id}"
