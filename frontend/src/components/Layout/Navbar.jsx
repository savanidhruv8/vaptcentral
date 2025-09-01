import React from 'react';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  CloudArrowUpIcon 
} from '@heroicons/react/24/outline';

const Navbar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Analytics', icon: HomeIcon },
    { id: 'upload', name: 'Upload Files', icon: CloudArrowUpIcon },
    { id: 'proposals', name: 'Proposals', icon: DocumentTextIcon },
    { id: 'scopes', name: 'Scopes', icon: ShieldCheckIcon },
    { id: 'vulnerabilities', name: 'Vulnerabilities', icon: ExclamationTriangleIcon },
    { id: 'analytics', name: 'Dashboard', icon: ChartBarIcon },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex">
            <div className="flex items-center py-4 px-2">
              <ShieldCheckIcon className="h-8 w-8 text-primary-600 mr-2" />
              <span className="font-bold text-xl text-gray-800 dark:text-white">VAPT Dashboard</span>
            </div>
            <div className="hidden md:flex items-center space-x-1 ml-8">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;