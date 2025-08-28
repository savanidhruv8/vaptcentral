import React, { useState, useEffect } from 'react';
import Layout from './components/Layout/Layout';
import DashboardStats from './components/Dashboard/DashboardStats';
import FileUpload from './components/Upload/FileUpload';
import UploadDetails from './components/Upload/UploadDetails';
import ProposalsTable from './components/Tables/ProposalsTable';
import ScopesTable from './components/Tables/ScopesTable';
import EnhancedVulnerabilitiesTable from './components/Tables/EnhancedVulnerabilitiesTable';
import VulnerabilityCharts from './components/Analytics/VulnerabilityCharts';
import Analytics from './components/Analytics/Analytics';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUploadId, setSelectedUploadId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Load dark mode preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    const initial = saved === null ? true : saved === 'true';
    setDarkMode(initial);
  }, []);

  // Apply dark mode on the html element and persist
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const handleUploadSuccess = (uploadData, action) => {
    if (action === 'viewDetails' && uploadData?.upload?.id) {
      setSelectedUploadId(uploadData.upload.id);
    }
  };

  const handleBackFromDetails = () => {
    setSelectedUploadId(null);
  };

  const renderActiveComponent = () => {
    // If viewing upload details, show that instead
    if (selectedUploadId) {
      return (
        <UploadDetails 
          uploadId={selectedUploadId} 
          onBack={handleBackFromDetails}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardStats />;
      case 'upload':
        return <FileUpload onUploadSuccess={handleUploadSuccess} />;
      case 'proposals':
        return <ProposalsTable />;
      case 'scopes':
        return <ScopesTable />;
      case 'vulnerabilities':
        return <EnhancedVulnerabilitiesTable />;
      case 'analytics':
        return <Analytics />;
      default:
        return <DashboardStats />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    >
      {renderActiveComponent()}
    </Layout>
  );
}

export default App;
