import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Label
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
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  // Only show labels for values > 0
  if (!value || value === 0) return null;
  
  const anchor = x > cx ? 'start' : 'end';
  const fill = '#ffffff';
  
  // Special handling for "Plan for Remediation" to prevent overlap
  if (name === 'Plan for Remediation') {
    return (
      <g>
        <text x={x} y={y - 8} textAnchor={anchor} fill={fill} fontSize={16} fontWeight={600}>
          Plan for
        </text>
        <text x={x} y={y + 8} textAnchor={anchor} fill={fill} fontSize={16} fontWeight={600}>
          Remediation: {((percent || 0) * 100).toFixed(0)}%
        </text>
      </g>
    );
  }
  
  // Regular single-line labels for other items
  return (
    <text x={x} y={y} textAnchor={anchor} fill={fill} fontSize={16} fontWeight={600}>
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
  const [vaptItemsForBars, setVaptItemsForBars] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalItems, setModalItems] = useState([]);

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
    'Risk Avoided': '#ec4899',
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

  const legendStyle = { color: '#111827' };
  const tooltipStyles = {
    contentStyle: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#111827' },
    itemStyle: { color: '#111827' },
    labelStyle: { color: '#111827' }
  };

  // Helper to split long X-axis labels into two balanced lines
  const splitLabelIntoTwoLines = (label) => {
    const words = String(label).split(' ').filter(Boolean);
    if (words.length <= 1) return [label];
    // Try to balance line length by distributing words
    let best = [label];
    let bestDiff = Infinity;
    for (let i = 1; i < words.length; i += 1) {
      const line1 = words.slice(0, i).join(' ');
      const line2 = words.slice(i).join(' ');
      const diff = Math.abs(line1.length - line2.length);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = [line1, line2];
      }
    }
    return best;
  };

  // Custom tick component to render multi-line labels
  const MultiLineXAxisTick = ({ x, y, payload }) => {
    const lines = splitLabelIntoTwoLines(payload?.value ?? '');
    return (
      <text x={x} y={y} fill="#e5e7eb" textAnchor="middle">
        {lines.map((line, idx) => (
          <tspan key={idx} x={x} dy={idx === 0 ? 8 : 14}>{line}</tspan>
        ))}
      </text>
    );
  };

  // Build stacked bar dataset: x-axis = Result, stacks = Business Criticality
  const BAR_RESULTS_ORDER = RESULT_OPTIONS;
  const BAR_CRIT_ORDER = CRITICALITY_KEYS;
  const BAR_CRIT_COLORS = {
    CRITICAL: '#8B0000', // dark red
    HIGH: '#FF0000',     // light red
    MEDIUM: '#f59e0b',   // dark yellow
    LOW: '#15803d',      // dark green
  };
  const SERIES_ORDER = BAR_CRIT_ORDER;
  const getSeriesIndex = (item) => {
    const key = (item && (item.dataKey || item.name)) || '';
    const idx = SERIES_ORDER.indexOf(String(key));
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
  };
  const normalize = (v) => String(v ?? '').trim().toUpperCase();

  const stackedBarData = BAR_RESULTS_ORDER.map(resultName => {
    const row = { name: resultName };
    BAR_CRIT_ORDER.forEach(crit => {
      row[crit] = vaptItemsForBars.filter(item => 
        (normalize(item?.result) === normalize(resultName)) && (normalize(item?.business_criticality) === normalize(crit))
      ).length;
    });
    return row;
  });

  // Modal helpers
  const openModalWithFilter = ({ title, filterFn }) => {
    const items = vaptItemsForBars.filter(filterFn);
    setModalTitle(`${title} • ${items.length} item(s)`);
    setModalItems(items);
    setIsModalOpen(true);
  };

  const handlePieCriticalityClick = (entry) => {
    const crit = entry?.name;
    if (!crit) return;
    openModalWithFilter({
      title: `CVSS Criticality: ${crit}`,
      filterFn: (it) => it?.cvss_criticality === crit,
    });
  };

  const handlePieBusinessCriticalityClick = (entry) => {
    const crit = entry?.name;
    if (!crit) return;
    openModalWithFilter({
      title: `Business Criticality: ${crit}`,
      filterFn: (it) => it?.business_criticality === crit,
    });
  };

  const handlePieResultClick = (entry) => {
    const res = entry?.name;
    if (!res) return;
    openModalWithFilter({
      title: `Result: ${res}`,
      filterFn: (it) => it?.result === res,
    });
  };

  const handleBarSegmentClick = (critKey) => (data) => {
    const resultName = data?.payload?.name;
    if (!resultName) return;
    openModalWithFilter({
      title: `Result: ${resultName} • Business Criticality: ${critKey}`,
      filterFn: (it) => normalize(it?.result) === normalize(resultName) && normalize(it?.business_criticality) === normalize(critKey),
    });
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">VAPT Dashboard (Flipp)</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {excelUploadId 
                ? 'Vulnerability analysis for this specific upload' 
                : 'A centralized dashboard for managing Vulnerability Assessment and Penetration Testing (VAPT) results, including remediation outcomes.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 mb-6 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-lg border border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-gray-700 dark:text-neutral-300">Tested Environment</span>
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
            <span className="text-base font-medium text-gray-700 dark:text-neutral-300">Result</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Criticality based on CVSS score */}
        <div className="p-8 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6 text-center">Criticality Before Blue-Sky Session</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={criticalityData}
                cx="50%"
                cy="50%"
                outerRadius={110}
                dataKey="count"
                labelLine={false}
                label={renderPieLabel}
                paddingAngle={0}
              >
                {criticalityData.map((entry, index) => (
                  <Cell key={`cvss-${index}`} fill={entry.fill} onClick={() => handlePieCriticalityClick(entry)} style={{ cursor: 'pointer' }} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyles} />
              <Legend wrapperStyle={legendStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Criticality Based in Business Context */}
        <div className="p-8 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6 text-center">Criticality After Blue-Sky Session</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={businessCriticalityData}
                cx="50%"
                cy="50%"
                outerRadius={110}
                dataKey="count"
                labelLine={false}
                label={renderPieLabel}
                paddingAngle={0}
              >
                {businessCriticalityData.map((entry, index) => (
                  <Cell key={`biz-${index}`} fill={entry.fill} onClick={() => handlePieBusinessCriticalityClick(entry)} style={{ cursor: 'pointer' }} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyles} />
              <Legend wrapperStyle={legendStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* By Result (Overall) */}
        <div className="p-8 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6 text-center">Remediation Result</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={resultDistributionData}
                cx="50%"
                cy="50%"
                outerRadius={110}
                dataKey="count"
                labelLine={false}
                label={renderPieLabel}
                paddingAngle={0}
              >
                {resultDistributionData.map((entry, index) => (
                  <Cell key={`res-${index}`} fill={entry.fill} onClick={() => handlePieResultClick(entry)} style={{ cursor: 'pointer' }} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyles} />
              <Legend wrapperStyle={legendStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Criticality Based in Business Context — by Result (Grouped Bars, full width) */}
      <div className="mb-8">
        <div className="p-6 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-lg border border-neutral-200 dark:border-neutral-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detailed Remediation Result</h3>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={stackedBarData}
              margin={{ top: 10, right: 20, left: 10, bottom: 24 }}
              barCategoryGap={20}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                interval={0}
                tickLine={false}
              />
              <YAxis tick={{ fill: '#4b5563' }} allowDecimals={false}>
                <Label value="Count" angle={-90} position="insideLeft" fill="#4b5563" />
              </YAxis>
              <Tooltip {...tooltipStyles} itemSorter={(a, b) => getSeriesIndex(a) - getSeriesIndex(b)} />
              <Legend payload={SERIES_ORDER.map(key => ({ value: key, type: 'square', id: key, color: BAR_CRIT_COLORS[key] }))} />
              {BAR_CRIT_ORDER.map(key => (
                <Bar key={key} dataKey={key} fill={BAR_CRIT_COLORS[key]} onClick={handleBarSegmentClick(key)} cursor="pointer" />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-6 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-lg border border-neutral-200 dark:border-neutral-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-neutral-300">Total Vulnerabilities</h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Object.values(analytics?.by_criticality || {}).reduce((a, b) => a + b, 0)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-neutral-300">Critical & High</h4>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {(analytics?.by_criticality?.CRITICAL || 0) + (analytics?.by_criticality?.HIGH || 0)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-neutral-300">Failed Tests</h4>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {analytics?.by_result?.FAIL || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-4xl mx-4 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <h4 className="text-lg font-semibold">{modalTitle}</h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                <thead className="bg-neutral-50 dark:bg-neutral-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-neutral-300 uppercase tracking-wider">Vulnerability</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-neutral-300 uppercase tracking-wider">Result</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-neutral-300 uppercase tracking-wider">CVSS</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-neutral-300 uppercase tracking-wider">Business</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-neutral-300 uppercase tracking-wider">Environment</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
                  {modalItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-600 dark:text-neutral-300">No matching records</td>
                    </tr>
                  ) : (
                    modalItems.map((v) => (
                      <tr key={v.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/60">
                        <td className="px-4 py-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{v.vulnerability_id}</div>
                          <div className="text-sm text-gray-600 dark:text-neutral-300 max-w-md truncate" title={v.vulnerability_name}>{v.vulnerability_name}</div>
                        </td>
                        <td className="px-4 py-2 text-sm">{v.result}</td>
                        <td className="px-4 py-2 text-sm">{v.cvss_criticality}</td>
                        <td className="px-4 py-2 text-sm">{v.business_criticality}</td>
                        <td className="px-4 py-2 text-sm">{v.tested_environment}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
