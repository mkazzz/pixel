import React, { useState, useMemo } from 'react';
import { format, getDay, isToday as dateFnsIsToday } from 'date-fns';
import { Employee, Vacation, DayInfo, VacationType, VacationStatus } from '../types';
import { getDaysInMonthForMatrix, isWeekend as checkIsWeekend, getPublicHoliday, isDateInRange, formatIsoDate } from '../utils/dateUtils';
import { DAY_NAMES_PL_SHORT } from '../constants';
import DayCell from './DayCell';
import { Theme } from '../hooks/useTheme';

interface MatrixViewProps {
  currentDate: Date;
  employees: Employee[];
  vacations: Vacation[];
  currentUser: Employee;
  theme: Theme; // Added theme prop
  onDayClick?: (date: Date, employeeId: string) => void; 
  isFavoritesViewModeActive: boolean;
  favoriteUserIds: string[];
}

const MatrixView: React.FC<MatrixViewProps> = ({ 
  currentDate, 
  employees, 
  vacations, 
  currentUser, 
  theme, // Destructure theme
  onDayClick,
  isFavoritesViewModeActive,
  favoriteUserIds
 }) => {
  const daysInMonth = getDaysInMonthForMatrix(currentDate);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAndSortedEmployees = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    let initialList = employees;
    if (isFavoritesViewModeActive) {
      initialList = employees.filter(emp => 
        emp.id === currentUser.id || favoriteUserIds.includes(emp.id)
      );
    }
    
    const filtered = initialList.filter(emp => 
      emp.id === currentUser.id || 
      emp.lastName.toLowerCase().includes(lowerSearchTerm) ||
      emp.firstName.toLowerCase().includes(lowerSearchTerm) 
    );

    return filtered.sort((a, b) => {
      if (a.id === currentUser.id) return -1;
      if (b.id === currentUser.id) return 1;
      return a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName);
    });
  }, [employees, currentUser, searchTerm, isFavoritesViewModeActive, favoriteUserIds]);


  return (
    <div className="bg-pixel-bg-light dark:bg-pixel-bg-dark p-2 border-1 border-pixel-border-light dark:border-pixel-border-dark rounded-none">
      <div className="mb-3">
        <input 
          type="text"
          placeholder="Filtruj po imieniu/nazwisku..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/2 md:w-1/3 px-2 py-1.5 bg-pixel-card-light dark:bg-pixel-card-dark border-1 border-pixel-border-light dark:border-pixel-border-dark focus:outline-none focus:border-pixel-primary text-pixel-text-light dark:text-pixel-text-dark rounded-none text-sm"
        />
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[700px] lg:min-w-full">
          {/* Header Row */}
          <div className="grid sticky top-0 z-10" style={{ gridTemplateColumns: `120px repeat(${daysInMonth.length}, minmax(36px, 1fr))` }}>
            <div className="p-1.5 border-1 border-pixel-border-light dark:border-pixel-border-dark bg-pixel-card-light dark:bg-pixel-card-dark font-semibold text-xs text-pixel-text-light dark:text-pixel-text-dark sticky left-0 z-20 flex items-center justify-center">
              Pracownik
            </div>
            {daysInMonth.map(day => {
              const dayOfWeek = (getDay(day) + 6) % 7; 
              const isWeekendDay = dayOfWeek === 5 || dayOfWeek === 6;
              const holiday = getPublicHoliday(day);
              let headerCellBg = "bg-pixel-card-light dark:bg-pixel-card-dark";
              if (holiday) headerCellBg = "bg-holiday-light-bg dark:bg-holiday-dark-bg";
              else if (isWeekendDay) headerCellBg = "bg-weekend-light-bg dark:bg-weekend-dark-bg";
              
              return (
                <div 
                  key={format(day, 'dd-MM')} 
                  className={`p-1 text-center border-1 border-pixel-border-light dark:border-pixel-border-dark text-xs ${headerCellBg}`}
                  title={holiday || DAY_NAMES_PL_SHORT[dayOfWeek]}
                >
                  <span className="font-semibold block text-pixel-text-light dark:text-pixel-text-dark">{format(day, 'd')}</span>
                  <span className="text-pixel-text-alt-light dark:text-pixel-text-alt-dark block">{DAY_NAMES_PL_SHORT[dayOfWeek]}</span>
                </div>
              );
            })}
          </div>

          {/* Employee Rows */}
          {filteredAndSortedEmployees.map(employee => {
            const isCurrentUserRow = employee.id === currentUser.id;
            const rowHighlightClass = isCurrentUserRow ? 'bg-pixel-row-highlight-light dark:bg-pixel-row-highlight-dark' : 'bg-pixel-card-light dark:bg-pixel-card-dark';

            return (
              <div key={employee.id} className="grid" style={{ gridTemplateColumns: `120px repeat(${daysInMonth.length}, minmax(36px, 1fr))` }}>
                <div className={`p-1.5 border-l-1 border-r-1 border-b-1 border-pixel-border-light dark:border-pixel-border-dark text-xs sticky left-0 z-10 flex items-center ${rowHighlightClass}`} title={`${employee.firstName} ${employee.lastName} (${employee.team})`}>
                  <span className="truncate text-pixel-text-light dark:text-pixel-text-dark">{employee.firstName} {employee.lastName}</span>
                </div>
                {daysInMonth.map(day => {
                  const employeeVacationsOnDay = vacations.filter(v => 
                    v.employeeId === employee.id && 
                    isDateInRange(day, v.startDate, v.endDate) &&
                    v.status === VacationStatus.APPROVED
                  );
                  
                  // teamMemberStatus is not directly used by DayCell's new logic for matrix but can be kept for other potential uses
                  let determinedTeamMemberStatus: DayInfo['teamMemberStatus'] = 'Present';
                  if (employeeVacationsOnDay.length > 0) {
                    determinedTeamMemberStatus = employeeVacationsOnDay[0].vacationType;
                  }

                  const dayInfo: DayInfo = {
                    date: day,
                    isCurrentMonth: true, 
                    isToday: dateFnsIsToday(day),
                    isWeekend: checkIsWeekend(day),
                    isPublicHoliday: !!getPublicHoliday(day),
                    publicHolidayName: getPublicHoliday(day),
                    vacations: employeeVacationsOnDay, // Vacations for this specific employee on this day
                    teamMemberStatus: determinedTeamMemberStatus,
                    employeeIdForCell: employee.id // Pass employeeId for context in DayCell
                  };
                  
                  return (
                    <DayCell
                      key={formatIsoDate(day) + '-' + employee.id}
                      dayInfo={dayInfo}
                      isMatrixView={true}
                      currentUserId={currentUser.id} // Pass currentUserId
                      theme={theme} // Pass theme
                      onClick={onDayClick && isCurrentUserRow ? () => onDayClick(day, employee.id) : undefined} 
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MatrixView;