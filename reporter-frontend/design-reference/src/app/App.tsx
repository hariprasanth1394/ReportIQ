import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExecutionRunsPage } from './pages/ExecutionRunsPage';
import { ExecutionDetailPage } from './pages/ExecutionDetailPage';
import { UsersPage } from './pages/UsersPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

type Page = 'login' | 'dashboard' | 'executions' | 'execution-detail' | 'analytics' | 'users' | 'settings';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedRunId, setSelectedRunId] = useState<string>('');

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleNavigateToDetail = (runId: string) => {
    setSelectedRunId(runId);
    setCurrentPage('execution-detail');
  };

  const handleBackToExecutions = () => {
    setCurrentPage('executions');
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'executions' && <ExecutionRunsPage onNavigateToDetail={handleNavigateToDetail} />}
      {currentPage === 'execution-detail' && <ExecutionDetailPage runId={selectedRunId} onBack={handleBackToExecutions} />}
      {currentPage === 'analytics' && <AnalyticsPage />}
      {currentPage === 'users' && <UsersPage />}
      {currentPage === 'settings' && <SettingsPage />}
    </div>
  );
}

export default App;