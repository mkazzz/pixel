import React from 'react';
import { Employee } from '../types';
import ActionButton from './SkeuomorphicButton';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface ManageFavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  allEmployees: Employee[];
  favoriteUserIds: string[];
  onToggleFavorite: (userId: string) => void;
}

const ManageFavoritesModal: React.FC<ManageFavoritesModalProps> = ({
  isOpen,
  onClose,
  allEmployees,
  favoriteUserIds,
  onToggleFavorite,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100]">
      <div className="bg-pixel-card-light dark:bg-pixel-card-dark p-5 border-1 border-pixel-border-light dark:border-pixel-border-dark w-full max-w-lg relative rounded-none">
        <ActionButton
          onClick={onClose}
          variant="secondary"
          size="sm"
          className="absolute top-2 right-2 !p-1.5"
          aria-label="Zamknij modal"
        >
          <XMarkIcon className="h-4 w-4" />
        </ActionButton>
        <h2 className="text-xl font-semibold text-pixel-text-light dark:text-pixel-text-dark mb-5 uppercase">
          Zarządzaj Ulubionymi
        </h2>
        <p className="text-sm text-pixel-text-alt-light dark:text-pixel-text-alt-dark mb-4">
          Wybierz użytkowników, których urlopy chcesz widzieć w widoku miesięcznym po włączeniu trybu "Ulubione".
        </p>

        <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1 border-t-1 border-b-1 border-pixel-border-light dark:border-pixel-border-dark py-3 my-3">
          {allEmployees.map(emp => (
            <div key={emp.id} className="flex items-center p-1.5 hover:bg-pixel-bg-light dark:hover:bg-pixel-bg-dark">
              <input
                type="checkbox"
                id={`fav-${emp.id}`}
                checked={favoriteUserIds.includes(emp.id)}
                onChange={() => onToggleFavorite(emp.id)}
                className="w-4 h-4 mr-2.5 accent-pixel-primary focus:ring-0 focus:ring-offset-0 border-pixel-border-light dark:border-pixel-border-dark rounded-none"
              />
              <label htmlFor={`fav-${emp.id}`} className="text-sm text-pixel-text-light dark:text-pixel-text-dark cursor-pointer">
                {emp.firstName} {emp.lastName} <span className="text-xs text-pixel-text-alt-light dark:text-pixel-text-alt-dark">({emp.team})</span>
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3 mt-4">
          <ActionButton type="button" onClick={onClose} variant="primary" size="md">
            Zamknij
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default ManageFavoritesModal;