
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'mention' | 'task_assigned' | 'confirmation_needed' | 'task_overdue';
  title: string;
  message: string;
  minuteId?: string;
  taskId?: string;
  createdAt: string;
  read: boolean;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const { minutes } = useData();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    const checkForNotifications = () => {
      const newNotifications: Notification[] = [];

      minutes.forEach(minute => {
        // Notificaciones de tareas vencidas
        minute.pendingTasks.forEach(task => {
          if (task.assignedTo === user.id && 
              !task.completed && 
              task.dueDate && 
              new Date(task.dueDate) < new Date()) {
            newNotifications.push({
              id: `overdue-${task.id}`,
              type: 'task_overdue',
              title: 'Tarea Vencida',
              message: `Tarea vencida: ${task.text}`,
              minuteId: minute.id,
              taskId: task.id,
              createdAt: task.dueDate,
              read: false
            });
          }
        });

        // Notificaciones de menciones
        const mentionedInContent = [
          ...minute.topicsDiscussed,
          ...minute.decisions,
          ...minute.pendingTasks
        ].some(item => item.mentions?.includes(user.id));

        if (mentionedInContent) {
          newNotifications.push({
            id: `mention-${minute.id}`,
            type: 'mention',
            title: 'Fuiste Mencionado',
            message: `Has sido mencionado en: ${minute.title}`,
            minuteId: minute.id,
            createdAt: minute.createdAt,
            read: false
          });
        }
      });

      // Filtrar notificaciones duplicadas y recientes (últimos 7 días)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const uniqueNotifications = newNotifications
        .filter(notification => new Date(notification.createdAt) > sevenDaysAgo)
        .reduce((acc, current) => {
          const existing = acc.find(n => n.id === current.id);
          if (!existing) {
            acc.push(current);
          }
          return acc;
        }, [] as Notification[])
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setNotifications(uniqueNotifications);

      // Mostrar toast para notificaciones críticas
      uniqueNotifications.forEach(notification => {
        if (notification.type === 'task_overdue' && !notification.read) {
          toast({
            title: notification.title,
            description: notification.message,
            variant: "destructive"
          });
        }
      });
    };

    checkForNotifications();
    const interval = setInterval(checkForNotifications, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, minutes]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
};
