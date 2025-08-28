from rest_framework import serializers
from .models import ExcelUpload, Proposal, Scope, VaptResult, KPIMetrics


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