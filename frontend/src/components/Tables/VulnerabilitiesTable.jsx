import React, { useState, useEffect } from 'react';
import { getVaptResults } from '../../services/api';
import DataTable from './DataTable';

const VulnerabilitiesTable = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    criticality: '',
    environment: '',
    result: '',
  });

  const columns = [
    { key: 'vulnerability_id', label: 'ID' },
    { 
      key: 'vulnerability_name', 
      label: 'Vulnerability',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    { 
      key: 'cvss_criticality', 
      label: 'CVSS Criticality',
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
      key: 'business_criticality', 
      label: 'Business Criticality',
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
    { 
      key: 'result', 
      label: 'Result',
      render: (value) => {
        const colors = {
          PASS: 'bg-green-100 text-green-800',
          FAIL: 'bg-red-100 text-red-800',
          PARTIAL: 'bg-yellow-100 text-yellow-800',
          NOT_APPLICABLE: 'bg-gray-100 text-gray-800',
        };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[value] || 'bg-gray-100 text-gray-800'}`}>
            {value || 'N/A'}
          </span>
        );
      }
    },
    { key: 'stakeholders', label: 'Stakeholders' },
  ];

  useEffect(() => {
    fetchVulnerabilities();
  }, [filters]);

  const fetchVulnerabilities = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.criticality) params.criticality = filters.criticality;
      if (filters.environment) params.environment = filters.environment;
      if (filters.result) params.result = filters.result;

      const response = await getVaptResults(params);
      setVulnerabilities(response.data);
    } catch (err) {
      setError('Failed to load vulnerabilities');
      console.error('Error fetching vulnerabilities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Vulnerabilities</h2>
        <p className="text-gray-400">Monitor and manage security vulnerabilities</p>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 rounded-lg bg-neutral-900 text-white border border-neutral-800">
        <h3 className="text-lg font-medium text-white mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Criticality
            </label>
            <select
              value={filters.criticality}
              onChange={(e) => handleFilterChange('criticality', e.target.value)}
              className="w-full input-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Criticalities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Environment
            </label>
            <select
              value={filters.environment}
              onChange={(e) => handleFilterChange('environment', e.target.value)}
              className="w-full input-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Environments</option>
              <option value="PRODUCTION">Production</option>
              <option value="STAGING">Staging</option>
              <option value="DEVELOPMENT">Development</option>
              <option value="UAT">UAT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Result
            </label>
            <select
              value={filters.result}
              onChange={(e) => handleFilterChange('result', e.target.value)}
              className="w-full input-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Results</option>
              <option value="PASS">Pass</option>
              <option value="FAIL">Fail</option>
              <option value="PARTIAL">Partial</option>
              <option value="NOT_APPLICABLE">Not Applicable</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ criticality: '', environment: '', result: '' })}
              className="btn-surface"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={vulnerabilities}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default VulnerabilitiesTable;