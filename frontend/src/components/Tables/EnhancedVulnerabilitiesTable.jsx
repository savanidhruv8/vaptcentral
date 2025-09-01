import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const EnhancedVulnerabilitiesTable = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [filteredVulns, setFilteredVulns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState('');
  const [selectedCriticality, setSelectedCriticality] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchVulnerabilities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vulnerabilities, searchTerm, selectedResult, selectedCriticality, selectedEnvironment]);

  const fetchVulnerabilities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vapt-results/');
      setVulnerabilities(response.data);
    } catch (err) {
      setError('Failed to load vulnerabilities');
      console.error('Error fetching vulnerabilities:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...vulnerabilities];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(vuln =>
        vuln.vulnerability_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vuln.vulnerability_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vuln.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Result filter
    if (selectedResult) {
      filtered = filtered.filter(vuln => vuln.result === selectedResult);
    }

    // Criticality filter
    if (selectedCriticality) {
      filtered = filtered.filter(vuln => vuln.cvss_criticality === selectedCriticality);
    }

    // Environment filter
    if (selectedEnvironment) {
      filtered = filtered.filter(vuln => vuln.tested_environment === selectedEnvironment);
    }

    setFilteredVulns(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const getResultBadgeColor = (result) => {
    const colors = {
      'Remediated': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Risk Accepted': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'No evidence of remediation': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Plan for Remediation': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Unresolved': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Risk Avoided': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };
    return colors[result] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const CRITICALITY_COLORS = {
    'CRITICAL': '#8B0000',
    'HIGH': '#FF0000',
    'MEDIUM': '#f59e0b',
    'LOW': '#22c55e',
  };

  const getCriticalityColor = (criticality) => {
    return CRITICALITY_COLORS[criticality] || '#6b7280';
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredVulns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredVulns.slice(startIndex, endIndex);

  // Get unique values for filters
  const uniqueResults = [...new Set(vulnerabilities.map(v => v.result))].filter(Boolean);
  const uniqueCriticalities = [...new Set(vulnerabilities.map(v => v.cvss_criticality))].filter(Boolean);
  const uniqueEnvironments = [...new Set(vulnerabilities.map(v => v.tested_environment))].filter(Boolean);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md">
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="rounded-lg shadow-sm border p-6 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Vulnerability Results
            </h2>
            <p className="text-sm text-gray-600 dark:text-neutral-300">
              {filteredVulns.length} of {vulnerabilities.length} vulnerabilities
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-neutral-400" />
            <input
              type="text"
              placeholder="Search vulnerabilities..."
              className="pl-10 pr-4 py-2 w-full input-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              className="input-base px-3 py-2"
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value)}
            >
              <option value="">All Results</option>
              {uniqueResults.map(result => (
                <option key={result} value={result}>{result}</option>
              ))}
            </select>
            <select
              className="input-base px-3 py-2"
              value={selectedCriticality}
              onChange={(e) => setSelectedCriticality(e.target.value)}
            >
              <option value="">All Criticalities</option>
              {uniqueCriticalities.map(crit => (
                <option key={crit} value={crit}>{crit}</option>
              ))}
            </select>
            <select
              className="input-base px-3 py-2"
              value={selectedEnvironment}
              onChange={(e) => setSelectedEnvironment(e.target.value)}
            >
              <option value="">All Environments</option>
              {uniqueEnvironments.map(env => (
                <option key={env} value={env}>{env}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg shadow-sm border overflow-hidden bg-white text-gray-900 dark:bg-neutral-900 dark:text-white border-neutral-200 dark:border-neutral-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-neutral-300 uppercase tracking-wider">
                  Vulnerability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-neutral-300 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-neutral-300 uppercase tracking-wider">
                  Criticality
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-neutral-300 uppercase tracking-wider">
                  Environment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-neutral-300 uppercase tracking-wider">
                  Stakeholder
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
              {currentItems.map((vuln) => (
                <tr key={vuln.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {vuln.vulnerability_id}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-neutral-300 max-w-xs truncate">
                        {vuln.vulnerability_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getResultBadgeColor(vuln.result)}`}>
                      {vuln.result}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border"
                      style={{ borderColor: getCriticalityColor(vuln.cvss_criticality), color: getCriticalityColor(vuln.cvss_criticality) }}
                    >
                      {vuln.cvss_criticality}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {vuln.tested_environment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {vuln.stakeholders}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-neutral-300">Show</span>
            <select
              className="input-base rounded-md px-2 py-1 text-sm"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-neutral-300">per page</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-neutral-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-neutral-300 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-neutral-300 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVulnerabilitiesTable;