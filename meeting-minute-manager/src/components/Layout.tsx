
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, FileText, Settings, ClipboardList, KeyRound } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { user, logout } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: FileText },
    { id: 'minutes', label: 'Minutas', icon: ClipboardList },
    ...(user?.role === 'admin' ? [
      { id: 'settings', label: 'Configuración', icon: Settings }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img src="/favicon.png" alt="Favicon" className="h-8 w-8 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Grupo Portland</h1>
              <span className="text-sm text-gray-500">Gestión de Minutas</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPage === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-gray-500 capitalize">{user?.role}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChangePassword(true)}
                className="flex items-center justify-center"
                title="Cambiar contraseña"
              >
                <KeyRound className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <ChangePasswordModal open={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </div>
  );
};

export default Layout;
