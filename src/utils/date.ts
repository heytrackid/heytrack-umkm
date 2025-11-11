// Format date according to the specified format
export const formatDate = (date: Date, format: string): string => {
  if (!date) { return ''; }
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  
  // Replace format tokens with actual values
  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year);
};

// Parse date from string format DD/MM/YYYY
export const parseDate = (dateString: string): Date => {
  if (dateString?.length !== 10) {
    throw new Error('Invalid date format');
  }

  const parts = dateString.split('/');
  if (parts.length !== 3) {
    throw new Error('Invalid date format');
  }

  const day = parseInt(parts[0]!, 10);
  const month = parseInt(parts[1]!, 10);
  const year = parseInt(parts[2]!, 10);

  // Validate day, month, year
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    throw new Error('Invalid date format');
  }
  
  // Month is 0-indexed in JavaScript Date
  const date = new Date(year, month - 1, day);
  
  // Validate that the date is actually valid (e.g., not Feb 30)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error('Invalid date');
  }
  
  return date;
};

// Get the number of days between two dates
export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  return Math.round(Math.abs((startDate.getTime() - endDate.getTime()) / oneDay));
};

// Check if a date is within a range
export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => date >= startDate && date <= endDate;