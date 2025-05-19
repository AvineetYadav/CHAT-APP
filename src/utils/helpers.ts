import { format, isToday, isYesterday } from 'date-fns';

// Format date for chat messages
export const formatMessageTime = (date: string | Date): string => {
  const messageDate = new Date(date);
  
  if (isToday(messageDate)) {
    return format(messageDate, 'h:mm a');
  } else if (isYesterday(messageDate)) {
    return 'Yesterday ' + format(messageDate, 'h:mm a');
  } else {
    return format(messageDate, 'MMM d, h:mm a');
  }
};

// Format date for conversation list
export const formatConversationDate = (date: string | Date): string => {
  const messageDate = new Date(date);
  
  if (isToday(messageDate)) {
    return format(messageDate, 'h:mm a');
  } else if (isYesterday(messageDate)) {
    return 'Yesterday';
  } else {
    return format(messageDate, 'MMM d');
  }
};

// Generate a color based on a string (for user avatars)
export const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#4F46E5', // primary
    '#10B981', // secondary
    '#8B5CF6', // accent
    '#F59E0B', // warning
    '#EF4444', // error
    '#06B6D4', // cyan
    '#EC4899', // pink
    '#F97316', // orange
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

// Generate initials from a name
export const getInitials = (name: string): string => {
  const words = name.split(' ');
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
};

// Truncate text with ellipsis
export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Detect if a string has URLs
export const containsUrl = (text: string): boolean => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(text);
};

// Extract URL from text
export const extractUrl = (text: string): string | null => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const match = text.match(urlRegex);
  return match ? match[0] : null;
};

// Check if a message is a GIF
export const isGif = (url: string): boolean => {
  return url.toLowerCase().endsWith('.gif') || url.includes('giphy.com');
};

// Check if string is an image URL
export const isImageUrl = (url: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
};