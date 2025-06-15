import React from 'react';
import ActionButton from './SkeuomorphicButton';
import { getMonthYearString } from '../utils/dateUtils';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/solid';

interface CalendarControlsProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const CalendarControls: React.FC<CalendarControlsProps> = ({ currentDate, onPrevMonth, onNextMonth, onToday }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-4 p-2.5 bg-pixel-card-light dark:bg-pixel-card-dark border-1 border-pixel-border-light dark:border-pixel-border-dark rounded-none">
      <div className="flex items-center gap-1.5 mb-2 sm:mb-0">
        <ActionButton onClick={onPrevMonth} variant="secondary" size="md" aria-label="Poprzedni miesiąc">
          <ChevronLeftIcon className="h-4 w-4" />
        </ActionButton>
        <ActionButton onClick={onToday} variant="secondary" size="md" aria-label="Dzisiaj">
          <CalendarIcon className="h-4 w-4 sm:mr-1.5" /> <span className="hidden sm:inline">Dzisiaj</span>
        </ActionButton>
        <ActionButton onClick={onNextMonth} variant="secondary" size="md" aria-label="Następny miesiąc">
          <ChevronRightIcon className="h-4 w-4" />
        </ActionButton>
      </div>
      <h2 className="text-lg font-semibold text-pixel-text-light dark:text-pixel-text-dark text-center sm:text-left capitalize">
        {getMonthYearString(currentDate)}
      </h2>
    </div>
  );
};

export default CalendarControls;