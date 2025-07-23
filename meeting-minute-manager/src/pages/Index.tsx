
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


// MODO MANTENIMIENTO: para desactivar, comentar el return y descomentar el resto del componente
const AppContent = () => {
  // --- INICIO BLOQUEO POR MANTENIMIENTO ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md text-center border border-yellow-400">
        <h1 className="text-2xl font-bold text-yellow-600 mb-4">Sitio en Mantenimiento</h1>
        <p className="text-gray-700 mb-4">Estamos realizando tareas de mantenimiento.<br />Por favor, vuelve a intentarlo más tarde.</p>
        <span className="inline-block text-xs text-gray-400">(Este mensaje es reversible desde <code>Index.tsx</code>)</span>
      </div>
    </div>
  );
  // --- FIN BLOQUEO POR MANTENIMIENTO ---

  /*
  // ...existing code...
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedMinuteId, setSelectedMinuteId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MinuteTemplate | null>(null);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // ...existing code...
  // (Resto del componente original aquí)
  */
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
