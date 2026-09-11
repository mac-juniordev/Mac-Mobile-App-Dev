import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { getUnreadCount } from '../utils/notifications';

/**
 * Hook to fetch and refresh the unread notification count.
 * Refreshes whenever the screen comes into focus.
 */
export const useUnreadNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const count = await getUnreadCount();
    setUnreadCount(count);
    setLoading(false);
  }, []);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return { unreadCount, loading, refresh };
};