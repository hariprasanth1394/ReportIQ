import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { ExecutionRunsPage } from './pages/ExecutionRunsPage.tsx';
import { ExecutionDetailPage } from './pages/ExecutionDetailPage.tsx';
import { UsersPage } from './pages/UsersPage.tsx';
import { AnalyticsPage } from './pages/AnalyticsPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { AuthContext } from './context/AuthContext';

type Page = 'login' | 'dashboard' | 'executions' | 'execution-detail' | 'analytics' | 'users' | 'settings';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedRunId, setSelectedRunId] = useState<string>('');
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setAuthToken(token);
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (token, userData) => {
    setAuthToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('login');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleNavigateToDetail = (runId) => {
    setSelectedRunId(runId);
    setCurrentPage('execution-detail');
  };

  const handleBackToExecutions = () => {
    setCurrentPage('executions');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <AuthContext.Provider value={{ authToken, user, handleLogin, handleLogout }}>
      <div className="flex h-screen bg-slate-50">
        <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'executions' && <ExecutionRunsPage onNavigateToDetail={handleNavigateToDetail} />}
          {currentPage === 'execution-detail' && <ExecutionDetailPage runId={selectedRunId} onBack={handleBackToExecutions} />}
          {currentPage === 'analytics' && <AnalyticsPage />}
          {currentPage === 'users' && <UsersPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </div>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
