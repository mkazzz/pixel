import React from 'react';
import { DayInfo, Vacation, VacationType, VacationTypeLabels, VacationStatus } from '../types';
import { format } from 'date-fns';
import { VACATION_TYPE_STYLES } from '../constants';
import { HomeIcon, SunIcon, XMarkIcon } from '@heroicons/react/24/solid'; // Import icons
import { Theme } from '../hooks/useTheme';

interface DayCellProps {
  dayInfo: DayInfo;
  currentUserId: string; 
  theme?: Theme; 
  isMatrixView?: boolean;
  onClick?: () => void;
  onMouseDown?: (date: Date) => void;
  onMouseOver?: (date: Date) => void;
  isRangeHighlighted?: boolean;
  isFavoritesViewModeActive?: boolean; 
}

const DayCell: React.FC<DayCellProps> = ({ 
  dayInfo, 
  currentUserId,
  theme,
  isMatrixView = false, 
  onClick, 
  onMouseDown, 
  onMouseOver, 
  isRangeHighlighted,
  isFavoritesViewModeActive = false
}) => {
  const { date, isCurrentMonth, isToday, isWeekend, isPublicHoliday, publicHolidayName, vacations, allUserVacationsOnDay } = dayInfo;

  let baseCellClasses = "p-1.5 h-16 sm:h-20 flex flex-col relative overflow-hidden transition-none border-1 rounded-none ";
  let dayNumberClasses = "text-xs font-semibold ";
  let holidayNameClasses = "block text-[0.6rem] opacity-90 truncate mt-0.5 ";
  
  let contentToRender: React.ReactNode = null;
  let dynamicBgClass = "";
  let textOrIconColorClass = "";

  const approvedVacationsForCell = vacations.filter(v => v.status === VacationStatus.APPROVED);
  const primaryVacationForCell = approvedVacationsForCell.length > 0 ? approvedVacationsForCell[0] : null;


  if (isMatrixView) {
    baseCellClasses = "p-1 h-9 text-center border-r-1 border-b-1 border-pixel-border-light dark:border-pixel-border-dark flex items-center justify-center relative rounded-none ";
    dayNumberClasses = "absolute top-0.5 right-0.5 text-[0.55rem] text-pixel-text-alt-light dark:text-pixel-text-alt-dark"; // Not used for rendering number in matrix cell

    if (isPublicHoliday) {
      dynamicBgClass = "bg-holiday-light-bg dark:bg-holiday-dark-bg";
      textOrIconColorClass = theme === 'dark' ? "text-pixel-text-on-special-dark" : "text-black";
    } else if (isWeekend) {
      dynamicBgClass = "bg-weekend-light-bg dark:bg-weekend-dark-bg"; // Will now use holiday colors due to Tailwind config change
      textOrIconColorClass = theme === 'dark' ? "text-pixel-text-on-special-dark" : "text-black"; // Match holiday text color for light mode
    } else {
      dynamicBgClass = "bg-pixel-card-light dark:bg-pixel-card-dark";
      textOrIconColorClass = "text-pixel-text-light dark:text-pixel-text-dark";
    }

    const isCurrentUserCell = dayInfo.employeeIdForCell === currentUserId;

    if (isCurrentUserCell) {
      if (primaryVacationForCell) { 
        const style = VACATION_TYPE_STYLES[primaryVacationForCell.vacationType];
        if (!isPublicHoliday && !isWeekend) { 
          dynamicBgClass = style.bg;
        }
        textOrIconColorClass = style.text; // Use vacation-specific text color
        contentToRender = <span className={`text-[0.65rem] font-bold ${textOrIconColorClass}`}>{primaryVacationForCell.vacationType}</span>;
      } else { 
        contentToRender = null; 
      }
    } else { // Other users
      if (primaryVacationForCell) { 
        switch (primaryVacationForCell.vacationType) {
          case VacationType.HO:
            contentToRender = <HomeIcon className={`h-3.5 w-3.5 ${textOrIconColorClass}`} title={VacationTypeLabels.HO} />;
            break;
          case VacationType.FW:
            contentToRender = <SunIcon className={`h-3.5 w-3.5 ${textOrIconColorClass}`} title={VacationTypeLabels.FW} />;
            break;
          default: 
             const xColorClass = (isPublicHoliday || isWeekend) 
                ? textOrIconColorClass 
                : "text-pixel-danger"; 
            contentToRender = <XMarkIcon className={`h-4 w-4 ${xColorClass}`} title="Nieobecny" />;
            break;
        }
      } else { 
        contentToRender = null; 
      }
    }
     baseCellClasses += dynamicBgClass;

  } else { // Monthly View Logic
      baseCellClasses += "border-pixel-border-light dark:border-pixel-border-dark ";
      if (!isCurrentMonth) {
        baseCellClasses += "bg-pixel-bg-light dark:bg-pixel-bg-dark text-pixel-text-alt-light dark:text-pixel-text-alt-dark opacity-50";
        dayNumberClasses += "text-pixel-text-alt-light dark:text-pixel-text-alt-dark";
      } else {
        dayNumberClasses += "text-pixel-text-light dark:text-pixel-text-dark";
        if (isPublicHoliday) {
          baseCellClasses += "bg-holiday-light-bg dark:bg-holiday-dark-bg ";
          holidayNameClasses += "text-pixel-orange dark:text-pixel-yellow";
          dayNumberClasses = dayNumberClasses.replace("text-pixel-text-light dark:text-pixel-text-dark", "text-black dark:text-black");
        } else if (isWeekend) {
          baseCellClasses += "bg-weekend-light-bg dark:bg-weekend-dark-bg ";
          dayNumberClasses = dayNumberClasses.replace("text-pixel-text-light dark:text-pixel-text-dark", "text-black dark:text-black"); // Match holiday text color for light mode
        } else if (primaryVacationForCell && primaryVacationForCell.employeeId === currentUserId && !isFavoritesViewModeActive) {
          const typeStyle = VACATION_TYPE_STYLES[primaryVacationForCell.vacationType];
          baseCellClasses += ` ${typeStyle.bg} ${typeStyle.text} flex flex-col justify-between `;
          dayNumberClasses = `text-xs font-semibold ${typeStyle.text}`; 
        } else {
            baseCellClasses += "bg-pixel-card-light dark:bg-pixel-card-dark "; 
        }
      }
  }
  
  if (isToday) {
    baseCellClasses += " border-2 border-pixel-primary "; 
    if (!isMatrixView) {
        const isSpecialBg = isPublicHoliday || isWeekend || (primaryVacationForCell && primaryVacationForCell.employeeId === currentUserId && !isFavoritesViewModeActive && isCurrentMonth);
        dayNumberClasses += ` !font-extrabold ${isSpecialBg ? '' : '!text-pixel-primary' }`;
    }
  }
  
  if (isRangeHighlighted && !isMatrixView && isCurrentMonth) {
    baseCellClasses += " outline-2 outline-pixel-primary outline-offset-[-2px] outline-dashed "; 
  }

  const vacationDotsToShow = (isFavoritesViewModeActive && allUserVacationsOnDay && allUserVacationsOnDay.length > 0 && isCurrentMonth && !isPublicHoliday && !isWeekend)
    ? allUserVacationsOnDay
    : [];
  const MAX_DOTS = 4;

  return (
    <div 
      className={`${baseCellClasses} ${onClick && (isCurrentMonth || isMatrixView) ? 'cursor-pointer hover:opacity-80' : ''} ${(!isCurrentMonth && !isMatrixView) ? 'pointer-events-none' : ''}`} 
      onClick={(!onMouseDown && !onMouseOver && (isCurrentMonth || isMatrixView)) ? onClick : undefined}
      onMouseDown={onMouseDown && isCurrentMonth && !isMatrixView ? () => onMouseDown(date) : undefined}
      onMouseOver={onMouseOver && isCurrentMonth && !isMatrixView ? () => onMouseOver(date) : undefined}
      role="gridcell"
      aria-label={`${format(date, 'd MMMM yyyy')} ${publicHolidayName || ''} ${primaryVacationForCell ? VacationTypeLabels[primaryVacationForCell.vacationType] : ''}`}
    >
      {!isMatrixView && (
        <div className="flex-shrink-0">
          <span className={`${dayNumberClasses}`}>
            {format(date, 'd')}
          </span>
          {isPublicHoliday && isCurrentMonth && (
             <span className={`${holidayNameClasses}`} title={publicHolidayName}>{publicHolidayName}</span>
          )}
        </div>
      )}

      {isMatrixView && contentToRender}
      
      {!isMatrixView && primaryVacationForCell && primaryVacationForCell.employeeId === currentUserId && isCurrentMonth && !isPublicHoliday && !isWeekend && !isFavoritesViewModeActive && (
        <div 
            className="text-center text-[0.65rem] font-bold py-0.5 mt-auto leading-tight"
            title={`${VacationTypeLabels[primaryVacationForCell.vacationType]}${primaryVacationForCell.notes ? `: ${primaryVacationForCell.notes}` : ''}`}
        >
          {primaryVacationForCell.vacationType}
        </div>
      )}

      {!isMatrixView && isFavoritesViewModeActive && vacationDotsToShow.length > 0 && (
        <div className="flex items-center justify-center space-x-0.5 mt-auto h-3">
          {vacationDotsToShow.slice(0, MAX_DOTS).map((vac, index) => {
             let dotBgClass = 'bg-pixel-secondary'; 
            if (vac.employeeId === currentUserId || vac.vacationType === VacationType.FW || vac.vacationType === VacationType.HO) {
                dotBgClass = VACATION_TYPE_STYLES[vac.vacationType]?.bg || dotBgClass;
            } else {
                dotBgClass = 'bg-pixel-absent-private-bg-light dark:bg-pixel-absent-private-bg-dark'; 
            }
            return (
                <span 
                key={`${vac.employeeId}-${index}`} 
                className={`block w-1.5 h-1.5 ${dotBgClass}`}
                title={VacationTypeLabels[vac.vacationType]}
                ></span>
            );
            })}
          {vacationDotsToShow.length > MAX_DOTS && (
            <span className="text-[0.6rem] leading-none text-pixel-text-alt-light dark:text-pixel-text-alt-dark ml-0.5">+</span>
          )}
        </div>
      )}
    </div>
  );
};

export default DayCell;