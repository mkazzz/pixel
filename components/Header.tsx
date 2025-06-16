import React from 'react';
import { Employee, ViewMode } from '../types';
import ActionButton from './SkeuomorphicButton';
import { SunIcon, MoonIcon, CalendarDaysIcon, TableCellsIcon, ArrowLeftOnRectangleIcon, StarIcon as StarSolidIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';


interface HeaderProps {
  currentUser: Employee | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLogout: () => void;
  currentView: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isFavoritesViewActive: boolean;
  onToggleFavoritesView: () => void;
  onManageFavorites: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentUser, 
  theme, 
  toggleTheme, 
  onLogout, 
  currentView, 
  setViewMode,
  isFavoritesViewActive,
  onToggleFavoritesView,
  onManageFavorites
}) => {
  return (
    <header className="bg-pixel-card-light dark:bg-pixel-card-dark p-3 border-b-1 border-pixel-border-light dark:border-pixel-border-dark sticky top-0 z-50">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-pixel-text-light dark:text-pixel-text-dark uppercase">
          Pixel Planner
        </h1>
        
        <div className="flex items-center gap-2">
          {currentUser && (
            <div className="text-xs text-pixel-text-alt-light dark:text-pixel-text-alt-dark hidden md:block mr-2">
              User: <span className="font-semibold text-pixel-text-light dark:text-pixel-text-dark">{currentUser.firstName}</span>
            </div>
          )}

          <ActionButton
            onClick={() => setViewMode('monthly')}
            variant={currentView === 'monthly' ? 'primary' : 'secondary'}
            size="sm"
            title="Widok miesięczny"
          >
            <CalendarDaysIcon className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Miesiąc</span>
          </ActionButton>
          <ActionButton
            onClick={() => setViewMode('matrix')}
            variant={currentView === 'matrix' ? 'primary' : 'secondary'}
            size="sm"
            title="Widok matrycy"
          >
            <TableCellsIcon className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Matryca</span>
          </ActionButton>

          <ActionButton 
            onClick={onToggleFavoritesView} 
            size="sm" 
            variant={isFavoritesViewActive ? 'primary' : 'secondary'}
            title={isFavoritesViewActive ? "Ukryj Ulubione" : "Pokaż Ulubione"}
          >
            {isFavoritesViewActive ? <StarSolidIcon className="h-4 w-4 text-pixel-yellow" /> : <StarOutlineIcon className="h-4 w-4" />}
          </ActionButton>

          <ActionButton onClick={onManageFavorites} size="sm" variant="secondary" title="Zarządzaj Ulubionymi">
            <Cog6ToothIcon className="h-4 w-4" />
          </ActionButton>


          <ActionButton onClick={toggleTheme} size="sm" variant="secondary" title={theme === 'light' ? 'Tryb Ciemny' : 'Tryb Jasny'}>
            {theme === 'light' ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
          </ActionButton>
          
          {currentUser && (
            <ActionButton onClick={onLogout} size="sm" variant="danger" title="Wyloguj">
              <ArrowLeftOnRectangleIcon className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Exit</span>
            </ActionButton>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;