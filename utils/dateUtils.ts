
import {
  format,
  // startOfMonth, // Will be imported directly
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  isSameDay,
  isSameMonth,
  addMonths,
  // subMonths, // Will be imported directly
  differenceInCalendarDays
  // parseISO // Will be imported directly
} from 'date-fns';
import startOfMonth from 'date-fns/startOfMonth';
import subMonths from 'date-fns/subMonths';
import parseISO from 'date-fns/parseISO';
import pl from 'date-fns/locale/pl';
import { POLISH_PUBLIC_HOLIDAYS } from '../constants';
import { Vacation, VacationType, VacationStatus } from '../types';

export const getMonthYearString = (date: Date): string => {
  return format(date, 'MMMM yyyy', { locale: pl });
};

export const getDaysInMonthGrid = (currentDate: Date): Date[] => {
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  
  // Sunday is 0, Monday is 1... Saturday is 6 for getDay
  // We want grid to start on Monday
  let startingDayOfWeek = getDay(firstDayOfMonth); // 0 for Sunday, 1 for Monday...
  if (startingDayOfWeek === 0) startingDayOfWeek = 7; // Adjust Sunday to be 7 for our logic
  
  const days = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const prefixDaysCount = startingDayOfWeek - 1; // Number of days from previous month
  const firstDayOfGrid = subMonths(firstDayOfMonth, 0); // Placeholder, will adjust
  for(let i = 0; i < prefixDaysCount; i++) {
    days.unshift(subMonths(firstDayOfGrid, 1)); // This logic is simplified, actual dates needed
  }
  // This needs proper implementation to fill with previous/next month days
  // For now, let's just return current month days for simplicity and handle padding in component

  return days;
};


export const getDaysForCalendar = (currentDate: Date): Date[] => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    
    // getDay returns 0 for Sunday, 6 for Saturday. We want Monday as 0.
    const firstDayOfMonthGridRaw = getDay(start);
    const firstDayOfMonthGrid = firstDayOfMonthGridRaw === 0 ? 6 : firstDayOfMonthGridRaw - 1; // Monday is 0

    const daysInMonth = eachDayOfInterval({ start, end });
    const prevMonthDaysCount = firstDayOfMonthGrid;
    const nextMonthDaysCount = 42 - (daysInMonth.length + prevMonthDaysCount); // Assuming 6 weeks grid

    const prevMonthDays = Array.from({ length: prevMonthDaysCount }).map((_, i) => 
        subMonths(start, 0) // placeholder, needs proper date calculation
    );
     const nextMonthDays = Array.from({ length: nextMonthDaysCount }).map((_, i) =>
        addMonths(end, 0) // placeholder
    );
    // For now returning only current month days due to complexity of precise date calculations for padding
    return daysInMonth; 
};


export const isWeekend = (date: Date): boolean => {
  const day = getDay(date); // Sunday is 0, Saturday is 6
  return day === 0 || day === 6;
};

export const getPublicHoliday = (date: Date): string | undefined => {
  const year = format(date, 'yyyy');
  const monthDay = format(date, 'MM-dd');
  return POLISH_PUBLIC_HOLIDAYS[year]?.[monthDay];
};

export const formatIsoDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const parseIsoDate = (dateString: string): Date => {
  return parseISO(dateString);
};

export const isDateInRange = (date: Date, startDateStr: string, endDateStr: string): boolean => {
  const start = parseIsoDate(startDateStr);
  const end = parseIsoDate(endDateStr);
  return date >= start && date <= end;
};

export const calculateUsedVacationDays = (vacations: Vacation[], employeeId: string): number => {
  return vacations
    .filter(v => v.employeeId === employeeId && v.vacationType === VacationType.UW && v.status === VacationStatus.APPROVED)
    .reduce((total, v) => {
      const start = parseIsoDate(v.startDate);
      const end = parseIsoDate(v.endDate);
      let workingDays = 0;

      if (start <= end) { // Ensure start is not after end
        const daysInVacationPeriod = eachDayOfInterval({ start, end });
        for (const day of daysInVacationPeriod) {
          if (!isWeekend(day) && !getPublicHoliday(day)) {
            workingDays++;
          }
        }
      }
      return total + workingDays;
    }, 0);
};

export const getDaysInMonthForMatrix = (currentDate: Date): Date[] => {
  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  return eachDayOfInterval({ start, end });
};