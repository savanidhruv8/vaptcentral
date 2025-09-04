from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FileUploadParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Count, Q
from django.utils import timezone
from django.contrib.auth import authenticate
from datetime import datetime, timedelta
import uuid

from .models import CustomUser, ExcelUpload, Proposal, Scope, VaptResult, KPIMetrics
from .serializers import (
    UserSerializer, UserCreateSerializer, LoginSerializer, PasswordResetSerializer,
    OTPVerifySerializer, PasswordChangeSerializer, AccountActivationSerializer,
    ExcelUploadSerializer, ProposalSerializer, ScopeSerializer,
    VaptResultSerializer, KPIMetricsSerializer, DashboardStatsSerializer,
    VulnerabilityStatsSerializer, TimelineAnalysisSerializer
)
from .utils import ExcelProcessor, calculate_global_kpis


# Authentication Views
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    """User login endpoint"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout(request):
    """User logout endpoint"""
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Successfully logged out'})
    except Exception as e:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """Get current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def refresh_token(request):
    """Refresh JWT token"""
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        token = RefreshToken(refresh_token)
        new_access_token = str(token.access_token)
        
        return Response({
            'access': new_access_token
        })
    except Exception as e:
        return Response({'error': 'Invalid refresh token'}, 
                      status=status.HTTP_401_UNAUTHORIZED)


# User Management Views (Super Admin Only)
class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only super admins can access user management
        if not self.request.user.is_super_admin():
            return CustomUser.objects.none()
        return CustomUser.objects.all().order_by('-date_joined')
    
    def create(self, request, *args, **kwargs):
        """Create new user (Super Admin only)"""
        if not request.user.is_super_admin():
            return Response({'error': 'Only super admins can create users'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Send activation email
            if user.send_activation_email():
                return Response({
                    'message': 'User created successfully. Activation email sent.',
                    'user': UserSerializer(user).data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'message': 'User created but failed to send activation email.',
                    'user': UserSerializer(user).data
                }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def promote(self, request, pk=None):
        """Promote user to admin (Super Admin only)"""
        if not request.user.is_super_admin():
            return Response({'error': 'Only super admins can promote users'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        user = self.get_object()
        if user.role == 'general_user':
            user.role = 'admin'
            user.save()
            return Response({'message': f'{user.email} promoted to admin'})
        return Response({'error': 'User is already admin or super admin'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def demote(self, request, pk=None):
        """Demote admin to general user (Super Admin only)"""
        if not request.user.is_super_admin():
            return Response({'error': 'Only super admins can demote users'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        user = self.get_object()
        if user.role == 'admin':
            user.role = 'general_user'
            user.save()
            return Response({'message': f'{user.email} demoted to general user'})
        return Response({'error': 'Cannot demote super admin or general user'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate user account (Super Admin only)"""
        if not request.user.is_super_admin():
            return Response({'error': 'Only super admins can activate users'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'message': f'{user.email} activated'})
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate user account (Super Admin only)"""
        if not request.user.is_super_admin():
            return Response({'error': 'Only super admins can deactivate users'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'message': f'{user.email} deactivated'})


# Password Reset Views
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def request_password_reset(request):
    """Request password reset with OTP"""
    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = CustomUser.objects.get(email=email)
            if user.send_password_reset_email():
                return Response({'message': 'OTP sent to your email'})
            else:
                return Response({'error': 'Failed to send OTP'}, 
                              status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_otp(request):
    """Verify OTP for password reset"""
    serializer = OTPVerifySerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        
        try:
            user = CustomUser.objects.get(email=email)
            if (user.otp_code == otp and 
                user.otp_expires and 
                timezone.now() < user.otp_expires):
                # Generate password reset token
                user.password_reset_token = str(uuid.uuid4())
                user.password_reset_token_expires = timezone.now() + timezone.timedelta(hours=1)
                user.save()
                
                return Response({
                    'message': 'OTP verified successfully',
                    'reset_token': user.password_reset_token
                })
            else:
                return Response({'error': 'Invalid or expired OTP'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    """Reset password using reset token"""
    reset_token = request.data.get('reset_token')
    serializer = PasswordChangeSerializer(data=request.data)
    
    if not reset_token:
        return Response({'error': 'Reset token required'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    
    if serializer.is_valid():
        try:
            user = CustomUser.objects.get(
                password_reset_token=reset_token,
                password_reset_token_expires__gt=timezone.now()
            )
            user.set_password(serializer.validated_data['new_password'])
            user.password_reset_token = None
            user.password_reset_token_expires = None
            user.otp_code = None
            user.otp_expires = None
            user.save()
            
            return Response({'message': 'Password reset successfully'})
        except CustomUser.DoesNotExist:
            return Response({'error': 'Invalid or expired reset token'}, 
                          status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Account Activation Views
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_activation_user(request, token):
    """Get user details for activation"""
    try:
        # Ensure token is a valid UUID; invalid format should return 400, not 500
        token_uuid = uuid.UUID(str(token))
        user = CustomUser.objects.get(
            activation_token=token_uuid,
            activation_token_expires__gt=timezone.now()
        )
        return Response({
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name
        })
    except (ValueError, CustomUser.DoesNotExist):
        return Response({'error': 'Invalid or expired activation token'}, 
                      status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def activate_account(request, token):
    """Activate user account with password"""
    serializer = AccountActivationSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            # Ensure token is a valid UUID; invalid format should return 400, not 500
            token_uuid = uuid.UUID(str(token))
            user = CustomUser.objects.get(
                activation_token=token_uuid,
                activation_token_expires__gt=timezone.now()
            )
            
            # Check if user is already activated
            if user.is_activated:
                return Response({'error': 'Account is already activated'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.validated_data['password'])
            user.is_activated = True
            user.activation_token = None
            user.activation_token_expires = None
            
            try:
                user.save()
            except Exception as save_error:
                return Response({'error': f'Failed to activate account: {str(save_error)}'}, 
                              status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({'message': 'Account activated successfully'})
        except (ValueError, CustomUser.DoesNotExist):
            return Response({'error': 'Invalid or expired activation token'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Activation failed: {str(e)}'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def test(request):
    return Response({
        'message': 'API is working',
        'timestamp': timezone.now().isoformat()
    })


class ExcelUploadViewSet(viewsets.ModelViewSet):
    queryset = ExcelUpload.objects.all()
    serializer_class = ExcelUploadSerializer
    parser_classes = [MultiPartParser, FileUploadParser]
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only admin and super admin users can upload files
        if not self.request.user.can_upload():
            return ExcelUpload.objects.none()
        return ExcelUpload.objects.all().order_by('-uploaded_at')
    
    def create(self, request, *args, **kwargs):
        # Check if user can upload
        if not request.user.can_upload():
            return Response({
                'error': 'Only admin and super admin users can upload files'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            excel_upload = serializer.save()
            
            # Process the Excel file asynchronously or synchronously
            try:
                processor = ExcelProcessor(excel_upload)
                results = processor.process_excel_file()
                
                return Response({
                    'upload': ExcelUploadSerializer(excel_upload).data,
                    'processing_results': results
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                excel_upload.delete()
                return Response({
                    'error': f'Failed to process Excel file: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def reprocess(self, request, pk=None):
        # Check if user can upload
        if not request.user.can_upload():
            return Response({
                'error': 'Only admin and super admin users can reprocess files'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            excel_upload = self.get_object()
            
            # Delete existing data for this upload
            Proposal.objects.filter(excel_upload=excel_upload).delete()
            Scope.objects.filter(excel_upload=excel_upload).delete()
            VaptResult.objects.filter(excel_upload=excel_upload).delete()
            KPIMetrics.objects.filter(excel_upload=excel_upload).delete()
            
            # Reprocess
            processor = ExcelProcessor(excel_upload)
            results = processor.process_excel_file()
            
            return Response({
                'message': 'File reprocessed successfully',
                'processing_results': results
            })
            
        except Exception as e:
            return Response({
                'error': f'Failed to reprocess file: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


class ProposalViewSet(viewsets.ModelViewSet):
    queryset = Proposal.objects.all()
    serializer_class = ProposalSerializer
    
    def get_queryset(self):
        queryset = Proposal.objects.all()
        excel_upload_id = self.request.query_params.get('excel_upload', None)
        year = self.request.query_params.get('year', None)
        stakeholder = self.request.query_params.get('stakeholder', None)
        
        if excel_upload_id:
            queryset = queryset.filter(excel_upload_id=excel_upload_id)
        if year:
            queryset = queryset.filter(last_tested_year=year)
        if stakeholder:
            queryset = queryset.filter(stakeholder__icontains=stakeholder)
            
        return queryset.order_by('s_no')


class ScopeViewSet(viewsets.ModelViewSet):
    queryset = Scope.objects.all()
    serializer_class = ScopeSerializer
    
    def get_queryset(self):
        queryset = Scope.objects.all()
        excel_upload_id = self.request.query_params.get('excel_upload', None)
        impact = self.request.query_params.get('impact', None)
        year = self.request.query_params.get('year', None)
        stakeholder = self.request.query_params.get('stakeholder', None)
        
        if excel_upload_id:
            queryset = queryset.filter(excel_upload_id=excel_upload_id)
        if impact:
            queryset = queryset.filter(impact_of_tests=impact)
        if year:
            queryset = queryset.filter(last_tested_year=year)
        if stakeholder:
            queryset = queryset.filter(stakeholder__icontains=stakeholder)
            
        return queryset.order_by('s_no')


class VaptResultViewSet(viewsets.ModelViewSet):
    queryset = VaptResult.objects.all()
    serializer_class = VaptResultSerializer
    
    def get_queryset(self):
        queryset = VaptResult.objects.all()
        excel_upload_id = self.request.query_params.get('excel_upload', None)
        criticality = self.request.query_params.get('criticality', None)
        environment = self.request.query_params.get('environment', None)
        result = self.request.query_params.get('result', None)
        
        if excel_upload_id:
            queryset = queryset.filter(excel_upload_id=excel_upload_id)
        if criticality:
            queryset = queryset.filter(
                Q(cvss_criticality=criticality) | Q(business_criticality=criticality)
            )
        if environment:
            queryset = queryset.filter(tested_environment=environment)
        if result:
            queryset = queryset.filter(result=result)
            
        return queryset.order_by('vulnerability_id')


class KPIMetricsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = KPIMetrics.objects.all()
    serializer_class = KPIMetricsSerializer
    
    def get_queryset(self):
        queryset = KPIMetrics.objects.all()
        excel_upload_id = self.request.query_params.get('excel_upload', None)
        
        if excel_upload_id:
            queryset = queryset.filter(excel_upload_id=excel_upload_id)
            
        return queryset.order_by('-calculated_at')


@api_view(['GET'])
def dashboard_stats(request):
    try:
        global_stats = calculate_global_kpis()
        
        # Get recent uploads
        recent_uploads = ExcelUpload.objects.filter(
            processed=True
        ).order_by('-uploaded_at')[:5]
        
        global_stats['recent_uploads'] = ExcelUploadSerializer(
            recent_uploads, many=True
        ).data
        
        serializer = DashboardStatsSerializer(global_stats)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({
            'error': f'Failed to calculate dashboard stats: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def vulnerability_analytics(request):
    try:
        excel_upload_id = request.query_params.get('excel_upload', None)
        environment_filter = request.query_params.get('environment', None)
        
        if excel_upload_id:
            vulns = VaptResult.objects.filter(excel_upload_id=excel_upload_id)
        else:
            vulns = VaptResult.objects.all()
        
        if environment_filter:
            vulns = vulns.filter(tested_environment=environment_filter)
        
        # By CVSS criticality
        by_criticality = vulns.values('cvss_criticality').annotate(
            count=Count('id')
        ).order_by('cvss_criticality')
        
        criticality_data = {item['cvss_criticality'] or 'Unknown': item['count'] 
                          for item in by_criticality}

        # By Business Context criticality
        by_business_crit = vulns.values('business_criticality').annotate(
            count=Count('id')
        ).order_by('business_criticality')
        
        business_criticality_data = {item['business_criticality'] or 'Unknown': item['count']
                          for item in by_business_crit}
        
        # By environment
        by_environment = vulns.values('tested_environment').annotate(
            count=Count('id')
        ).order_by('tested_environment')
        
        environment_data = {item['tested_environment'] or 'Unknown': item['count'] 
                          for item in by_environment}
        
        # By result
        by_result = vulns.values('result').annotate(
            count=Count('id')
        ).order_by('result')
        
        result_data = {item['result'] or 'Unknown': item['count'] 
                      for item in by_result}
        
        # Trend data (last 6 months)
        six_months_ago = timezone.now() - timedelta(days=180)
        trend_vulns = vulns.filter(created_at__gte=six_months_ago)
        
        trend_data = {}
        for i in range(6):
            month_start = timezone.now() - timedelta(days=(i+1)*30)
            month_end = timezone.now() - timedelta(days=i*30)
            
            month_count = trend_vulns.filter(
                created_at__gte=month_start,
                created_at__lt=month_end
            ).count()
            
            month_name = month_start.strftime('%b %Y')
            trend_data[month_name] = month_count
        
        analytics_data = {
            'by_criticality': criticality_data,
            'by_business_criticality': business_criticality_data,
            'by_environment': environment_data,
            'by_result': result_data,
            'trend_data': trend_data
        }
        
        serializer = VulnerabilityStatsSerializer(analytics_data)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({
            'error': f'Failed to calculate vulnerability analytics: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def timeline_analysis(request):
    try:
        excel_upload_id = request.query_params.get('excel_upload', None)
        
        if excel_upload_id:
            proposals = Proposal.objects.filter(excel_upload_id=excel_upload_id)
            scopes = Scope.objects.filter(excel_upload_id=excel_upload_id)
        else:
            proposals = Proposal.objects.all()
            scopes = Scope.objects.all()
        
        # Calculate average timelines (if timeline fields are numeric)
        # For now, we'll just count distributions
        
        # Testing timeline distribution
        testing_timelines = {}
        for proposal in proposals:
            timeline = proposal.testing_timeline or 'Unknown'
            testing_timelines[timeline] = testing_timelines.get(timeline, 0) + 1
        
        # Remediation timeline distribution
        remediation_timelines = {}
        for proposal in proposals:
            timeline = proposal.remediation_timeline or 'Unknown'
            remediation_timelines[timeline] = remediation_timelines.get(timeline, 0) + 1
        
        # Check for overdue items (items where est_test_date has passed)
        today = timezone.now().date()
        overdue_proposals = proposals.filter(
            est_test_date__lt=today
        ).values('id', 'domain', 'est_test_date', 'stakeholder')
        
        overdue_scopes = scopes.filter(
            est_test_date__lt=today
        ).values('id', 'penetration_testing', 'est_test_date', 'stakeholder')
        
        overdue_items = list(overdue_proposals) + list(overdue_scopes)
        
        timeline_data = {
            'avg_testing_timeline': 0.0,  # Would need numeric conversion
            'avg_remediation_timeline': 0.0,  # Would need numeric conversion
            'timeline_distribution': {
                'testing': testing_timelines,
                'remediation': remediation_timelines
            },
            'overdue_items': overdue_items
        }
        
        serializer = TimelineAnalysisSerializer(timeline_data)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({
            'error': f'Failed to calculate timeline analysis: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def export_data(request):
    try:
        data_type = request.query_params.get('type', 'all')
        excel_upload_id = request.query_params.get('excel_upload', None)
        
        export_data = {}
        
        if data_type in ['all', 'proposals']:
            proposals = Proposal.objects.all()
            if excel_upload_id:
                proposals = proposals.filter(excel_upload_id=excel_upload_id)
            export_data['proposals'] = ProposalSerializer(proposals, many=True).data
        
        if data_type in ['all', 'scopes']:
            scopes = Scope.objects.all()
            if excel_upload_id:
                scopes = scopes.filter(excel_upload_id=excel_upload_id)
            export_data['scopes'] = ScopeSerializer(scopes, many=True).data
        
        if data_type in ['all', 'vapt_results']:
            vapt_results = VaptResult.objects.all()
            if excel_upload_id:
                vapt_results = vapt_results.filter(excel_upload_id=excel_upload_id)
            export_data['vapt_results'] = VaptResultSerializer(vapt_results, many=True).data
        
        return Response(export_data)
        
    except Exception as e:
        return Response({
            'error': f'Failed to export data: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reset_dataset(request):
    """
    Reset all dataset by deleting all data from the database.
    Only admin and super admin users can reset data.
    This will delete all ExcelUploads, Proposals, Scopes, VaptResults, and KPIMetrics.
    """
    # Check if user is admin or super admin
    if not request.user.is_admin():
        return Response({
            'error': 'Only admin and super admin users can reset data'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Get counts before deletion for response
        upload_count = ExcelUpload.objects.count()
        proposal_count = Proposal.objects.count()
        scope_count = Scope.objects.count()
        vapt_count = VaptResult.objects.count()
        kpi_count = KPIMetrics.objects.count()
        
        # Delete all data
        ExcelUpload.objects.all().delete()
        Proposal.objects.all().delete()
        Scope.objects.all().delete()
        VaptResult.objects.all().delete()
        KPIMetrics.objects.all().delete()
        
        return Response({
            'message': 'Dataset reset successfully',
            'deleted_counts': {
                'uploads': upload_count,
                'proposals': proposal_count,
                'scopes': scope_count,
                'vapt_results': vapt_count,
                'kpi_metrics': kpi_count
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Failed to reset dataset: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
