
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Plus, Users, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import AnalyticCards from './Dashboard/AnalyticCards';
import ActivityTimeline from './Dashboard/ActivityTimeline';

interface DashboardProps {
  onCreateMinute: () => void;
  onViewMinute: (id: string) => void;
  onCreateFromTemplate?: (template: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onCreateMinute, onViewMinute, onCreateFromTemplate }) => {
  const { user } = useAuth();
  const { minutes, projects, users, getTasksForMinute } = useData();
  const [activeTab, setActiveTab] = useState('overview');

  // Filter projects based on user access
  const userProjects = useMemo(() => {
    if (!Array.isArray(projects)) return [];
    if (user?.role === 'admin' || !user?.hasLimitedAccess) {
      return projects;
    }
    if (!Array.isArray(user?.projectIds)) return [];
    return projects.filter(project => user.projectIds.includes(project.id));
  }, [projects, user]);

  // Filter minutes based on user permissions and project access
  const userMinutes = useMemo(() => {
    if (!Array.isArray(minutes)) return [];
    return minutes.filter(minute => {
      // Admin can see all minutes
      if (user?.role === 'admin') return true;
      
      // Users with limited access can only see minutes from their assigned projects
      if (user?.hasLimitedAccess && Array.isArray(minute.projectIds) && minute.projectIds.length > 0) {
        if (!Array.isArray(user?.projectIds)) return false;
        return minute.projectIds.some(projectId => user.projectIds.includes(projectId));
      }
      
      // Regular users can see minutes they participate in
      if (!Array.isArray(minute.participantIds)) return false;
      return minute.participantIds.includes(user?.id || '');
    });
  }, [minutes, user]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!Array.isArray(userMinutes)) return { draft: 0, published: 0, total: 0 };
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
            <AnalyticCards 
              minutes={Array.isArray(userMinutes) ? userMinutes : []} 
              users={Array.isArray(users) ? users : []} 
              getTasksForMinute={getTasksForMinute}
            />
          </div>
          {/* Tareas pendientes (solo tareas reales de SQL) */}
          <div>
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span>Tareas Pendientes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userMinutes
                    .map(minute => {
                      const realTasks = getTasksForMinute(minute.id).filter(task => !task.completed);
                      if (realTasks.length === 0) return null;
                      return (
                        <div key={minute.id} className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{minute.title}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(minute.meetingDate).toLocaleDateString()}
                            </p>
                            {realTasks.map((task, idx) => {
                              const assignedUser = users.find(u => u.id === task.assignedTo);
                              return (
                                <div key={task.id} className="flex items-center text-xs text-orange-900 mt-1">
                                  <span className="font-semibold">Tarea:</span>
                                  <span className="ml-1 truncate max-w-[120px]">{task.text}</span>
                                  {assignedUser && (
                                    <span className="ml-2 bg-orange-200 text-orange-800 px-2 py-0.5 rounded">
                                      {assignedUser.name}
                                    </span>
                                  )}
                                  {task.dueDate && (
                                    <span className="ml-2 text-orange-700">Vence: {new Date(task.dueDate).toLocaleDateString()}</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div className="text-orange-600 font-bold text-sm ml-2">
                            {realTasks.length}
                          </div>
                        </div>
                      );
                    })
                    .filter(Boolean)
                    .slice(0, 5)}
                  {userMinutes.every(minute => getTasksForMinute(minute.id).filter(task => !task.completed).length === 0) && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No hay tareas pendientes
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
