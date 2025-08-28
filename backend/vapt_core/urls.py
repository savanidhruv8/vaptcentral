from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'excel-uploads', views.ExcelUploadViewSet)
router.register(r'proposals', views.ProposalViewSet)
router.register(r'scopes', views.ScopeViewSet)
router.register(r'vapt-results', views.VaptResultViewSet)
router.register(r'kpi-metrics', views.KPIMetricsViewSet)

urlpatterns = [
    path('', views.test, name='root'),
    path('api/', include(router.urls)),
    path('api/test/', views.test, name='api-test'),
    path('api/dashboard-stats/', views.dashboard_stats, name='dashboard-stats'),
    path('api/vulnerability-analytics/', views.vulnerability_analytics, name='vulnerability-analytics'),
    path('api/timeline-analysis/', views.timeline_analysis, name='timeline-analysis'),
    path('api/export-data/', views.export_data, name='export-data'),
    path('api/reset-dataset/', views.reset_dataset, name='reset-dataset'),
]