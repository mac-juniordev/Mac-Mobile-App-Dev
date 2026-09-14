import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);

/**
 * Format appointment date for display
 */
export const formatAppointmentDate = (date: string | Date): string => {
  const d = dayjs(date);

  if (d.isToday()) return 'Today';
  if (d.isTomorrow()) return 'Tomorrow';

  return d.format('MMM D, YYYY');
};

/**
 * Format appointment time (12-hour)
 */
export const formatAppointmentTime = (time: string): string => {
  // If already formatted like "12:00 PM", return as-is
  if (time.includes('AM') || time.includes('PM')) return time;

  // Otherwise, assume "HH:MM" 24-hour format
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Combine date and time into a single dayjs object
 */
export const combineDateTime = (
  date: string | Date,
  time: string
): dayjs.Dayjs => {
  const dateStr = dayjs(date).format('YYYY-MM-DD');

  let hours = 0;
  let minutes = 0;

  const cleanTime = time.trim();
  const isPM = /pm/i.test(cleanTime);
  const isAM = /am/i.test(cleanTime);

  const timeMatch = cleanTime.match(/(\d+):(\d+)/);
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = parseInt(timeMatch[2], 10);

    if (isPM && hours !== 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
  }

  return dayjs(dateStr).hour(hours).minute(minutes).second(0);
};

/**
 * Get a live countdown string for an appointment
 */
export const getCountdown = (date: string | Date, time: string): string => {
  const appointmentDateTime = combineDateTime(date, time);
  const now = dayjs();
  const diff = appointmentDateTime.diff(now, 'second');

  if (diff < 0) {
    const agoSeconds = Math.abs(diff);
    if (agoSeconds < 60) return `Missed ${agoSeconds}s ago`;
    if (agoSeconds < 3600) return `Missed ${Math.floor(agoSeconds / 60)}m ago`;
    if (agoSeconds < 86400)
      return `Missed ${Math.floor(agoSeconds / 3600)}h ago`;
    return `Missed ${Math.floor(agoSeconds / 86400)}d ago`;
  }

  if (diff < 60) return 'Starting now!';

  if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `In ${minutes}m ${seconds}s`;
  }

  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `In ${hours}h ${minutes}m`;
  }

  const days = Math.floor(diff / 86400);
  return `In ${days} ${days === 1 ? 'day' : 'days'}`;
};

/**
 * Determine urgency level for an appointment
 */
export const getUrgencyLevel = (
  date: string | Date,
  time: string
): 'urgent' | 'soon' | 'upcoming' | 'past' => {
  const appointmentDateTime = combineDateTime(date, time);
  const now = dayjs();
  const diff = appointmentDateTime.diff(now, 'minute');

  if (diff < 0) return 'past';
  if (diff < 60) return 'urgent';
  if (diff < 1440) return 'soon';
  return 'upcoming';
};