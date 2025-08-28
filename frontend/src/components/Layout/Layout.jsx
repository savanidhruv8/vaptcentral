import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children, activeTab, setActiveTab, darkMode, setDarkMode }) => {
  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-black">
        {/* Top Header */}
        <header className="bg-black shadow-sm border-b border-neutral-800">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-white">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'upload' && 'File Upload'}
              {activeTab === 'proposals' && 'VAPT Proposals'}
              {activeTab === 'scopes' && 'Testing Scopes'}
              {activeTab === 'vulnerabilities' && 'Vulnerability Results'}
              {activeTab === 'analytics' && 'Analytics & Reports'}
            </h1>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-black">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;