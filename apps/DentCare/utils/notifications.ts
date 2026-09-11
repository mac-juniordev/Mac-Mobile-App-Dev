import { notificationAPI } from './axios';

/**
 * Get unread notification count for the bell badge
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    const response = await notificationAPI.getUnreadCount();
    return response.data.unreadCount || 0;
  } catch (error) {
    console.error('Failed to fetch unread count:', error);
    return 0;
  }
};