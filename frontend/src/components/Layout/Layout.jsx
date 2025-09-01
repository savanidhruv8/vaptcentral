import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from './Sidebar';

const Layout = ({ children, activeTab, setActiveTab }) => {
  const { darkMode } = useTheme();
  return (
    <div className="flex h-screen bg-white text-gray-900 dark:bg-black dark:text-white">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-black">
        {/* Top Header */}
        <header className="bg-white dark:bg-black shadow-sm border-b border-neutral-200 dark:border-neutral-800">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {activeTab === 'dashboard' && 'Analytics Overview'}
              {activeTab === 'upload' && 'File Upload'}
              {activeTab === 'proposals' && 'VAPT Proposals'}
              {activeTab === 'scopes' && 'Testing Scopes'}
              {activeTab === 'vulnerabilities' && 'Vulnerability Results'}
              {activeTab === 'analytics' && 'Dashboard'}
            </h1>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-white dark:bg-black">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;