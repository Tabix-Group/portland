
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Minute, User } from '@/types';
import { Calendar, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';

interface ActivityTimelineProps {
  minutes: Minute[];
  users: User[];
  currentUserId: string;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ minutes, users, currentUserId }) => {
  // Generar actividades del usuario actual
  const getUserActivities = () => {
    const activities: Array<{
      id: string;
      type: 'created' | 'confirmed' | 'mentioned';
      minuteId: string;
      minuteTitle: string;
      date: string;
      description: string;
    }> = [];

    minutes.forEach(minute => {
      // Minutas creadas por el usuario
      if (minute.createdBy === currentUserId) {
        activities.push({
          id: `created-${minute.id}`,
          type: 'created',
          minuteId: minute.id,
          minuteTitle: minute.title,
          date: minute.createdAt,
          description: 'Creaste una nueva minuta'
        });
      }


      // Menciones del usuario
      const mentionedInTopics = minute.topicsDiscussed.some(topic => 
        topic.mentions?.includes(currentUserId)
      );
      const mentionedInDecisions = minute.decisions.some(decision => 
        decision.mentions?.includes(currentUserId)
      );
      const mentionedInTasks = minute.pendingTasks.some(task => 
        task.mentions?.includes(currentUserId) || task.assignedTo === currentUserId
      );

      if (mentionedInTopics || mentionedInDecisions || mentionedInTasks) {
        activities.push({
          id: `mentioned-${minute.id}`,
          type: 'mentioned',
          minuteId: minute.id,
          minuteTitle: minute.title,
          date: minute.createdAt,
          description: 'Fuiste mencionado en esta minuta'
        });
      }
    });

    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  };

  const activities = getUserActivities();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created': return Plus;
      case 'confirmed': return CheckCircle;
      case 'mentioned': return AlertCircle;
      default: return Calendar;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'created': return 'text-blue-600 bg-blue-100';
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'mentioned': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <span>Tu Actividad Reciente</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
        ) : (
          <div className="space-y-4">
            {activities.map(activity => {
              const ActivityIcon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);
              
              return (
                <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0">
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <ActivityIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {activity.minuteTitle}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityTimeline;
