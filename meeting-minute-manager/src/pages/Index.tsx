
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  const [editMinute, setEditMinute] = useState<any | null>(null);

  // If route contains /minutes/:id, open that minute view when authenticated
  const params = useParams();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (params?.id) {
      setSelectedMinuteId(params.id as string);
      setCurrentPage('view-minute');
    }
  }, [isAuthenticated, params]);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const handleCreateMinute = () => {
    console.log("Creating minute...");
    setEditMinute(null);
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
  const handleEditMinute = (minute: any) => {
    setEditMinute(minute);
    setCurrentPage('create-minute');
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
            onEditMinute={handleEditMinute}
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
            onBack={() => {
              if (editMinute) {
                setEditMinute(null);
                setCurrentPage('minutes');
              } else {
                setCurrentPage('template-selector');
              }
            }}
            onSuccess={() => {
              if (editMinute) {
                setEditMinute(null);
                setCurrentPage('minutes');
              } else {
                handleBackToDashboard();
              }
            }}
            selectedTemplate={selectedTemplate}
            editMinute={editMinute}
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
