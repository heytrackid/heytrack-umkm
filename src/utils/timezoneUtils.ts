// Get timezone offset in hours
export const getTimezoneOffset = (timezone: string): number => {
  try {
    // Create dates at Jan 1 and July 1 to check for DST
    const janDate = new Date(new Date().getFullYear(), 0, 1);
    const julDate = new Date(new Date().getFullYear(), 6, 1);
    
    const janOffset = -janDate.getTimezoneOffset() / 60;
    const julOffset = -julDate.getTimezoneOffset() / 60;
    
    // Return the appropriate offset based on current date
    const currentDate = new Date();
    return currentDate.getMonth() < 6 ? janOffset : julOffset;
  } catch {
    // For Asia/Jakarta which is UTC+7
    if (timezone === 'Asia/Jakarta') {
      return 7;
    }
    return 0;
  }
};

// Get user's timezone
export const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    // Fallback to a default timezone if unable to detect
    return 'Asia/Jakarta'; // WIB (UTC+7)
  }
};

// Get timezone abbreviation
export const getTimezoneAbbreviation = (timezone: string): string => {
  // Create a date object to get timezone abbreviation
  const date = new Date();
  
  try {
    // Use toLocaleTimeString with timeZoneName to get timezone abbreviation
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'short'
    });
    
    const parts = formatter.formatToParts(date);
    const timeZonePart = parts.find(part => part.type === 'timeZoneName');
    
    if (timeZonePart) {
      return timeZonePart.value;
    }
  } catch {
    // Fallback for specific timezones
  }
  
  // Manual mapping for common timezones
  const timezoneMap: Record<string, string> = {
    'Asia/Jakarta': 'WIB',
    'Asia/Makassar': 'WITA',
    'Asia/Jayapura': 'WIT',
    'America/New_York': 'EST/EDT',
    'America/Los_Angeles': 'PST/PDT',
    'Europe/London': 'GMT/BST',
    'Europe/Paris': 'CET/CEST',
  };
  
  return timezoneMap[timezone] || timezone.split('/').pop() || 'UTC';
};

// Format timezone display label
export const formatTimezoneLabel = (timezone: string): string => {
  const abbreviation = getTimezoneAbbreviation(timezone);
  const offset = getTimezoneOffset(timezone);
  
  return `${abbreviation} (UTC${offset >= 0 ? '+' : ''}${offset})`;
};