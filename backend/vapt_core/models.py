from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.core.mail import send_mail
from django.conf import settings
import uuid
import secrets


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('super_admin', 'Super Admin'),
        ('admin', 'Admin'),
        ('general_user', 'General User'),
    ]
    
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    company_name = models.CharField(max_length=200, blank=True, null=True)
    contact = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='general_user')
    is_activated = models.BooleanField(default=False)
    activation_token = models.UUIDField(default=uuid.uuid4, editable=False, null=True, blank=True)
    activation_token_expires = models.DateTimeField(null=True, blank=True)
    password_reset_token = models.CharField(max_length=100, blank=True, null=True)
    password_reset_token_expires = models.DateTimeField(null=True, blank=True)
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_expires = models.DateTimeField(null=True, blank=True)
    
    # Override the related names to avoid conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name='customuser_set',
        related_query_name='customuser',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='customuser_set',
        related_query_name='customuser',
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'custom_user'
    
    def __str__(self):
        return f"{self.email} ({self.role})"
    
    def is_super_admin(self):
        return self.role == 'super_admin'
    
    def is_admin(self):
        return self.role in ['super_admin', 'admin']
    
    def can_upload(self):
        return self.role in ['super_admin', 'admin']
    
    def send_activation_email(self):
        """Send activation email to user"""
        activation_url = f"{settings.FRONTEND_URL}/activate/{self.activation_token}/"
        subject = 'Activate Your VAPT Dashboard Account'
        message = f"""
        Hello {self.first_name},
        
        Welcome to VAPT Dashboard! Please click the link below to activate your account and set your password:
        
        {activation_url}
        
        This link will expire in 24 hours.
        
        Best regards,
        VAPT Dashboard Team
        """
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [self.email],
                fail_silently=False,
            )
            return True
        except Exception as e:
            print(f"Failed to send activation email: {e}")
            return False
    
    def send_password_reset_email(self):
        """Send password reset email with OTP"""
        # Generate 6-digit OTP
        self.otp_code = str(secrets.randbelow(900000) + 100000)
        self.otp_expires = timezone.now() + timezone.timedelta(minutes=15)
        self.save()
        
        subject = 'Password Reset - VAPT Dashboard'
        message = f"""
        Hello {self.first_name},
        
        You requested a password reset for your VAPT Dashboard account.
        
        Your OTP code is: {self.otp_code}
        
        This code will expire in 15 minutes.
        
        If you didn't request this, please ignore this email.
        
        Best regards,
        VAPT Dashboard Team
        """
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [self.email],
                fail_silently=False,
            )
            return True
        except Exception as e:
            print(f"Failed to send password reset email: {e}")
            return False


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
