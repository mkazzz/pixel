import React, { useState, useEffect, useCallback } from 'react';
import { format, getDay, isSameMonth, isToday as dateFnsIsToday, /* startOfMonth, */ endOfMonth, eachDayOfInterval, /* subDays, */ addDays, isBefore, isAfter } from 'date-fns';
import startOfMonth from 'date-fns/startOfMonth';
import subDays from 'date-fns/subDays';
import pl from 'date-fns/locale/pl';
import { DayInfo, Vacation, Employee, VacationStatus } from '../types';
import { isWeekend as checkIsWeekend, getPublicHoliday, isDateInRange, formatIsoDate } from '../utils/dateUtils';
import DayCell from './DayCell';
import { DAY_NAMES_PL_SHORT } from '../constants';


interface MonthlyCalendarViewProps {
  currentDate: Date;
  allVacations: Vacation[]; // Changed from 'vacations' to 'allVacations'
  allEmployees: Employee[]; // New prop
  currentUser: Employee;
  favoriteUserIds: string[]; // New prop
  isFavoritesViewModeActive: boolean; // New prop
  onDayClick: (date: Date) => void;
  onRangeSelect: (startDate: Date, endDate: Date) => void;
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({ 
  currentDate, 
  allVacations, 
  allEmployees,
  currentUser, 
  favoriteUserIds,
  isFavoritesViewModeActive,
  onDayClick, 
  onRangeSelect 
}) => {
  const [selecting, setSelecting] = useState<boolean>(false);
  const [selectStartDate, setSelectStartDate] = useState<Date | null>(null);
  const [currentHoverDate, setCurrentHoverDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  // Ensure grid always starts on Monday and shows 6 weeks
  let startDateGrid = startOfMonth(currentDate);
  while (getDay(startDateGrid) !== 1) { // 1 for Monday
    startDateGrid = subDays(startDateGrid, 1);
  }
  let endDateGrid = addDays(startDateGrid, 41);


  const daysInGrid = eachDayOfInterval({ start: startDateGrid, end: endDateGrid });

  const handleCellMouseDown = useCallback((date: Date) => {
    if (!isSameMonth(date, currentDate)) return; 
    setSelecting(true);
    setSelectStartDate(date);
    setCurrentHoverDate(date);
  }, [currentDate]);

  const handleCellMouseOver = useCallback((date: Date) => {
    if (selecting && isSameMonth(date, currentDate)) {
      setCurrentHoverDate(date);
    }
  }, [selecting, currentDate]);

  const handleMouseUpDocument = useCallback(() => {
    if (selecting && selectStartDate && currentHoverDate) {
      const start = isBefore(selectStartDate, currentHoverDate) ? selectStartDate : currentHoverDate;
      const end = isAfter(selectStartDate, currentHoverDate) ? selectStartDate : currentHoverDate;
      onRangeSelect(start, end);
    }
    setSelecting(false);
    setSelectStartDate(null);
    setCurrentHoverDate(null);
  }, [selecting, selectStartDate, currentHoverDate, onRangeSelect]);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUpDocument);
    return () => {
      document.removeEventListener('mouseup', handleMouseUpDocument);
    };
  }, [handleMouseUpDocument]);

  const dayInfos: DayInfo[] = daysInGrid.map(day => {
    const holiday = getPublicHoliday(day);
    let dayCellVacations: Vacation[] = []; // Vacations for the primary display logic (current user)
    let dayCellAllUserVacations: DayInfo['allUserVacationsOnDay'] = []; // Vacations for dots in favorites mode

    // Always populate dayCellVacations with current user's vacations for DayCell's primary logic
    // and for click/edit context.
    dayCellVacations = allVacations.filter(v => 
      v.employeeId === currentUser.id && 
      isDateInRange(day, v.startDate, v.endDate) &&
      v.status === VacationStatus.APPROVED
    );

    if (isFavoritesViewModeActive) {
      const usersToDisplay = [currentUser.id, ...favoriteUserIds];
      const uniqueUserIds = Array.from(new Set(usersToDisplay));

      uniqueUserIds.forEach(userId => {
        const userVacationOnDay = allVacations.find(v => 
          v.employeeId === userId && 
          isDateInRange(day, v.startDate, v.endDate) &&
          v.status === VacationStatus.APPROVED
        );
        if (userVacationOnDay) {
          dayCellAllUserVacations.push({ employeeId: userId, vacationType: userVacationOnDay.vacationType });
        }
      });
    }

    return {
      date: day,
      isCurrentMonth: isSameMonth(day, currentDate),
      isToday: dateFnsIsToday(day),
      isWeekend: checkIsWeekend(day),
      isPublicHoliday: !!holiday,
      publicHolidayName: holiday,
      vacations: dayCellVacations, 
      allUserVacationsOnDay: dayCellAllUserVacations,
    };
  });

  return (
    <div className="bg-pixel-bg-light dark:bg-pixel-bg-dark p-3 border-1 border-pixel-border-light dark:border-pixel-border-dark select-none rounded-none">
      <div className="grid grid-cols-7 border-t-1 border-l-1 border-pixel-border-light dark:border-pixel-border-dark">
        {DAY_NAMES_PL_SHORT.map(dayName => (
          <div key={dayName} className="py-1.5 px-1 text-center text-xs font-semibold text-pixel-text-alt-light dark:text-pixel-text-alt-dark bg-pixel-card-light dark:bg-pixel-card-dark border-r-1 border-b-1 border-pixel-border-light dark:border-pixel-border-dark">
            {dayName}
          </div>
        ))}
        {dayInfos.map(dayInfo => {
          let isHighlighted = false;
          if (selecting && selectStartDate && currentHoverDate && dayInfo.isCurrentMonth) {
            const rangeStart = isBefore(selectStartDate, currentHoverDate) ? selectStartDate : currentHoverDate;
            const rangeEnd = isAfter(selectStartDate, currentHoverDate) ? selectStartDate : currentHoverDate;
            if (dayInfo.date >= rangeStart && dayInfo.date <= rangeEnd) {
              isHighlighted = true;
            }
          }
          return (
            <DayCell 
              key={formatIsoDate(dayInfo.date)} 
              dayInfo={dayInfo}
              currentUserId={currentUser.id} // Pass currentUserId
              onClick={dayInfo.isCurrentMonth && !selecting ? () => onDayClick(dayInfo.date) : undefined}
              onMouseDown={dayInfo.isCurrentMonth ? handleCellMouseDown : undefined}
              onMouseOver={dayInfo.isCurrentMonth ? handleCellMouseOver : undefined}
              isRangeHighlighted={isHighlighted}
              isFavoritesViewModeActive={isFavoritesViewModeActive}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyCalendarView;