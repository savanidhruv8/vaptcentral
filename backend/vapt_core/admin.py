from django.contrib import admin
from .models import ExcelUpload, Proposal, Scope, VaptResult, KPIMetrics


@admin.register(ExcelUpload)
class ExcelUploadAdmin(admin.ModelAdmin):
    list_display = ['id', 'uploaded_at', 'processed', 'processed_at']
    list_filter = ['processed', 'uploaded_at']
    readonly_fields = ['uploaded_at', 'processed_at']


@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = ['s_no', 'domain', 'stakeholder', 'last_tested_year', 'excel_upload']
    list_filter = ['last_tested_year', 'stakeholder', 'excel_upload']
    search_fields = ['domain', 'stakeholder', 'requirement_statements']
    ordering = ['s_no']


@admin.register(Scope)
class ScopeAdmin(admin.ModelAdmin):
    list_display = ['s_no', 'penetration_testing', 'impact_of_tests', 'stakeholder', 'last_tested_year']
    list_filter = ['impact_of_tests', 'last_tested_year', 'stakeholder', 'excel_upload']
    search_fields = ['penetration_testing', 'description', 'stakeholder']
    ordering = ['s_no']


@admin.register(VaptResult)
class VaptResultAdmin(admin.ModelAdmin):
    list_display = ['vulnerability_id', 'vulnerability_name', 'cvss_criticality', 'business_criticality', 'tested_environment', 'result']
    list_filter = ['cvss_criticality', 'business_criticality', 'tested_environment', 'result', 'excel_upload']
    search_fields = ['vulnerability_id', 'vulnerability_name', 'description']
    ordering = ['vulnerability_id']


@admin.register(KPIMetrics)
class KPIMetricsAdmin(admin.ModelAdmin):
    list_display = ['excel_upload', 'total_proposals', 'total_scopes', 'total_vulnerabilities', 'calculated_at']
    list_filter = ['calculated_at']
    readonly_fields = ['calculated_at']
