import React from 'react';
import { RemainingVacation, Vacation, Employee } from '../types';
import { calculateUsedVacationDays } from '../utils/dateUtils';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

interface VacationBalanceCardProps {
  currentUser: Employee;
  remainingVacationInfo: RemainingVacation | undefined;
  allVacations: Vacation[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const VacationBalanceCard: React.FC<VacationBalanceCardProps> = ({ 
  currentUser, 
  remainingVacationInfo, 
  allVacations,
  isExpanded,
  onToggleExpand
}) => {
  const initials = `${currentUser.firstName[0] || ''}${currentUser.lastName[0] || ''}`.toUpperCase();
  
  const daysUsedCalculated = remainingVacationInfo ? calculateUsedVacationDays(allVacations, currentUser.id) : 0;
  const daysRemaining = remainingVacationInfo ? remainingVacationInfo.daysPerYear - daysUsedCalculated : 0;

  return (
    <div className="bg-pixel-card-light dark:bg-pixel-card-dark p-4 border-1 border-pixel-border-light dark:border-pixel-border-dark rounded-none">
      <div 
        className="flex items-center mb-2 cursor-pointer group"
        onClick={onToggleExpand}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls="vacation-balance-details"
      >
        <div className="w-8 h-8 bg-pixel-primary text-white flex items-center justify-center text-sm font-bold mr-2.5 border-1 border-pixel-border-light dark:border-pixel-border-dark rounded-none group-hover:opacity-80">
          {initials}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-pixel-text-light dark:text-pixel-text-dark group-hover:text-pixel-primary">{currentUser.firstName} {currentUser.lastName}</h4>
          <p className="text-xs text-pixel-text-alt-light dark:text-pixel-text-alt-dark truncate group-hover:opacity-80" title={currentUser.email}>{currentUser.email}</p>
        </div>
      </div>
      
      <button
        onClick={onToggleExpand}
        className="flex items-center justify-between w-full text-xs text-pixel-text-alt-light dark:text-pixel-text-alt-dark hover:text-pixel-primary dark:hover:text-pixel-primary py-1.5 my-1 border-t-1 border-b-1 border-dashed border-pixel-border-light dark:border-pixel-border-dark focus:outline-none"
        aria-expanded={isExpanded}
        aria-controls="vacation-balance-details"
      >
        <span>{isExpanded ? "Zwiń" : "Rozwiń"} Podsumowanie Urlopu</span>
        {isExpanded ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
      </button>

      {isExpanded && (
        <div id="vacation-balance-details" className="mt-2">
          {!remainingVacationInfo ? (
             <p className="text-pixel-text-alt-light dark:text-pixel-text-alt-dark text-sm">Brak danych o balansie.</p>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-pixel-text-light dark:text-pixel-text-dark mb-2 pt-1 uppercase">Balans (UW)</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-pixel-text-alt-light dark:text-pixel-text-alt-dark">Dni na rok:</span>
                  <span className="font-semibold text-pixel-text-light dark:text-pixel-text-dark">{remainingVacationInfo.daysPerYear}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-pixel-text-alt-light dark:text-pixel-text-alt-dark">Wykorzystane:</span>
                  <span className="font-semibold text-pixel-danger">{daysUsedCalculated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-pixel-text-alt-light dark:text-pixel-text-alt-dark">Pozostałe:</span>
                  <span className="font-semibold text-pixel-green">{daysRemaining}</span>
                </div>
              </div>
              <p className="text-xs text-pixel-text-alt-light dark:text-pixel-text-alt-dark mt-3">
                Dotyczy urlopu (UW). Weekendy/święta pomijane.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VacationBalanceCard;