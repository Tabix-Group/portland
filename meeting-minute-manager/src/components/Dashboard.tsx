
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Plus, Users, CheckCircle, AlertCircle } from 'lucide-react';
import AnalyticCards from './Dashboard/AnalyticCards';
import ActivityTimeline from './Dashboard/ActivityTimeline';

interface DashboardProps {
  onCreateMinute: () => void;
  onViewMinute: (id: string) => void;
  onCreateFromTemplate?: (template: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onCreateMinute, onViewMinute, onCreateFromTemplate }) => {
  const { user } = useAuth();
  const { minutes, projects, users } = useData();
  const [activeTab, setActiveTab] = useState('overview');

  // Filter projects based on user access
  const userProjects = useMemo(() => {
    if (user?.role === 'admin' || !user?.hasLimitedAccess) {
      return projects;
    }
    return projects.filter(project => user.projectIds.includes(project.id));
  }, [projects, user]);

  // Filter minutes based on user permissions and project access
  const userMinutes = useMemo(() => {
    return minutes.filter(minute => {
      // Admin can see all minutes
      if (user?.role === 'admin') return true;
      
      // Users with limited access can only see minutes from their assigned projects
      if (user?.hasLimitedAccess && minute.projectIds && minute.projectIds.length > 0) {
        return minute.projectIds.some(projectId => user.projectIds.includes(projectId));
      }
      
      // Regular users can see minutes they participate in
      return minute.participantIds.includes(user?.id || '');
    });
  }, [minutes, user]);

  // Calculate stats
  const stats = useMemo(() => {
    const draft = userMinutes.filter(m => m.status === 'draft').length;
    const published = userMinutes.filter(m => m.status === 'published').length;
    
    return { draft, published, total: userMinutes.length };
  }, [userMinutes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Gestión avanzada de minutas de reuniones</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCreateMinute} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nueva Minuta</span>
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="space-y-6">

        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Publicadas</p>
                    <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Borradores</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.draft}</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Analytics */}
          <div className="lg:col-span-2">
            <AnalyticCards minutes={userMinutes} users={users} />
          </div>
          
          {/* Activity Timeline */}
          <div>
            <ActivityTimeline 
              minutes={userMinutes} 
              users={users} 
              currentUserId={user?.id || ''}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
