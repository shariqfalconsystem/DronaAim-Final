import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { VehicleStatus } from '../components/atoms/chip-with-icon';

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export const getLocalDateFromUtc = (utcTimestamp: number) => {
  if (!utcTimestamp) return null;

  const utcDate = new Date(utcTimestamp);

  const year = utcDate.getUTCFullYear();
  const month = utcDate.getUTCMonth();
  const date = utcDate.getUTCDate();

  return dayjs().year(year).month(month).date(date);
};

export const getDefaultDateRange = () => {
  // Get current date and time in UTC
  const toDate = dayjs().utc().valueOf();

  // Get exact time 90 days ago in UTC
  const fromDate = dayjs().utc().subtract(90, 'days').valueOf();

  return {
    fromDate, // UTC timestamp in milliseconds
    toDate, // UTC timestamp in milliseconds
  };
};

const timezoneAbbreviationMap: Record<string, string> = {
  'Asia/Calcutta': 'IST',

  // US and neighboring zones
  'America/New_York': 'EDT', // Eastern Daylight Time
  'America/Detroit': 'EDT',
  'America/Toronto': 'EDT',
  'America/Indiana/Indianapolis': 'EDT',

  'America/Chicago': 'CDT', // Central Daylight Time
  'America/Winnipeg': 'CDT',
  'America/Mexico_City': 'CDT',
  'America/Regina': 'CST', // Saskatchewan does not observe DST

  'America/Denver': 'MDT', // Mountain Daylight Time
  'America/Edmonton': 'MDT',
  'America/Boise': 'MDT',

  'America/Phoenix': 'MST', // Arizona does not observe DST
  'America/Los_Angeles': 'PDT', // Pacific Daylight Time
  'America/Vancouver': 'PDT',

  'America/Anchorage': 'AKDT', // Alaska Daylight Time
  'America/Juneau': 'AKDT',

  'Pacific/Honolulu': 'HST', // Hawaii Standard Time (no DST)

  // Others
  UTC: 'UTC',
  'Europe/London': 'BST',
  'Europe/Paris': 'CEST',
  'Asia/Tokyo': 'JST',
  'Australia/Sydney': 'AEST',
};

/**
 * Format an ISO timestamp to "MM/DD/YY | h:mm a, TZ" where TZ is abbreviation like IST, EDT.
 * @param isoTimestamp - ISO 8601 string
 * @returns formatted string
 */

export const formatDateString = (dateString: any) => {
  if (!dateString) return 'NA';

  try {
    const date = new Date(dateString);
    return `${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date
      .getUTCDate()
      .toString()
      .padStart(2, '0')}/${date.getUTCFullYear()}`;
  } catch (error) {
    return 'NA';
  }
};

export const formatToUserTimezone = (utcTimestamp: any) => {
  if (!utcTimestamp) {
    return '';
  }

  try {
    // Parse UTC timestamp and convert to user's local timezone
    const localTime = dayjs.utc(utcTimestamp).local();

    // Format as MM/DD/YYYY HH:mm am/pm
    return localTime.format('MM/DD/YYYY hh:mm A').toLowerCase();
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return '';
  }
};

export function formatTimestamp(isoTimestamp: string): string {
  const systemTimezone = dayjs.tz.guess();
  const date = dayjs.utc(isoTimestamp).tz(systemTimezone);

  const formattedDate = date.format('MM/DD/YY | h:mm a');
  const abbreviation = timezoneAbbreviationMap[systemTimezone] || systemTimezone;

  return `${formattedDate}, ${abbreviation}`;
}

export const formatLocalizedDateTime = (timestamp: string, timezoneAbbreviation: string) => {
  if (!timestamp) {
    return {
      date: 'NA',
      time: 'NA',
      timestamp: timestamp,
    };
  }

  const formattedDate = dayjs.utc(parseInt(timestamp)).format('MM/DD/YYYY | hh:mm a');
  const formattedTime = dayjs.utc(parseInt(timestamp)).format('hh:mm A');
  const formattedOnlyDate = dayjs.utc(parseInt(timestamp)).format('MM/DD/YYYY');

  return {
    date: formattedDate,
    time: `${formattedTime} ${timezoneAbbreviation}`,
    timestamp: timestamp,
    dateWithTmz: `${formattedDate} ${timezoneAbbreviation}`,
    onlyDate: formattedOnlyDate,
  };
};

export const formatUserDateTime = (timestamp: any) => {
  if (!timestamp) {
    return {
      date: 'NA',
      time: 'NA',
      timestamp: timestamp,
    };
  }

  const formattedDate = dayjs(parseInt(timestamp)).format('MM/DD/YYYY | hh:mm a');
  const formattedTime = dayjs(parseInt(timestamp)).format('hh:mm A');
  const formattedOnlyDate = dayjs(parseInt(timestamp)).format('MM/DD/YYYY');

  return {
    date: `${formattedDate}`,
    time: `${formattedTime}`,
    timestamp: timestamp,
    dateWithTmz: `${formattedDate}`,
    onlyDate: formattedOnlyDate,
  };
};

export const formatLocalizedDateWithMonth = (timestamp: string, timezoneAbbreviation: string) => {
  if (!timestamp) {
    return {
      date: 'NA',
      time: 'NA',
      timestamp: timestamp,
      dateWithTmz: 'NA',
      onlyDate: 'NA',
      YYYYMMDD: 'NA',
    };
  }

  const formattedDate = dayjs.utc(parseInt(timestamp)).format('MMM DD, YYYY | hh:mm a');
  const formattedTime = dayjs.utc(parseInt(timestamp)).format('hh:mm A');
  const formattedOnlyDate = dayjs.utc(parseInt(timestamp)).format('MMM DD, YYYY');
  const formattedYYYYMMDD = dayjs.utc(parseInt(timestamp)).format('YYYY-MM-DD');

  return {
    date: `${formattedDate}`,
    time: `${formattedTime} ${timezoneAbbreviation}`,
    timestamp: timestamp,
    dateWithTmz: `${formattedDate} ${timezoneAbbreviation}`,
    onlyDate: formattedOnlyDate,
    YYYYMMDD: formattedYYYYMMDD,
  };
};

export const formatUserDateWithMonth = (timestamp: string) => {
  if (!timestamp) {
    return {
      date: 'NA',
      time: 'NA',
      timestamp: timestamp,
      dateWithTmz: 'NA',
      onlyDate: 'NA',
      YYYYMMDD: 'NA',
    };
  }

  const formattedDate = dayjs(parseInt(timestamp)).format('MMM DD, YYYY | hh:mm a');
  const formattedTime = dayjs(parseInt(timestamp)).format('hh:mm A');
  const formattedOnlyDate = dayjs(parseInt(timestamp)).format('MMM DD, YYYY');
  const formattedYYYYMMDD = dayjs.utc(parseInt(timestamp)).format('YYYY-MM-DD');

  return {
    date: `${formattedDate}`,
    time: `${formattedTime}`,
    timestamp: timestamp,
    dateWithTmz: `${formattedDate}`,
    onlyDate: formattedOnlyDate,
    YYYYMMDD: formattedYYYYMMDD,
  };
};

///old

export const setSessionItem = (key: string, data: any) => {
  if (data !== null && data !== undefined) {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export const formatDateTimeAlpha = (timestamp: string) => {
  if (!timestamp) return 'NA';
  const date = new Date(parseInt(timestamp));

  // Format date and time
  const formattedDate = date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${formattedDate} | ${formattedTime}`;
};

export const formatDate = (timestamp: string) => {
  if (!timestamp) return 'NA';
  const date = new Date(parseInt(timestamp));
  return date?.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

export const formatTime = (timestamp: any) => {
  if (!timestamp) return 'NA';
  const date = new Date(timestamp);

  // Get time in hh:mm am/pm format
  const time = date?.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${time}`;
};

export function formatDateTime(timestamp: number): string {
  if (!timestamp) return 'No Data Found';

  const date = new Date(timestamp);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';

  hours = hours % 12;
  hours = hours ? hours : 12;

  const formattedDate = `${month} ${day}${getOrdinalSuffix(day)}, ${year} | ${hours}:${minutes} ${ampm}`;

  return formattedDate;
}

export const getAddressFromCoordinates: any = async (latitude: number, longitude: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    const data = await response.json();
    return data?.display_name || 'Address not found';
  } catch (error) {
    console.error('Error fetching address:', error);
    return 'Address not available';
  }
};

export const getAddressFromCoordinatesGoogle: any = async (latitude: number, longitude: number) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );
    const data = await response.json();
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      return 'GPS Location Not Available';
    }
  } catch (error) {
    console.error('Error fetching address:', error);
    return 'GPS Location Not Available';
  }
};

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const formatScore = (score: any) => {
  if (typeof score !== 'number') {
    return '0';
  }
  if (score === 100.0) {
    return 100;
  }
  const roundedScore = Math.round(score * 10) / 10;

  return roundedScore;
};

export const formatTotalDistance = (num: any) => {
  const formatter = new Intl.NumberFormat('en-US');
  return formatter.format(num);
};

export const calculateDuration = (startDate: string, endDate: string): string => {
  if (!startDate || !endDate) return 'NA';

  const start = new Date(parseInt(startDate));
  const end = new Date(parseInt(endDate));
  const durationMs = end.getTime() - start.getTime();

  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
};

export const calculateTotalSeconds = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;

  const start = new Date(parseInt(startDate));
  const end = new Date(parseInt(endDate));
  const durationMs = end.getTime() - start.getTime();

  return Math.floor(durationMs / 1000);
};

export const formatDuration = (totalSeconds: number): string => {
  if (totalSeconds <= 0) return 'NA';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${hours}h ${minutes}m`;
};

export const getAssociatedLabel = (eventType: any) => {
  const eventTypes: any = {
    Accelerate: 'Harsh Acceleration',
    Brake: 'Harsh Braking',
    Turn: 'Harsh Cornering',
    Speed: 'Speeding',
    Shock: 'Impact',
    'Severe Shock': 'Severe Impact',
    SevereShock: 'Severe Impact',
    PanicButton: 'SOS',
    IgnitionOff: 'Not Applicable',
    IgnitionOn: 'Not Applicable',
    ManualBackup: 'Not Applicable',
  };

  return eventTypes[eventType] || '';
};

export const mapUserInputToEventType = (input: string): string => {
  const labelToEventType: Record<string, string> = {
    'Harsh Acceleration': 'Accelerate',
    'Harsh Braking': 'Brake',
    'Harsh Cornering': 'Turn',
    Speeding: 'Speed',
    Impact: 'Shock',
    'Severe Impact': 'SevereShock',
    SOS: 'PanicButton',
  };

  const normalizedInput = input?.toLowerCase();

  const matchedEventType = Object.entries(labelToEventType)?.find(([label]) =>
    label.toLowerCase().includes(normalizedInput)
  );

  return matchedEventType ? matchedEventType[1] : input;
};

export const kmToMiles = (km: any): any => {
  if (typeof km !== 'number') return 'NA';
  const milesPerKm = 0.621371;
  return km * milesPerKm;
};

export function millisecondsToSeconds(milliseconds: any) {
  return Math.floor(milliseconds / 1000);
}

export const trimLocation = (location: string, maxLength: number = 15) => {
  if (!location) return 'NA';
  return location.length > maxLength ? location.substring(0, maxLength) + '...' : location;
};

export const convertKmToMiles = (kilometers: any) => {
  if (kilometers === 0) return 0;
  if (kilometers === null || kilometers === undefined) return 'NA';
  const miles = kilometers * 0.62137;
  return miles;
};

export function trimToTwoDecimals(number: any) {
  if (typeof number !== 'number') {
    return 'NA';
  }

  const [integerPart, decimalPart] = number.toString().split('.');

  if (!decimalPart) {
    return `${integerPart}.00`;
  }

  const trimmedDecimal = decimalPart.padEnd(2, '0').slice(0, 2);

  return `${integerPart}.${trimmedDecimal}`;
}

export function CalculateAndFormatDuration(milliseconds: any) {
  if (milliseconds === null || milliseconds === undefined) return 0;

  const isNegative = milliseconds < 0;
  const totalMilliseconds = Math.abs(milliseconds);

  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  if (totalSeconds === 0) return 0;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const formattedDuration = `${hours}h ${minutes}m`;
  return isNegative ? `-${formattedDuration}` : formattedDuration;
}

export function convertSpeedToMph(speedInMetersPerSecond: any) {
  const conversionFactor = 2.23694;
  return (speedInMetersPerSecond * conversionFactor).toFixed(2);
}

export const splitAddressInTwoLines = (address: string) => {
  if (!address) return ['NA', ''];

  const words = address.split(' ');
  const half = Math.ceil(words.length / 2);

  const firstLine = words.slice(0, half).join(' ');
  const secondLine = words.slice(half).join(' ');

  return [firstLine, secondLine];
};

export const splitAddressInTwoLinesLiveTrack = (address: string, maxLength: number = 40) => {
  if (!address) return ['NA', ''];
  const words = address.split(' ');
  const half = Math.ceil(words.length / 2);

  const firstLine = words.slice(0, half).join(' ');
  const secondLine = words.slice(half).join(' ');

  return [firstLine, secondLine];
};

export const getLabel = (stateValue: string, allStates: any) => {
  const state = allStates.find((state: any) => state.value === stateValue);
  return state ? state.label : 'NA';
};

export const calculateAge = (dob: string) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today?.getFullYear() - birthDate?.getFullYear();
  const monthDiff = today?.getMonth() - birthDate?.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today?.getDate() < birthDate?.getDate())) {
    age--;
  }
  return age;
};

export const handleDriverDocDownload = async (doc: any) => {
  if (doc.signedUrl) {
    try {
      const response = await fetch(doc.signedUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }

      const blob = await response.blob();

      const link = document.createElement('a');
      const url = window.URL.createObjectURL(blob);

      link.href = url;
      link.setAttribute('download', doc.fileName || 'document');

      document.body.appendChild(link);

      link.click();

      toast.success('Document Downloaded Successfully');
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  } else {
    console.error('Download link is not available');
    toast.error('Download link is not available');
  }
};

export const formatDateToUSA = (timestamp: any) => {
  const normalizedTimestamp = timestamp > 1e12 ? timestamp : timestamp * 1000;
  const date = new Date(normalizedTimestamp);
  const today = new Date();

  // Check if the date is today
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  if (isToday) {
    // Return only the time for today's date
    return date.toLocaleTimeString('en-US', { timeStyle: 'short' });
  } else {
    // Return only the date for other dates
    return date.toLocaleDateString('en-US', { dateStyle: 'short' });
  }
};

export const encodeUrl = (data: object) => {
  const jsonString = JSON.stringify(data);
  return btoa(jsonString);
};

export const decodeUrl = (encodedString: string) => {
  try {
    const jsonString = atob(encodedString);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to decode URL:', error);
    return null;
  }
};

export const normalizeStatus = (status: string | undefined | null): VehicleStatus => {
  if (!status) return 'NA';
  const capitalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  return capitalized as VehicleStatus;
};

export const formatPhoneNumberForFleetPersonal = (primaryPhone: string, primaryPhoneCtryCd: string) => {
  if (!primaryPhone) return 'NA';

  if (primaryPhoneCtryCd && primaryPhoneCtryCd !== 'null' && primaryPhoneCtryCd !== 'undefined') {
    return `${primaryPhoneCtryCd} ${primaryPhone}`;
  }
  return primaryPhone;
};

export const formatZohoUtcDate = (utcString?: string): string => {
  if (!utcString) return 'NA';
  try {
    const date = new Date(utcString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
      timeZone: 'UTC',
    });
  } catch {
    return 'NA';
  }
};
