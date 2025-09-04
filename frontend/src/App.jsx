import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import AccountActivation from './components/Auth/AccountActivation';
import DashboardStats from './components/Analytics/DashboardStats';
import FileUpload from './components/Upload/FileUpload';
import UploadDetails from './components/Upload/UploadDetails';
import ProposalsTable from './components/Tables/ProposalsTable';
import ScopesTable from './components/Tables/ScopesTable';
import EnhancedVulnerabilitiesTable from './components/Tables/EnhancedVulnerabilitiesTable';
import VulnerabilityCharts from './components/Dashboard/VulnerabilityCharts';
import Analytics from './components/Dashboard/Analytics';
import UserManagement from './components/UserManagement/UserManagement';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Main Dashboard Component
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUploadId, setSelectedUploadId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

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
        // Only allow upload for admin and super admin
        if (user?.role === 'admin' || user?.role === 'super_admin') {
          return <FileUpload onUploadSuccess={handleUploadSuccess} />;
        } else {
          return (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <p className="text-lg font-medium">Access Denied</p>
                <p className="text-sm">You don't have permission to upload files.</p>
              </div>
            </div>
          );
        }
      case 'proposals':
        return <ProposalsTable />;
      case 'scopes':
        return <ScopesTable />;
      case 'vulnerabilities':
        return <EnhancedVulnerabilitiesTable />;
      case 'analytics':
        return <Analytics />;
      case 'users':
        return <UserManagement />;
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
      user={user}
    >
      {renderActiveComponent()}
    </Layout>
  );
};

// Login Component with redirect
const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return <Login onLoginSuccess={() => window.location.href = '/'} />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/activate/:token" element={<AccountActivation />} />
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
