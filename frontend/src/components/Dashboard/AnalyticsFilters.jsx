import React from 'react';

const AnalyticsFilters = ({ 
  environmentFilter, 
  setEnvironmentFilter, 
  resultFilter, 
  setResultFilter, 
  environmentOptions, 
  resultOptions 
}) => {
  return (
    <div className="p-6 mb-6 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-base font-medium text-gray-700 dark:text-neutral-300 whitespace-nowrap">
            Tested Environment
          </span>
          <select
            className="input-base px-4 py-2.5 min-w-[200px] border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={environmentFilter}
            onChange={(e) => setEnvironmentFilter(e.target.value)}
          >
            <option value="">All Environments</option>
            {environmentOptions.map(env => (
              <option key={env} value={env}>{env}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-base font-medium text-gray-700 dark:text-neutral-300 whitespace-nowrap">
            Result Status
          </span>
          <select
            className="input-base px-4 py-2.5 min-w-[200px] border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
          >
            <option value="">All Results</option>
            {resultOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => {
              setEnvironmentFilter('');
              setResultFilter('');
            }}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-neutral-300 bg-gray-100 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFilters;
