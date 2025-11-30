import { useEffect, useRef } from 'react';
import { useTaskStore } from '../store/useTaskStore';

export function useNotifications() {
  const { tasks } = useTaskStore();
  const notifiedTasks = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Request permission on mount
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const checkNotifications = () => {
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      
      tasks.forEach(task => {
        if (!task.notificationTime || !task.timeLabel) return;

        // Construct task date object
        const [hours, minutes] = task.timeLabel.split(':').map(Number);
        const taskDate = new Date(task.date);
        taskDate.setHours(hours, minutes, 0, 0);

        // Calculate notification time
        const notificationTime = new Date(taskDate.getTime() - task.notificationTime * 60000);

        // Check if it's time to notify (within the last minute)
        // We use a 1-minute window to ensure we don't miss it if the interval ticks slightly off
        // but also don't spam if the user keeps the tab open.
        // We also use a ref to track sent notifications for this session.
        const timeDiff = now.getTime() - notificationTime.getTime();
        
        if (timeDiff >= 0 && timeDiff < 60000) {
          const notificationId = `${task.id}-${notificationTime.getTime()}`;
          
          if (!notifiedTasks.current.has(notificationId)) {
            new Notification(`Upcoming Event: ${task.title}`, {
              body: `Starting in ${task.notificationTime} minutes`,
              icon: '/pwa-192x192.png' // Assuming this exists or browser default
            });
            notifiedTasks.current.add(notificationId);
          }
        }
      });
    };

    // Check every 30 seconds
    const intervalId = setInterval(checkNotifications, 30000);
    
    // Initial check
    checkNotifications();

    return () => clearInterval(intervalId);
  }, [tasks]);
}
