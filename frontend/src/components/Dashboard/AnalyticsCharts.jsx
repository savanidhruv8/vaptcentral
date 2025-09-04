import React from 'react';
import { 
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Label
} from 'recharts';

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

const RESULT_COLORS = {
  'Remediated': '#22c55e',
  'Risk Accepted': '#3b82f6',
  'Plan for Remediation': '#f59e0b',
  'No evidence of remediation': '#a855f7',
  'Unresolved': '#ef4444',
  'Risk Avoided': '#ec4899',
};

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

const AnalyticsCharts = ({ 
  analytics, 
  vaptItemsForBars, 
  environmentOptions, 
  onChartClick 
}) => {
  const COLORS = { ...DEFAULT_COLORS };

  // Prepare data for charts (criticality and business criticality)
  const criticalityData = CRITICALITY_KEYS.map(key => ({
    name: key,
    count: (analytics?.by_criticality || {})[key] || 0,
    fill: COLORS[key] || '#6b7280'
  }));

  const businessCriticalityData = CRITICALITY_KEYS.map(key => ({
    name: key,
    count: (analytics?.by_business_criticality || {})[key] || 0,
    fill: COLORS[key] || '#6b7280'
  }));

  // Third pie: Result distribution (based on analytics.by_result)
  const resultDistributionData = Object.keys(RESULT_COLORS).map(name => ({
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

  // Build stacked bar dataset: x-axis = Result, stacks = Business Criticality
  const BAR_RESULTS_ORDER = Object.keys(RESULT_COLORS);
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

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Criticality based on CVSS score */}
        <div className="p-8 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Criticality Before Blue-Sky Session</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={criticalityData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={110}
                dataKey="count"
                labelLine={false}
                label={renderPieLabel}
                paddingAngle={0}
              >
                {criticalityData.map((entry, index) => (
                  <Cell 
                    key={`cvss-${index}`} 
                    fill={entry.fill} 
                    onClick={() => onChartClick('criticality', entry)} 
                    style={{ cursor: 'pointer' }} 
                  />
                ))}
              </Pie>
              <Tooltip {...tooltipStyles} />
            </PieChart>
          </ResponsiveContainer>
          {/* Custom Legend for Criticality Before Blue-Sky Session */}
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {criticalityData.map((entry, index) => (
              <div key={`cvss-legend-${index}`} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.fill }}
                ></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Criticality Based in Business Context */}
        <div className="p-8 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Criticality After Blue-Sky Session</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={businessCriticalityData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={110}
                dataKey="count"
                labelLine={false}
                label={renderPieLabel}
                paddingAngle={0}
              >
                {businessCriticalityData.map((entry, index) => (
                  <Cell 
                    key={`biz-${index}`} 
                    fill={entry.fill} 
                    onClick={() => onChartClick('businessCriticality', entry)} 
                    style={{ cursor: 'pointer' }} 
                  />
                ))}
              </Pie>
              <Tooltip {...tooltipStyles} />
            </PieChart>
          </ResponsiveContainer>
          {/* Custom Legend for Criticality After Blue-Sky Session */}
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {businessCriticalityData.map((entry, index) => (
              <div key={`biz-legend-${index}`} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.fill }}
                ></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Result (Overall) */}
        <div className="p-8 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Remediation Result</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={resultDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={110}
                dataKey="count"
                labelLine={false}
                label={renderPieLabel}
                paddingAngle={0}
              >
                {resultDistributionData.map((entry, index) => (
                  <Cell 
                    key={`res-${index}`} 
                    fill={entry.fill} 
                    onClick={() => onChartClick('result', entry)} 
                    style={{ cursor: 'pointer' }} 
                  />
                ))}
              </Pie>
              <Tooltip {...tooltipStyles} />
            </PieChart>
          </ResponsiveContainer>
          {/* Custom Legend for Remediation Result */}
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {resultDistributionData.map((entry, index) => (
              <div key={`res-legend-${index}`} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.fill }}
                ></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Criticality Based in Business Context — by Result (Grouped Bars, full width) */}
      <div className="mb-8">
        <div className="p-6 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-lg border border-neutral-200 dark:border-neutral-800">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Detailed Remediation Result</h3>
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
              {BAR_CRIT_ORDER.map(key => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={BAR_CRIT_COLORS[key]} 
                  onClick={(data) => onChartClick('barSegment', { critKey: key, data })} 
                  cursor="pointer" 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          {/* Custom Legend for Detailed Remediation Result */}
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {BAR_CRIT_ORDER.map(key => (
              <div key={`bar-legend-${key}`} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: BAR_CRIT_COLORS[key] }}
                ></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{key}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalyticsCharts;
