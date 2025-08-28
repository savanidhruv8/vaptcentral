import React, { useState, useEffect } from 'react';
import { getProposals } from '../../services/api';
import DataTable from './DataTable';

const ProposalsTable = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    year: '',
    stakeholder: '',
  });

  const columns = [
    { key: 's_no', label: 'S.No' },
    { key: 'domain', label: 'Domain' },
    { 
      key: 'testing_scope_avenues', 
      label: 'Testing Scope',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    { 
      key: 'methodology_overview', 
      label: 'Methodology',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
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
          value === '2024-25' 
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
        }`}>
          {value || 'N/A'}
        </span>
      )
    },
  ];

  useEffect(() => {
    fetchProposals();
  }, [filters]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.year) params.year = filters.year;
      if (filters.stakeholder) params.stakeholder = filters.stakeholder;

      const response = await getProposals(params);
      setProposals(response.data);
    } catch (err) {
      setError('Failed to load proposals');
      console.error('Error fetching proposals:', err);
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
        <h2 className="text-2xl font-bold text-white">Proposals</h2>
        <p className="text-gray-400">Manage your testing proposals and planning</p>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-neutral-900 text-white rounded-lg border border-neutral-800">
        <h3 className="text-lg font-medium text-white mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Year
            </label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full input-base px-3 py-2 bg-neutral-800 text-white border-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
              className="w-full input-base px-3 py-2 bg-neutral-800 text-white border-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ year: '', stakeholder: '' })}
              className="px-4 py-2 bg-neutral-800 text-white rounded-md border border-neutral-700 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={proposals}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default ProposalsTable;