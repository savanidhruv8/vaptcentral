import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { getDashboardStats, resetDataset } from '../../services/api';
import StatCard from './StatCard';

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetting, setResetting] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      return;
    }

    try {
      setResetting(true);
      await resetDataset();
      
      // Refresh the stats after reset
      await fetchStats();
      
      // Show success message
      alert('Dataset reset successfully!');
    } catch (err) {
      console.error('Error resetting dataset:', err);
      alert('Failed to reset dataset. Please try again.');
    } finally {
      setResetting(false);
    }
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
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-md p-4">
        <div className="flex">
          <ExclamationCircleIcon className="h-5 w-5 text-red-400 dark:text-red-300" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
          <p className="text-gray-600 dark:text-gray-400">Monitor your VAPT activities and vulnerabilities</p>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${resetting ? 'animate-spin' : ''}`} />
          {resetting ? 'Resetting...' : 'Reset Dataset'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <StatCard
          title="Total Uploads"
          value={stats?.total_uploads || 0}
          icon={CloudArrowUpIcon}
          color="blue"
        />
        <StatCard
          title="Proposals"
          value={stats?.total_proposals || 0}
          icon={DocumentTextIcon}
          color="green"
        />
        <StatCard
          title="Scopes"
          value={stats?.total_scopes || 0}
          icon={ShieldCheckIcon}
          color="blue"
        />
        <StatCard
          title="Vulnerabilities"
          value={stats?.total_vulnerabilities || 0}
          icon={ExclamationTriangleIcon}
          color="yellow"
        />
        <StatCard
          title="Critical Issues"
          value={stats?.critical_vulnerabilities || 0}
          icon={ExclamationCircleIcon}
          color="red"
        />
        <StatCard
          title="High Issues"
          value={stats?.high_vulnerabilities || 0}
          icon={ExclamationTriangleIcon}
          color="yellow"
        />
      </div>

    </div>
  );
};

export default DashboardStats;