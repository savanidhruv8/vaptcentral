import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer
} from 'recharts';
import { getVulnerabilityAnalytics } from '../../services/api';

const DEFAULT_COLORS = {
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
};

const RESULT_OPTIONS = [
  'Remediated',
  'Risk Accepted',
  'Plan for Remediation',
  'No evidence of remediation',
  'Unresolved',
  'Risk Avoided',
];

const CRITICALITY_KEYS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

// Custom label renderer to reduce overlap when values are 0%
const renderPieLabel = ({ cx, cy, midAngle, outerRadius, percent, name, value, index }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 12;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  // Offset labels for zero values to avoid overlap
  const hasValue = !!percent && value !== 0;
  const dy = hasValue ? 0 : (index % 2 === 0 ? -12 : 14);
  const anchor = x > cx ? 'start' : 'end';
  return (
    <text x={x} y={y} dy={dy} textAnchor={anchor} fill="#ffffff">
      {`${name}: ${((percent || 0) * 100).toFixed(0)}%`}
    </text>
  );
};

const Analytics = ({ colors = {}, excelUploadId = null }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [environmentFilter, setEnvironmentFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [environmentOptions, setEnvironmentOptions] = useState([]);

  const COLORS = { ...DEFAULT_COLORS, ...colors };

  // One-time fetch to populate full environment options list (unfiltered)
  useEffect(() => {
    const fetchAllEnvOptions = async () => {
      try {
        const res = await getVulnerabilityAnalytics({});
        const allEnvs = Object.keys(res?.data?.by_environment || {});
        setEnvironmentOptions(allEnvs);
      } catch (e) {
        // If this fails, we fall back to options from filtered data later
      }
    };
    if (environmentOptions.length === 0) {
      fetchAllEnvOptions();
    }
  }, [environmentOptions.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = {};
        if (excelUploadId) params.excel_upload = excelUploadId;
        if (environmentFilter) params.environment = environmentFilter;
        if (resultFilter) params.result = resultFilter;
        const response = await getVulnerabilityAnalytics(params);
        setAnalytics(response.data);
        // If environmentOptions not yet set, initialize from current data
        if (environmentOptions.length === 0) {
          const currentEnvs = Object.keys(response?.data?.by_environment || {});
          if (currentEnvs.length > 0) setEnvironmentOptions(currentEnvs);
        }
      } catch (err) {
        setError('Failed to load analytics data');
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [excelUploadId, environmentFilter, resultFilter]);

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
      </div>
    );
  }

  // Prepare data for charts (criticality and business criticality)
  const criticalityData = CRITICALITY_KEYS.map(key => ({
    name: key,
    count: (analytics?.by_criticality || {})[key] || 0,
    fill: COLORS[key] || '#6b7280'
  }));

  const businessCriticalityData = Object.entries(analytics?.by_business_criticality || {}).map(([key, value]) => ({
    name: key,
    count: value,
    fill: COLORS[key] || '#6b7280'
  }));

  // Third pie: Result distribution (based on analytics.by_result)
  const RESULT_COLORS = {
    'Remediated': '#22c55e',
    'Risk Accepted': '#3b82f6',
    'Plan for Remediation': '#f59e0b',
    'No evidence of remediation': '#a855f7',
    'Unresolved': '#ef4444',
    'Risk Avoided': '#10b981',
  };
  const resultDistributionData = RESULT_OPTIONS.map(name => ({
    name,
    count: (analytics?.by_result || {})[name] || 0,
    fill: RESULT_COLORS[name] || '#6b7280'
  })).filter(item => item.count > 0);

  // Environment options (exclude Production/Development)
  const envOptionsRaw = environmentOptions.length > 0
    ? environmentOptions
    : Object.keys(analytics?.by_environment || {});
  const envOptions = envOptionsRaw.filter(env => {
    const v = String(env).toLowerCase();
    return v !== 'production' && v !== 'development';
  });

  const legendStyle = { color: '#ffffff' };
  const tooltipStyles = {
    contentStyle: { backgroundColor: 'rgba(17,24,39,0.9)', border: 'none', color: '#ffffff' },
    itemStyle: { color: '#ffffff' },
    labelStyle: { color: '#ffffff' }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {excelUploadId 
                ? 'Vulnerability analysis for this specific upload' 
                : 'Comprehensive vulnerability analysis and insights'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 mb-6 bg-neutral-900 text-white rounded-lg border border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-300">Tested Environment</span>
            <select
              className="input-base px-3 py-1.5"
              value={environmentFilter}
              onChange={(e) => setEnvironmentFilter(e.target.value)}
            >
              <option value="">All Environments</option>
              {envOptions.map(env => (
                <option key={env} value={env}>{env}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-300">Result</span>
            <select
              className="input-base px-3 py-1.5"
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
            >
              <option value="">All Results</option>
              {RESULT_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Criticality based on CVSS score */}
        <div className="p-6 bg-neutral-900 text-white rounded-lg border border-neutral-800">
          <h3 className="text-lg font-semibold text-white mb-4">Criticality based on CVSS score</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={criticalityData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="count"
                labelLine={false}
                label={renderPieLabel}
              >
                {criticalityData.map((entry, index) => (
                  <Cell key={`cvss-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyles} />
              <Legend wrapperStyle={legendStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Criticality Based in Business Context */}
        <div className="p-6 bg-neutral-900 text-white rounded-lg border border-neutral-800">
          <h3 className="text-lg font-semibold text-white mb-4">Criticality Based in Business Context</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={businessCriticalityData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="count"
                labelLine={false}
                label={renderPieLabel}
              >
                {businessCriticalityData.map((entry, index) => (
                  <Cell key={`biz-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyles} />
              <Legend wrapperStyle={legendStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* By Result (Overall) */}
        <div className="p-6 bg-neutral-900 text-white rounded-lg border border-neutral-800">
          <h3 className="text-lg font-semibold text-white mb-4">By Result</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={resultDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="count"
                labelLine={false}
                label={renderPieLabel}
              >
                {resultDistributionData.map((entry, index) => (
                  <Cell key={`res-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyles} />
              <Legend wrapperStyle={legendStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-6 bg-neutral-900 text-white rounded-lg border border-neutral-800">
        <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-medium text-neutral-300">Total Vulnerabilities</h4>
            <p className="text-2xl font-bold text-white">
              {Object.values(analytics?.by_criticality || {}).reduce((a, b) => a + b, 0)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-neutral-300">Critical & High</h4>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {(analytics?.by_criticality?.CRITICAL || 0) + (analytics?.by_criticality?.HIGH || 0)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-neutral-300">Failed Tests</h4>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {analytics?.by_result?.FAIL || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
