import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Minute, User } from '@/types';
import { TrendingUp, Users, Calendar, CheckCircle, Clock } from 'lucide-react';

interface AnalyticCardsProps {
  minutes: Minute[];
  users: User[];
}

const AnalyticCards: React.FC<AnalyticCardsProps> = ({ minutes, users }) => {
  // Calcular tendencias de reuniones por mes
  const getMonthlyTrends = () => {
    const monthlyData: Record<string, number> = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      monthlyData[monthKey] = 0;
    }

    minutes.forEach(minute => {
      const date = new Date(minute.meetingDate);
      const monthKey = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey]++;
      }
    });

    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      count
    }));
  };

  // Participantes más activos
  const getMostActiveParticipants = () => {
    const participantCount: Record<string, number> = {};
    
    minutes.forEach(minute => {
      minute.participantIds.forEach(id => {
        participantCount[id] = (participantCount[id] || 0) + 1;
      });
    });

    return Object.entries(participantCount)
      .map(([userId, count]) => ({
        name: users.find(u => u.id === userId)?.name || 'Usuario desconocido',
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  // Distribución de estados
  const getStatusDistribution = () => {
    const statusCount = { confirmed: 0, waiting: 0, pending: 0 };
    minutes.forEach(minute => {
      statusCount[minute.status as keyof typeof statusCount]++;
    });

    return [
      { name: 'Confirmadas', value: statusCount.confirmed, color: '#10b981' },
      { name: 'En Espera', value: statusCount.waiting, color: '#f59e0b' },
      { name: 'Pendientes', value: statusCount.pending, color: '#ef4444' }
    ];
  };

  const monthlyTrends = getMonthlyTrends();
  const activeParticipants = getMostActiveParticipants();
  const statusDistribution = getStatusDistribution();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Tendencias mensuales */}
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span>Tendencias Mensuales</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Participantes más activos */}
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Users className="h-4 w-4 text-green-600" />
            <span>Participantes Más Activos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeParticipants} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Distribución de estados */}
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <CheckCircle className="h-4 w-4 text-purple-600" />
            <span>Estado de Minutas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  label={({ name, value, percent }) => 
                    value > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : null
                  }
                  labelLine={false}
                  fontSize={10}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tareas pendientes */}
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Clock className="h-4 w-4 text-orange-600" />
            <span>Tareas Pendientes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {minutes
              .filter(minute => minute.pendingTasks.some(task => !task.completed))
              .slice(0, 5)
              .map(minute => {
                const pendingTasks = minute.pendingTasks.filter(task => !task.completed);
                // Obtener todos los usuarios asignados únicos
                const assignedUserIds = Array.from(new Set(pendingTasks.map(task => task.assignedTo).filter(Boolean)));
                const assignedUsers = assignedUserIds.map(userId => users.find(u => u.id === userId)).filter(Boolean);
                return (
                  <div key={minute.id} className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{minute.title}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(minute.meetingDate).toLocaleDateString()}
                      </p>
                      {assignedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {assignedUsers.map(user => (
                            <span key={user.id} className="inline-block bg-orange-200 text-orange-800 text-xs px-2 py-0.5 rounded">
                              {user.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-orange-600 font-bold text-sm ml-2">
                      {pendingTasks.length}
                    </div>
                  </div>
                );
              })}
            {minutes.filter(minute => minute.pendingTasks.some(task => !task.completed)).length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No hay tareas pendientes
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticCards;
