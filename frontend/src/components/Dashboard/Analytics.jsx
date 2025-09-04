import React, { useState, useEffect } from 'react';
import { getVulnerabilityAnalytics } from '../../services/api';
import AnalyticsFilters from './AnalyticsFilters';
import AnalyticsCharts from './AnalyticsCharts';
import AnalyticsSummary from './AnalyticsSummary';
import AnalyticsModal from './AnalyticsModal';

const RESULT_OPTIONS = [
  'Remediated',
  'Risk Accepted',
  'Plan for Remediation',
  'No evidence of remediation',
  'Unresolved',
  'Risk Avoided',
];

const Analytics = ({ colors = {}, excelUploadId = null }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [environmentFilter, setEnvironmentFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [environmentOptions, setEnvironmentOptions] = useState([]);
  const [vaptItemsForBars, setVaptItemsForBars] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalItems, setModalItems] = useState([]);

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

  // Fetch raw results for stacked bar (Result x Business Criticality)
  useEffect(() => {
    const fetchForBars = async () => {
      try {
        const params = {};
        if (excelUploadId) params.excel_upload = excelUploadId;
        if (environmentFilter) params.environment = environmentFilter;
        if (resultFilter) params.result = resultFilter;
        const { default: api, getVaptResults } = await import('../../services/api');
        const accumulate = async () => {
          const items = [];
          let response = await getVaptResults(params);
          const data = response?.data;
          if (Array.isArray(data)) {
            return data;
          }
          // Paginated shape { count, next, previous, results }
          if (data?.results) {
            items.push(...data.results);
            let nextUrl = data.next;
            while (nextUrl) {
              const nextRes = await api.get(nextUrl);
              const nextData = nextRes?.data;
              if (nextData?.results?.length) {
                items.push(...nextData.results);
                nextUrl = nextData.next;
              } else {
                nextUrl = null;
              }
            }
            return items;
          }
          return [];
        };
        const allItems = await accumulate();
        setVaptItemsForBars(allItems);
      } catch (e) {
        setVaptItemsForBars([]);
      }
    };
    fetchForBars();
  }, [excelUploadId, environmentFilter, resultFilter]);

  // Handle chart clicks to open modal
  const handleChartClick = (chartType, entry) => {
    let title = '';
    let filterFn = () => true;

    switch (chartType) {
      case 'criticality':
        title = `CVSS Criticality: ${entry.name}`;
        filterFn = (it) => it?.cvss_criticality === entry.name;
        break;
      case 'businessCriticality':
        title = `Business Criticality: ${entry.name}`;
        filterFn = (it) => it?.business_criticality === entry.name;
        break;
      case 'result':
        title = `Result: ${entry.name}`;
        filterFn = (it) => it?.result === entry.name;
        break;
      case 'barSegment':
        const resultName = entry.data?.payload?.name;
        const critKey = entry.critKey;
        title = `Result: ${resultName} • Business Criticality: ${critKey}`;
        const normalize = (v) => String(v ?? '').trim().toUpperCase();
        filterFn = (it) => normalize(it?.result) === normalize(resultName) && normalize(it?.business_criticality) === normalize(critKey);
        break;
      default:
        return;
    }

    const items = vaptItemsForBars.filter(filterFn);
    setModalTitle(`${title} • ${items.length} item(s)`);
    setModalItems(items);
    setIsModalOpen(true);
  };

  // Handle export functionality
  const handleExport = (items) => {
    // Convert items to CSV format
    const headers = ['Vulnerability ID', 'Vulnerability Name', 'Result', 'CVSS Criticality', 'Business Criticality', 'Environment'];
    const csvContent = [
      headers.join(','),
      ...items.map(item => [
        item.vulnerability_id || '',
        `"${(item.vulnerability_name || '').replace(/"/g, '""')}"`,
        item.result || '',
        item.cvss_criticality || '',
        item.business_criticality || '',
        item.tested_environment || ''
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vapt_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">VAPT Dashboard (Flipp)</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {excelUploadId 
                ? 'Vulnerability analysis for this specific upload' 
                : 'A centralized dashboard for managing Vulnerability Assessment and Penetration Testing (VAPT) results, including remediation outcomes.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnalyticsFilters
        environmentFilter={environmentFilter}
        setEnvironmentFilter={setEnvironmentFilter}
        resultFilter={resultFilter}
        setResultFilter={setResultFilter}
        environmentOptions={environmentOptions}
        resultOptions={RESULT_OPTIONS}
      />

      {/* Charts */}
      <AnalyticsCharts
        analytics={analytics}
        vaptItemsForBars={vaptItemsForBars}
        environmentOptions={environmentOptions}
        onChartClick={handleChartClick}
      />

      {/* Summary */}
      <AnalyticsSummary analytics={analytics} />

      {/* Enhanced Modal */}
      <AnalyticsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalTitle={modalTitle}
        modalItems={modalItems}
        onExport={handleExport}
      />
    </div>
  );
};

export default Analytics;
