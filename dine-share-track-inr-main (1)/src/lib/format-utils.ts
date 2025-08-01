import { useSettings } from './SettingsContext';

/**
 * Format a date according to the user's selected date format
 * @param date The date to format
 * @returns The formatted date string
 */
export function useFormattedDate() {
  const { settings } = useSettings();
  
  return (date: Date | string | number): string => {
    try {
      const d = new Date(date);
      
      if (isNaN(d.getTime())) {
        return 'Invalid date';
      }
      
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      const monthName = d.toLocaleString('default', { month: 'short' });
      
      switch (settings.dateFormat) {
        case 'DD/MM/YYYY':
          return `${day}/${month}/${year}`;
        case 'MM/DD/YYYY':
          return `${month}/${day}/${year}`;
        case 'YYYY-MM-DD':
          return `${year}-${month}-${day}`;
        case 'DD-MMM-YYYY':
          return `${day}-${monthName}-${year}`;
        default:
          return `${day}/${month}/${year}`;
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error';
    }
  };
}

/**
 * Format a currency amount according to the user's selected currency
 * @param amount The amount to format
 * @returns The formatted currency string
 */
export function useFormattedCurrency() {
  const { settings } = useSettings();
  
  return (amount: number): string => {
    try {
      return `${settings.currencySymbol}${amount.toFixed(2)}`;
    } catch (error) {
      console.error('Error formatting currency:', error);
      return 'Error';
    }
  };
} 