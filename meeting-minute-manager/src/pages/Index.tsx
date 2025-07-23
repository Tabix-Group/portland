
import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import LoginForm from '@/components/LoginForm';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import MinutesPage from '@/components/MinutesPage';
import TemplateSelector from '@/components/TemplateSelector';
import CreateMinuteForm from '@/components/CreateMinuteForm';
import MinuteView from '@/components/MinuteView';
import Settings from '@/components/Settings';
import { MinuteTemplate } from '@/types';

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedMinuteId, setSelectedMinuteId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MinuteTemplate | null>(null);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const handleCreateMinute = () => {
    console.log("Creating minute...");
    setCurrentPage('template-selector');
  };

  const handleSelectTemplate = (template: MinuteTemplate | null) => {
    setSelectedTemplate(template);
    setCurrentPage('create-minute');
  };

  const handleViewMinute = (id: string) => {
    console.log(`Viewing minute with ID: ${id}`);
    setSelectedMinuteId(id);
    setCurrentPage('view-minute');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
    setSelectedMinuteId(null);
    setSelectedTemplate(null);
  };

  const handleBackToMinutes = () => {
    setCurrentPage('minutes');
    setSelectedMinuteId(null);
    setSelectedTemplate(null);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'minutes':
        return (
          <MinutesPage 
            onCreateMinute={handleCreateMinute}
            onViewMinute={handleViewMinute}
          />
        );
      case 'template-selector':
        return (
          <TemplateSelector
            onBack={() => setCurrentPage('dashboard')}
            onSelectTemplate={handleSelectTemplate}
          />
        );
      case 'create-minute':
        return (
          <CreateMinuteForm 
            onBack={() => setCurrentPage('template-selector')}
            onSuccess={handleBackToDashboard}
            selectedTemplate={selectedTemplate}
          />
        );
      case 'view-minute':
        if (selectedMinuteId) {
          return (
            <MinuteView
              minuteId={selectedMinuteId}
              onBack={handleBackToDashboard}
            />
          );
        }
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Minuta no encontrada</p>
            <button 
              onClick={handleBackToDashboard}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Volver al Dashboard
            </button>
          </div>
        );
      case 'settings':
        return <Settings />;
      default:
        return (
          <Dashboard 
            onCreateMinute={handleCreateMinute}
            onViewMinute={handleViewMinute}
          />
        );
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderContent()}
    </Layout>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default Index;
