import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon,
  DocumentTextIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { 
  getKpiMetrics, 
  getProposals, 
  getScopes, 
  getVaptResults, 
  getVulnerabilityAnalytics 
} from '../../services/api';
import StatCard from '../Dashboard/StatCard';
import DataTable from '../Tables/DataTable';
import Analytics from '../Analytics/Analytics';

const UploadDetails = ({ uploadId, onBack }) => {
  const [uploadData, setUploadData] = useState(null);
  const [kpiMetrics, setKpiMetrics] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [scopes, setScopes] = useState([]);
  const [vaptResults, setVaptResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDataView, setActiveDataView] = useState('analytics');

  useEffect(() => {
    if (uploadId) {
      fetchUploadData();
    }
  }, [uploadId]);

  const fetchUploadData = async () => {
    try {
      setLoading(true);

      // Fetch all data related to this upload
      const [kpiResponse, proposalsResponse, scopesResponse, vaptResponse, analyticsResponse] = await Promise.all([
        getKpiMetrics({ excel_upload: uploadId }),
        getProposals({ excel_upload: uploadId }),
        getScopes({ excel_upload: uploadId }),
        getVaptResults({ excel_upload: uploadId }),
        getVulnerabilityAnalytics({ excel_upload: uploadId })
      ]);

      setKpiMetrics(kpiResponse.data[0] || null);
      setProposals(proposalsResponse.data);
      setScopes(scopesResponse.data);
      setVaptResults(vaptResponse.data);
      setAnalytics(analyticsResponse.data);

    } catch (err) {
      setError('Failed to load upload data');
      console.error('Error fetching upload data:', err);
    } finally {
      setLoading(false);
    }
  };

  const proposalColumns = [
    { key: 's_no', label: 'S.No' },
    { key: 'domain', label: 'Domain' },
    { key: 'stakeholder', label: 'Stakeholder' },
    { 
      key: 'est_test_date', 
      label: 'Est. Test Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    { 
      key: 'last_tested_year', 
      label: 'Last Tested',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value === '2024-25' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value || 'N/A'}
        </span>
      )
    },
  ];

  const scopeColumns = [
    { key: 's_no', label: 'S.No' },
    { key: 'penetration_testing', label: 'Testing Type' },
    { key: 'stakeholder', label: 'Stakeholder' },
    { 
      key: 'impact_of_tests', 
      label: 'Impact',
      render: (value) => {
        const colors = {
          LOW: 'bg-green-100 text-green-800',
          MEDIUM: 'bg-yellow-100 text-yellow-800',
          HIGH: 'bg-orange-100 text-orange-800',
          CRITICAL: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[value] || 'bg-gray-100 text-gray-800'}`}>
            {value || 'N/A'}
          </span>
        );
      }
    },
  ];

  const vaptColumns = [
    { key: 'vulnerability_id', label: 'Vuln ID' },
    { key: 'vulnerability_name', label: 'Name' },
    { 
      key: 'cvss_criticality', 
      label: 'CVSS',
      render: (value) => {
        const colors = {
          LOW: 'bg-green-100 text-green-800',
          MEDIUM: 'bg-yellow-100 text-yellow-800',
          HIGH: 'bg-orange-100 text-orange-800',
          CRITICAL: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[value] || 'bg-gray-100 text-gray-800'}`}>
            {value || 'N/A'}
          </span>
        );
      }
    },
    { 
      key: 'tested_environment', 
      label: 'Environment',
      render: (value) => {
        const colors = {
          PRODUCTION: 'bg-red-100 text-red-800',
          STAGING: 'bg-yellow-100 text-yellow-800',
          DEVELOPMENT: 'bg-green-100 text-green-800',
          UAT: 'bg-blue-100 text-blue-800',
        };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[value] || 'bg-gray-100 text-gray-800'}`}>
            {value || 'N/A'}
          </span>
        );
      }
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={onBack}
          className="mt-2 text-primary-600 hover:text-primary-500 underline"
        >
          ← Back to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center text-primary-600 hover:text-primary-500"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Upload
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analysis Dashboard
          </h2>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <CalendarIcon className="h-4 w-4 mr-1" />
          {kpiMetrics?.calculated_at && new Date(kpiMetrics.calculated_at).toLocaleString()}
        </div>
      </div>

      {/* KPI Summary Cards */}
      {kpiMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Proposals"
            value={kpiMetrics.total_proposals}
            icon={DocumentTextIcon}
            color="blue"
          />
          <StatCard
            title="Scopes"
            value={kpiMetrics.total_scopes}
            icon={ShieldCheckIcon}
            color="green"
          />
          <StatCard
            title="Vulnerabilities"
            value={kpiMetrics.total_vulnerabilities}
            icon={ExclamationTriangleIcon}
            color="yellow"
          />
          <StatCard
            title="Critical Issues"
            value={kpiMetrics.vulnerabilities_by_criticality?.CRITICAL || 0}
            icon={ExclamationTriangleIcon}
            color="red"
          />
        </div>
      )}

      {/* Data Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'analytics', name: 'Analytics Dashboard', icon: ChartBarIcon },
              { id: 'proposals', name: `Proposals (${proposals.length})`, icon: DocumentTextIcon },
              { id: 'scopes', name: `Scopes (${scopes.length})`, icon: ShieldCheckIcon },
              { id: 'vulnerabilities', name: `Vulnerabilities (${vaptResults.length})`, icon: ExclamationTriangleIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDataView(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeDataView === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeDataView === 'analytics' && (
            <div>
              {/* Use the same Analytics component structure */}
              <Analytics 
                colors={{
                  LOW: '#22c55e',
                  MEDIUM: '#f59e0b',
                  HIGH: '#FF0000',
                  CRITICAL: '#8B0000',
                  PRODUCTION: '#ef4444',
                  STAGING: '#f59e0b',
                  DEVELOPMENT: '#22c55e',
                  UAT: '#3b82f6',
                  PASS: '#22c55e',
                  FAIL: '#ef4444',
                  PARTIAL: '#f59e0b',
                  NOT_APPLICABLE: '#6b7280'
                }}
                // Pass upload-specific props to filter analytics
                excelUploadId={uploadId}
              />
            </div>
          )}

          {activeDataView === 'proposals' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Proposals Data</h3>
              <DataTable
                columns={proposalColumns}
                data={proposals}
                loading={false}
                error={null}
              />
            </div>
          )}

          {activeDataView === 'scopes' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scopes Data</h3>
              <DataTable
                columns={scopeColumns}
                data={scopes}
                loading={false}
                error={null}
              />
            </div>
          )}

          {activeDataView === 'vulnerabilities' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vulnerabilities Data</h3>
              <DataTable
                columns={vaptColumns}
                data={vaptResults}
                loading={false}
                error={null}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadDetails;