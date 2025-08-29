
import { useState, useEffect } from 'react';
import { localStorageManager } from '@/lib/localStorage';

export const useOfflineCapability = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToOfflineQueue = (action: any) => {
    if (!isOnline) {
      setOfflineQueue(prev => [...prev, { ...action, timestamp: Date.now() }]);
      localStorageManager.set('offlineQueue', offlineQueue);
    }
  };

  const processOfflineQueue = async () => {
    const queue = localStorageManager.get('offlineQueue', []);
    // Process queued actions when back online
    setOfflineQueue([]);
    localStorageManager.remove('offlineQueue');
  };

  const syncData = async () => {
    // Sync local data with cloud when online
    if (isOnline) {
      console.log('Syncing data with cloud...');
    }
  };

  return {
    isOnline,
    addToOfflineQueue,
    syncData
  };
};
