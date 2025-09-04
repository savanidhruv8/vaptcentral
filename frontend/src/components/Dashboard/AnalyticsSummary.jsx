import React from 'react';

const AnalyticsSummary = ({ analytics }) => {
  const totalVulnerabilities = Object.values(analytics?.by_criticality || {}).reduce((a, b) => a + b, 0);
  const criticalAndHigh = (analytics?.by_criticality?.CRITICAL || 0) + (analytics?.by_criticality?.HIGH || 0);

  return (
    <div className="p-6 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Summary Statistics</h3>
      
      {/* First Row: Total Vulnerabilities, Critical & High, Remediated */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Total Vulnerabilities</h4>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            {totalVulnerabilities.toLocaleString()}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Identified Issues</p>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg border border-red-200 dark:border-red-700">
          <h4 className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">Critical & High</h4>
          <p className="text-3xl font-bold text-red-900 dark:text-red-100">
            {criticalAndHigh.toLocaleString()}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">High Priority</p>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700">
          <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Remediated</h4>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">
            {analytics?.by_result?.Remediated || 0}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">Fixed Issues</p>
        </div>
      </div>
      
      {/* Second Row: Risk Accepted, In Progress, Unresolved */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-700">
          <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Risk Accepted</h4>
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
            {analytics?.by_result?.['Risk Accepted'] || 0}
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Accepted Risk</p>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <h4 className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">Plan for Remediation</h4>
          <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
            {analytics?.by_result?.['Plan for Remediation'] || 0}
          </p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Being Fixed</p>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-700">
          <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">Unresolved</h4>
          <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
            {analytics?.by_result?.Unresolved || 0}
          </p>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Needs Attention</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSummary;
