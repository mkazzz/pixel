import React, { useState, useEffect, useCallback } from 'react';
import { addMonths, /* subMonths, */ eachDayOfInterval, isEqual, addDays /* subDays */ } from 'date-fns';
import subMonths from 'date-fns/subMonths';
import subDays from 'date-fns/subDays';
import { useTheme } from './hooks/useTheme';
import { useMockAuth } from './hooks/useMockAuth';
import Header from './components/Header';
import LoginScreen from './components/LoginScreen';
import CalendarControls from './components/CalendarControls';
import MonthlyCalendarView from './components/MonthlyCalendarView';
import MatrixView from './components/MatrixView';
import VacationBalanceCard from './components/VacationBalanceCard';
import VacationModal from './components/VacationModal';
import ManageFavoritesModal from './components/ManageFavoritesModal';
import { Employee, Vacation, RemainingVacation, ViewMode, VacationStatus, VacationType } from './types';
import { MOCK_EMPLOYEES, MOCK_VACATIONS, MOCK_REMAINING_VACATION } from './constants';
import ActionButton from './components/SkeuomorphicButton'; 
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import { parseIsoDate, formatIsoDate, isDateInRange } from './utils/dateUtils';


const generateVacationId = () => `v${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const FAVORITES_STORAGE_KEY = 'pixelPlannerFavorites';

const App: React.FC = () => {
  const [theme, toggleTheme] = useTheme();
  const { currentUser, isAuthenticated, login, logout } = useMockAuth();
  
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [vacations, setVacations] = useState<Vacation[]>(MOCK_VACATIONS);
  const [remainingVacations, setRemainingVacations] = useState<RemainingVacation[]>(MOCK_REMAINING_VACATION);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedVacationToEdit, setSelectedVacationToEdit] = useState<Vacation | null>(null);
  const [selectedDateForNewVacation, setSelectedDateForNewVacation] = useState<Date | null>(null);
  const [selectedRangeForModal, setSelectedRangeForModal] = useState<{ start: Date; end: Date } | null>(null);
  const [initialVacationTypeForRange, setInitialVacationTypeForRange] = useState<VacationType | null>(null);
  const [isMixedTypeInRange, setIsMixedTypeInRange] = useState<boolean>(false);

  // Favorites System State
  const [favoriteUserIds, setFavoriteUserIds] = useState<string[]>(() => {
    const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  });
  const [isFavoritesViewModeActive, setIsFavoritesViewModeActive] = useState<boolean>(false);
  const [isManageFavoritesModalOpen, setIsManageFavoritesModalOpen] = useState<boolean>(false);

  // Vacation Balance Card State
  const [isBalanceCardExpanded, setIsBalanceCardExpanded] = useState<boolean>(true);

  const toggleBalanceCardExpand = useCallback(() => {
    setIsBalanceCardExpanded(prev => !prev);
  }, []);


  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteUserIds));
  }, [favoriteUserIds]);

  const toggleFavoriteUser = useCallback((userId: string) => {
    setFavoriteUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  }, []);

  const toggleFavoritesViewMode = useCallback(() => {
    setIsFavoritesViewModeActive(prev => !prev);
  }, []);

  const openManageFavoritesModal = useCallback(() => setIsManageFavoritesModalOpen(true), []);
  const closeManageFavoritesModal = useCallback(() => setIsManageFavoritesModalOpen(false), []);
  
  const determineVacationInfoForRange = useCallback((range: { start: Date; end: Date }, userId: string, allVacations: Vacation[]) => {
    const daysInSelectedRange = eachDayOfInterval({ start: range.start, end: range.end });
    let uniqueType: VacationType | null = null;
    let firstVacationFound = false;
    let mixed = false;

    for (const day of daysInSelectedRange) {
      const dayStr = formatIsoDate(day);
      const vacationOnDay = allVacations.find(v => 
        v.employeeId === userId &&
        v.status === VacationStatus.APPROVED &&
        dayStr >= v.startDate && dayStr <= v.endDate
      );

      if (vacationOnDay) {
        if (!firstVacationFound) {
          uniqueType = vacationOnDay.vacationType;
          firstVacationFound = true;
        } else if (vacationOnDay.vacationType !== uniqueType) {
          mixed = true;
          uniqueType = null; 
          break; 
        }
      } else { 
        if (firstVacationFound) mixed = true; 
      }
    }
     if (!firstVacationFound) uniqueType = null;

    return { uniqueType, isMixed: mixed || (firstVacationFound && uniqueType === null)};
  }, []);


  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => subMonths(prev, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => addMonths(prev, 1));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const closeModalAndResetSelection = () => {
    setIsModalOpen(false);
    setSelectedVacationToEdit(null);
    setSelectedDateForNewVacation(null);
    setSelectedRangeForModal(null);
    setInitialVacationTypeForRange(null);
    setIsMixedTypeInRange(false);
  };

  const handleDayClick = useCallback((date: Date) => {
    if (!currentUser) return;
    const clickedDateStr = formatIsoDate(date);
    const existing = vacations.find(v => 
      v.employeeId === currentUser.id && 
      v.status === VacationStatus.APPROVED &&
      clickedDateStr >= v.startDate && 
      clickedDateStr <= v.endDate
    );

    closeModalAndResetSelection(); 
    if (existing) {
      setSelectedVacationToEdit(existing);
    } else {
      setSelectedDateForNewVacation(date);
    }
    setIsModalOpen(true);
  }, [vacations, currentUser]);

  const handleRangeSelect = useCallback((startDate: Date, endDate: Date) => {
    if (!currentUser) return;
    closeModalAndResetSelection(); 
    
    const { uniqueType, isMixed } = determineVacationInfoForRange({ start: startDate, end: endDate }, currentUser.id, vacations);
    setInitialVacationTypeForRange(uniqueType);
    setIsMixedTypeInRange(isMixed);
    setSelectedRangeForModal({ start: startDate, end: endDate });
    setIsModalOpen(true);
  }, [currentUser, vacations, determineVacationInfoForRange]);


  const processVacationListForRangeOperation = (
    currentVacations: Vacation[],
    userId: string,
    range: { start: Date; end: Date },
    operation: 'submit' | 'delete',
    newVacationData?: Omit<Vacation, 'id' | 'status' | 'employeeId'>
  ): Vacation[] => {
    const outputVacations: Vacation[] = [];
    const rangeStart = parseIsoDate(formatIsoDate(range.start)); 
    const rangeEnd = parseIsoDate(formatIsoDate(range.end));     

    for (const v of currentVacations) {
      if (v.employeeId !== userId || v.status !== VacationStatus.APPROVED) {
        outputVacations.push(v);
        continue;
      }

      const vStart = parseIsoDate(v.startDate);
      const vEnd = parseIsoDate(v.endDate);

      // Case 1: Vacation is completely outside the range
      if (vEnd < rangeStart || vStart > rangeEnd) {
        outputVacations.push(v);
        continue;
      }

      // Case 2: Vacation is completely within the range (to be removed/replaced)
      if (vStart >= rangeStart && vEnd <= rangeEnd) {
        // Just skip it, it will be replaced if 'submit'
        continue;
      }

      // Case 3: Vacation completely envelops the range (split it)
      if (vStart < rangeStart && vEnd > rangeEnd) {
        outputVacations.push({ ...v, id: generateVacationId(), endDate: formatIsoDate(subDays(rangeStart, 1)) });
        outputVacations.push({ ...v, id: generateVacationId(), startDate: formatIsoDate(addDays(rangeEnd, 1)) });
        continue;
      }

      // Case 4: Vacation overlaps the start of the range (truncate end)
      if (vStart < rangeStart && vEnd >= rangeStart && vEnd <= rangeEnd) {
         if (!isEqual(vStart, rangeStart)) { // Check if there's actually a part before the range
            outputVacations.push({ ...v, id: generateVacationId(), endDate: formatIsoDate(subDays(rangeStart, 1)) });
         }
        continue; // The part within the range is handled by Case 2 logic (skipped)
      }
      
      // Case 5: Vacation overlaps the end of the range (truncate start)
      if (vStart >= rangeStart && vStart <= rangeEnd && vEnd > rangeEnd) {
        if(!isEqual(vEnd, rangeEnd)) { // Check if there's actually a part after the range
            outputVacations.push({ ...v, id: generateVacationId(), startDate: formatIsoDate(addDays(rangeEnd, 1)) });
        }
        continue; // The part within the range is handled by Case 2 logic (skipped)
      }
      
      // Default: if none of the above, push the original (should be rare if logic is correct)
      outputVacations.push(v);
    }

    if (operation === 'submit' && newVacationData) {
      outputVacations.push({
        id: generateVacationId(),
        employeeId: userId,
        vacationType: newVacationData.vacationType,
        startDate: formatIsoDate(rangeStart),
        endDate: formatIsoDate(rangeEnd),
        notes: newVacationData.notes,
        status: VacationStatus.APPROVED,
      });
    }
    return outputVacations;
  };


  const handleVacationSubmit = useCallback((vacationData: Omit<Vacation, 'status' | 'employeeId'> & { id?: string }) => {
    if (!currentUser) return;

    if (parseIsoDate(vacationData.startDate) > parseIsoDate(vacationData.endDate)) {
        console.error("Start date cannot be after end date.");
        return; 
    }
     if (vacationData.vacationType === VacationType.BL && vacationData.startDate !== vacationData.endDate) {
        console.error("BL vacation can only be one day.");
        return;
    }

    setVacations(prevVacations => {
      if (selectedRangeForModal) {
        return processVacationListForRangeOperation(
          prevVacations,
          currentUser.id,
          selectedRangeForModal,
          'submit',
          vacationData
        );
      } else if (vacationData.id) { 
        return prevVacations.map(v => 
            v.id === vacationData.id 
            ? { ...v, startDate: vacationData.startDate, endDate: vacationData.endDate, vacationType: vacationData.vacationType, notes: vacationData.notes, status: VacationStatus.APPROVED } 
            : v
        );
      } else { 
          const newSingleVacation: Vacation = {
            id: generateVacationId(),
            employeeId: currentUser.id,
            vacationType: vacationData.vacationType,
            startDate: vacationData.startDate, 
            endDate: vacationData.endDate,
            notes: vacationData.notes,
            status: VacationStatus.APPROVED,
        };
        return [...prevVacations, newSingleVacation];
      }
    });
    closeModalAndResetSelection();
  }, [currentUser, selectedRangeForModal]);

  const handleVacationDelete = useCallback((vacationId: string) => {
    setVacations(prev => prev.filter(v => v.id !== vacationId));
    closeModalAndResetSelection();
  }, []);

  const handleVacationDeleteInRange = useCallback((range: { start: Date; end: Date }) => {
    if (!currentUser) return;
    setVacations(prevVacations => 
      processVacationListForRangeOperation(
        prevVacations,
        currentUser.id,
        range,
        'delete'
      )
    );
    closeModalAndResetSelection();
  }, [currentUser]);


  const handleOpenNewRequestModal = useCallback(() => {
    closeModalAndResetSelection();
    setSelectedDateForNewVacation(new Date()); 
    setIsModalOpen(true);
  }, []);


  if (!isAuthenticated || !currentUser) {
    return <LoginScreen onLogin={login} />;
  }

  const currentUserRemainingVacation = remainingVacations.find(rv => rv.employeeId === currentUser.id);

  return (
    <div className={`min-h-screen flex flex-col ${theme} bg-pixel-bg-light dark:bg-pixel-bg-dark text-pixel-text-light dark:text-pixel-text-dark`}>
      <Header 
        currentUser={currentUser} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onLogout={logout}
        currentView={viewMode}
        setViewMode={setViewMode}
        isFavoritesViewActive={isFavoritesViewModeActive}
        onToggleFavoritesView={toggleFavoritesViewMode}
        onManageFavorites={openManageFavoritesModal}
      />
      <main className="flex-grow container mx-auto p-3 sm:p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-4">
            {currentUserRemainingVacation && (
              <VacationBalanceCard 
                currentUser={currentUser} 
                remainingVacationInfo={currentUserRemainingVacation}
                allVacations={vacations}
                isExpanded={isBalanceCardExpanded}
                onToggleExpand={toggleBalanceCardExpand} 
              />
            )}
             <ActionButton 
                onClick={handleOpenNewRequestModal}
                variant="primary"
                className="w-full"
                size="lg"
              >
                <PlusCircleIcon className="h-4 w-4 inline-block mr-1.5" />
                Dodaj Urlop
              </ActionButton>
          </div>
          <div className="lg:col-span-2">
            <CalendarControls 
              currentDate={currentDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onToday={handleToday}
            />
            {viewMode === 'monthly' && currentUser && (
              <MonthlyCalendarView 
                currentDate={currentDate}
                allVacations={vacations}
                allEmployees={employees}
                currentUser={currentUser}
                favoriteUserIds={favoriteUserIds}
                isFavoritesViewModeActive={isFavoritesViewModeActive}
                onDayClick={handleDayClick}
                onRangeSelect={handleRangeSelect}
              />
            )}
            {viewMode === 'matrix' && currentUser && (
              <MatrixView 
                currentDate={currentDate}
                employees={employees}
                vacations={vacations}
                currentUser={currentUser}
                theme={theme} // Pass theme to MatrixView
                isFavoritesViewModeActive={isFavoritesViewModeActive}
                favoriteUserIds={favoriteUserIds}
              />
            )}
          </div>
        </div>
      </main>
      <VacationModal
        isOpen={isModalOpen}
        onClose={closeModalAndResetSelection}
        onSubmit={handleVacationSubmit}
        onDelete={handleVacationDelete}
        onDeleteInRange={handleVacationDeleteInRange}
        existingVacation={selectedVacationToEdit}
        initialSingleDate={selectedDateForNewVacation}
        initialSelectionRange={selectedRangeForModal}
        currentUser={currentUser}
        initialVacationTypeForRange={initialVacationTypeForRange}
        isMixedTypeInRange={isMixedTypeInRange}
      />
      {currentUser && (
        <ManageFavoritesModal
            isOpen={isManageFavoritesModalOpen}
            onClose={closeManageFavoritesModal}
            allEmployees={employees}
            favoriteUserIds={favoriteUserIds}
            onToggleFavorite={toggleFavoriteUser}
        />
      )}
      <footer className="text-center py-3 text-xs text-pixel-text-alt-light dark:text-pixel-text-alt-dark border-t-1 border-pixel-border-light dark:border-pixel-border-dark mt-auto bg-pixel-card-light dark:bg-pixel-card-dark">
        PIXEL PLANNER &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;