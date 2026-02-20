// Format date to readable string
export const formatDate = (date: any): string => {
  if (!date) return "N/A";
  
  if (date.toDate) {
    // Firestore Timestamp
    return date.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  if (date instanceof Date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format relative time (e.g., "2 days ago")
export const formatRelativeTime = (date: any): string => {
  if (!date) return "N/A";
  
  const dateObj = date.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 60) {
    return diffInMinutes <= 1 ? "Just now" : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  } else if (diffInDays < 7) {
    return diffInDays === 1 ? "Yesterday" : `${diffInDays} days ago`;
  } else {
    return formatDate(dateObj);
  }
};

// Capitalize first letter
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Truncate text
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// Get initials from name
export const getInitials = (name: string): string => {
  const words = name.trim().split(" ");
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

// Generate random color for avatar
export const generateAvatarColor = (name: string): string => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};

// Check if user has role
export const hasRole = (userRole: string, allowedRoles: string[]): boolean => {
  return allowedRoles.includes(userRole);
};

// Philippine chapters list
export const PHILIPPINE_CHAPTERS = [
  "Tagum",
  "Cebu",
  "Manila",
  "Davao",
  "Cagayan de Oro",
  "Iloilo",
  "Bacolod",
  "General Santos",
  "Zamboanga",
  "Butuan",
];

// Project status options
export const PROJECT_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Volunteer status options
export const VOLUNTEER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: 'Admin',
  CHAPTER_HEAD: 'Chapter Head',
  VOLUNTEER: 'Volunteer',
} as const;
