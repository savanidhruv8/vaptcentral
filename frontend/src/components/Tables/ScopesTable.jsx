import React, { useState, useEffect } from 'react';
import { getScopes } from '../../services/api';
import DataTable from './DataTable';

const ScopesTable = () => {
  const [scopes, setScopes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    impact: '',
    year: '',
    stakeholder: '',
  });

  const columns = [
    { key: 's_no', label: 'S.No' },
    { 
      key: 'penetration_testing', 
      label: 'Penetration Testing',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    { 
      key: 'description', 
      label: 'Description',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
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

  useEffect(() => {
    fetchScopes();
  }, [filters]);

  const fetchScopes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.impact) params.impact = filters.impact;
      if (filters.year) params.year = filters.year;
      if (filters.stakeholder) params.stakeholder = filters.stakeholder;

      const response = await getScopes(params);
      setScopes(response.data);
    } catch (err) {
      setError('Failed to load scopes');
      console.error('Error fetching scopes:', err);
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
        <h2 className="text-2xl font-bold text-white">Scopes</h2>
        <p className="text-gray-400">Manage your testing scopes and definitions</p>
      </div>

      {/* Filters */}
      <div className="p-4 mb-6 bg-neutral-900 text-white rounded-lg border border-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Impact
            </label>
            <select
              value={filters.impact}
              onChange={(e) => handleFilterChange('impact', e.target.value)}
              className="w-full input-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Impacts</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Year
            </label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full input-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Years</option>
              <option value="2024-25">2024-25</option>
              <option value="2025-26">2025-26</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Stakeholder
            </label>
            <input
              type="text"
              value={filters.stakeholder}
              onChange={(e) => handleFilterChange('stakeholder', e.target.value)}
              placeholder="Filter by stakeholder..."
              className="w-full input-base px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ impact: '', year: '', stakeholder: '' })}
              className="btn-surface"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={scopes}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default ScopesTable;