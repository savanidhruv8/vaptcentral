from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from .models import CustomUser, ExcelUpload, Proposal, Scope, VaptResult, KPIMetrics


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'company_name', 'contact', 'role', 'is_active', 'is_activated',
            'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    
    class Meta:
        model = CustomUser
        fields = [
            'username', 'email', 'first_name', 'last_name', 
            'company_name', 'contact', 'role', 'password'
        ]
    
    def validate(self, attrs):
        # Auto-generate username if not provided
        email = attrs.get('email')
        username = attrs.get('username')
        if not username and email:
            base_username = email.split('@')[0]
            candidate_username = base_username
            suffix = 1
            # Ensure uniqueness
            while CustomUser.objects.filter(username=candidate_username).exists():
                candidate_username = f"{base_username}{suffix}"
                suffix += 1
            attrs['username'] = candidate_username
        elif username:
            # If provided username collides, derive a unique one based on it
            if CustomUser.objects.filter(username=username).exists():
                base_username = username
                candidate_username = base_username
                suffix = 1
                while CustomUser.objects.filter(username=candidate_username).exists():
                    candidate_username = f"{base_username}{suffix}"
                    suffix += 1
                attrs['username'] = candidate_username
        return attrs

    def create(self, validated_data):
        # If no password is provided, generate a temporary one
        if 'password' not in validated_data:
            validated_data['password'] = CustomUser.objects.make_random_password()
        
        user = CustomUser.objects.create_user(**validated_data)
        user.activation_token_expires = timezone.now() + timezone.timedelta(hours=24)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid email or password.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            if not user.is_activated:
                raise serializers.ValidationError('Please activate your account first.')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include email and password.')


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


class PasswordChangeSerializer(serializers.Serializer):
    new_password = serializers.CharField(validators=[validate_password])
    confirm_password = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs


class AccountActivationSerializer(serializers.Serializer):
    password = serializers.CharField(validators=[validate_password])
    confirm_password = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs


class ExcelUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExcelUpload
        fields = ['id', 'file', 'uploaded_at', 'processed', 'processed_at']
        read_only_fields = ['id', 'uploaded_at', 'processed', 'processed_at']


class ProposalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proposal
        fields = [
            'id', 'excel_upload', 's_no', 'domain', 'testing_scope_avenues',
            'methodology_overview', 'key_deliverables', 'key_dependencies',
            'est_test_date', 'est_start_date', 'testing_timeline',
            'remediation_timeline', 'stakeholder', 'last_tested_year',
            'requirement_statements', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ScopeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scope
        fields = [
            'id', 'excel_upload', 's_no', 'penetration_testing', 'description',
            'key_deliverables', 'key_dependencies', 'est_test_date',
            'est_start_date', 'testing_timeline', 'remediation_timeline',
            'stakeholder', 'last_tested_year', 'requirement_statements',
            'impact_of_tests', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class VaptResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaptResult
        fields = [
            'id', 'excel_upload', 'vulnerability_id', 'vulnerability_name',
            'description', 'tested_environment', 'result', 'reporting_evidence',
            'source_of_identification', 'cvss_criticality', 'business_criticality',
            'stakeholders', 'stakeholder_remarks', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class KPIMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = KPIMetrics
        fields = [
            'id', 'excel_upload', 'total_proposals', 'proposals_by_year',
            'total_scopes', 'scopes_by_impact', 'scopes_by_year',
            'total_vulnerabilities', 'vulnerabilities_by_criticality',
            'vulnerabilities_by_environment', 'vulnerabilities_by_result',
            'avg_testing_timeline', 'avg_remediation_timeline', 'calculated_at'
        ]
        read_only_fields = ['id', 'calculated_at']


class DashboardStatsSerializer(serializers.Serializer):
    total_uploads = serializers.IntegerField()
    total_proposals = serializers.IntegerField()
    total_scopes = serializers.IntegerField()
    total_vulnerabilities = serializers.IntegerField()
    critical_vulnerabilities = serializers.IntegerField()
    high_vulnerabilities = serializers.IntegerField()
    recent_uploads = ExcelUploadSerializer(many=True)


class VulnerabilityStatsSerializer(serializers.Serializer):
    by_criticality = serializers.DictField()
    by_business_criticality = serializers.DictField()
    by_environment = serializers.DictField()
    by_result = serializers.DictField()
    trend_data = serializers.DictField()


class TimelineAnalysisSerializer(serializers.Serializer):
    avg_testing_timeline = serializers.FloatField()
    avg_remediation_timeline = serializers.FloatField()
    timeline_distribution = serializers.DictField()
    overdue_items = serializers.ListField()