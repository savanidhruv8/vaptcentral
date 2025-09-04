import React, { useState, useMemo } from 'react';

const AnalyticsModal = ({ 
  isOpen, 
  onClose, 
  modalTitle, 
  modalItems, 
  onExport 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    result: '',
    cvssCriticality: '',
    businessCriticality: '',
    environment: '',
    vulnerabilityType: ''
  });
  const [logicalOperator, setLogicalOperator] = useState('AND');
  const [sortBy, setSortBy] = useState('vulnerability_id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const options = {
      result: [...new Set(modalItems.map(item => item.result).filter(Boolean))],
      cvssCriticality: [...new Set(modalItems.map(item => item.cvss_criticality).filter(Boolean))],
      businessCriticality: [...new Set(modalItems.map(item => item.business_criticality).filter(Boolean))],
      environment: [...new Set(modalItems.map(item => item.tested_environment).filter(Boolean))],
      vulnerabilityType: [...new Set(modalItems.map(item => item.vulnerability_type).filter(Boolean))]
    };
    return options;
  }, [modalItems]);

  // Apply filters and search
  const filteredItems = useMemo(() => {
    let filtered = modalItems;

    // Apply search term - enhanced search functionality
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.vulnerability_id?.toLowerCase().includes(searchLower) ||
        item.vulnerability_name?.toLowerCase().includes(searchLower) ||
        item.result?.toLowerCase().includes(searchLower) ||
        item.cvss_criticality?.toLowerCase().includes(searchLower) ||
        item.business_criticality?.toLowerCase().includes(searchLower) ||
        item.tested_environment?.toLowerCase().includes(searchLower) ||
        item.vulnerability_type?.toLowerCase().includes(searchLower)
      );
    }

    // Apply filters based on logical operator
    const activeFilters = Object.entries(filters).filter(([_, value]) => value !== '');
    
    if (activeFilters.length > 0) {
      filtered = filtered.filter(item => {
        if (logicalOperator === 'AND') {
          return activeFilters.every(([key, value]) => {
            // Map filter keys to actual item property names
            const propertyMap = {
              result: 'result',
              cvssCriticality: 'cvss_criticality',
              businessCriticality: 'business_criticality',
              environment: 'tested_environment',
              vulnerabilityType: 'vulnerability_type'
            };
            const itemValue = item[propertyMap[key]];
            return itemValue === value;
          });
        } else { // OR
          return activeFilters.some(([key, value]) => {
            // Map filter keys to actual item property names
            const propertyMap = {
              result: 'result',
              cvssCriticality: 'cvss_criticality',
              businessCriticality: 'business_criticality',
              environment: 'tested_environment',
              vulnerabilityType: 'vulnerability_type'
            };
            const itemValue = item[propertyMap[key]];
            return itemValue === value;
          });
        }
      });
    }

    return filtered;
  }, [modalItems, searchTerm, filters, logicalOperator]);

  // Sort items
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle null/undefined values
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';
      
      // Convert to strings for consistent comparison
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    
    return sorted;
  }, [filteredItems, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      result: '',
      cvssCriticality: '',
      businessCriticality: '',
      environment: '',
      vulnerabilityType: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (onExport) {
      onExport(sortedItems);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-[95vw] mx-auto bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div>
            <h4 className="text-2xl font-bold">{modalTitle}</h4>
            <p className="text-sm text-blue-100 mt-1">
              {filteredItems.length} of {modalItems.length} items • Page {currentPage} of {totalPages}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 border border-white/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 text-white bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg transition-colors duration-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-neutral-800 dark:to-neutral-700 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filter & Search Options
            </h5>
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200"
            >
              Clear All
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Search vulnerabilities, names, or results..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm"
              />
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filter Controls - Enhanced Layout */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-1">Result</label>
              <select
                value={filters.result}
                onChange={(e) => setFilters(prev => ({ ...prev, result: e.target.value }))}
                className="w-full px-3 py-2 text-base border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              >
                <option value="">All Results</option>
                {filterOptions.result.sort().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-1">CVSS</label>
              <select
                value={filters.cvssCriticality}
                onChange={(e) => setFilters(prev => ({ ...prev, cvssCriticality: e.target.value }))}
                className="w-full px-3 py-2 text-base border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              >
                <option value="">All CVSS</option>
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].filter(level => filterOptions.cvssCriticality.includes(level)).map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-1">Business</label>
              <select
                value={filters.businessCriticality}
                onChange={(e) => setFilters(prev => ({ ...prev, businessCriticality: e.target.value }))}
                className="w-full px-3 py-2 text-base border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              >
                <option value="">All Business</option>
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].filter(level => filterOptions.businessCriticality.includes(level)).map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-1">Environment</label>
              <select
                value={filters.environment}
                onChange={(e) => setFilters(prev => ({ ...prev, environment: e.target.value }))}
                className="w-full px-3 py-2 text-base border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              >
                <option value="">All Env</option>
                {filterOptions.environment.sort().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-1">Vulnerability Type</label>
              <select
                value={filters.vulnerabilityType}
                onChange={(e) => setFilters(prev => ({ ...prev, vulnerabilityType: e.target.value }))}
                className="w-full px-3 py-2 text-base border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              >
                <option value="">All Types</option>
                {filterOptions.vulnerabilityType.sort().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-1">Logic</label>
              <select
                value={logicalOperator}
                onChange={(e) => setLogicalOperator(e.target.value)}
                className="w-full px-3 py-2 text-base border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              >
                <option value="AND">AND</option>
                <option value="OR">OR</option>
              </select>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {Object.values(filters).some(value => value !== '') && (
            <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Active Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (value === '') return null;
                  const labelMap = {
                    result: 'Result',
                    cvssCriticality: 'CVSS',
                    businessCriticality: 'Business',
                    environment: 'Environment',
                    vulnerabilityType: 'Type'
                  };
                  return (
                    <span key={key} className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium bg-blue-200 text-blue-800 dark:bg-blue-800/50 dark:text-blue-200 rounded-full">
                      {labelMap[key]}: {value}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, [key]: '' }))}
                        className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="max-h-[50vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
            <thead className="bg-gradient-to-r from-gray-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 sticky top-0">
              <tr>
                {[
                  { key: 'vulnerability_id', label: 'Vulnerability ID', sortable: true, width: 'w-40' },
                  { key: 'vulnerability_name', label: 'Vulnerability Name', sortable: true, width: 'w-80' },
                  { key: 'result', label: 'Result', sortable: true, width: 'w-40' },
                  { key: 'cvss_criticality', label: 'CVSS', sortable: true, width: 'w-32' },
                  { key: 'business_criticality', label: 'Business', sortable: true, width: 'w-32' },
                  { key: 'tested_environment', label: 'Environment', sortable: true, width: 'w-40' }
                ].map(column => (
                  <th 
                    key={column.key}
                    className={`${column.width} px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-neutral-200 uppercase tracking-wider cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors duration-200 ${
                      column.sortable ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && (
                        <svg className={`w-3 h-3 transition-transform duration-200 ${
                          sortBy === column.key ? 'text-blue-600' : 'text-gray-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-600 dark:text-neutral-300">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                      </svg>
                      <p className="text-base font-medium">No matching records found</p>
                      <p className="text-xs text-gray-500">Try adjusting your filters or search terms</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, index) => (
                  <tr key={`${item.id}-${index}`} className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors duration-200">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                        {item.vulnerability_id}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-white max-w-md truncate" title={item.vulnerability_name}>
                        {item.vulnerability_name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-sm font-medium rounded-full ${
                        item.result === 'Remediated' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        item.result === 'Risk Accepted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                        item.result === 'Plan for Remediation' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        item.result === 'Unresolved' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {item.result}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-sm font-medium rounded-full ${
                        item.cvss_criticality === 'CRITICAL' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        item.cvss_criticality === 'HIGH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                        item.cvss_criticality === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        item.cvss_criticality === 'LOW' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {item.cvss_criticality}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-sm font-medium rounded-full ${
                        item.business_criticality === 'CRITICAL' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        item.business_criticality === 'HIGH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                        item.business_criticality === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        item.business_criticality === 'LOW' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {item.business_criticality}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {item.tested_environment}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-gray-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-neutral-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedItems.length)} of {sortedItems.length} results
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ←
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-2 py-1 text-sm font-medium rounded ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsModal;
