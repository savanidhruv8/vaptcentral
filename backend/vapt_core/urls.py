from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'excel-uploads', views.ExcelUploadViewSet)
router.register(r'proposals', views.ProposalViewSet)
router.register(r'scopes', views.ScopeViewSet)
router.register(r'vapt-results', views.VaptResultViewSet)
router.register(r'kpi-metrics', views.KPIMetricsViewSet)
router.register(r'users', views.UserManagementViewSet)

urlpatterns = [
    path('', views.test, name='root'),
    path('api/', include(router.urls)),
    path('api/test/', views.test, name='api-test'),
    path('api/dashboard-stats/', views.dashboard_stats, name='dashboard-stats'),
    path('api/vulnerability-analytics/', views.vulnerability_analytics, name='vulnerability-analytics'),
    path('api/timeline-analysis/', views.timeline_analysis, name='timeline-analysis'),
    path('api/export-data/', views.export_data, name='export-data'),
    path('api/reset-dataset/', views.reset_dataset, name='reset-dataset'),
    
    # Authentication URLs
    path('api/auth/login/', views.login, name='login'),
    path('api/auth/logout/', views.logout, name='logout'),
    path('api/auth/profile/', views.user_profile, name='user-profile'),
    path('api/auth/token/refresh/', views.refresh_token, name='token-refresh'),
    
    # Password Reset URLs
    path('api/auth/password-reset/', views.request_password_reset, name='password-reset'),
    path('api/auth/verify-otp/', views.verify_otp, name='verify-otp'),
    path('api/auth/reset-password/', views.reset_password, name='reset-password'),
    
    # Account Activation URLs
    path('api/auth/activation/<str:token>/', views.get_activation_user, name='get-activation-user'),
    path('api/auth/activate/<str:token>/', views.activate_account, name='activate-account'),
]