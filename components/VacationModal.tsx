import React, { useState, useEffect, useCallback } from 'react';
import { Vacation, VacationType, VacationTypeLabels, VacationStatus, Employee } from '../types';
import ActionButton from './SkeuomorphicButton'; 
import { formatIsoDate, parseIsoDate } from '../utils/dateUtils';
import { XMarkIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface VacationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vacation: Omit<Vacation, 'id' | 'status' | 'employeeId'> & { id?: string; startDate: string; endDate: string; }) => void;
  onDelete?: (vacationId: string) => void; 
  onDeleteInRange?: (range: { start: Date; end: Date }) => void;
  existingVacation?: Vacation | null;
  initialSingleDate?: Date | null; 
  initialSelectionRange?: { start: Date; end: Date } | null; 
  currentUser: Employee;
  initialVacationTypeForRange?: VacationType | null;
  isMixedTypeInRange?: boolean;
}

const VacationModal: React.FC<VacationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onDelete,
  onDeleteInRange,
  existingVacation, 
  initialSingleDate, 
  initialSelectionRange, 
  currentUser,
  initialVacationTypeForRange,
  isMixedTypeInRange 
}) => {
  const [vacationType, setVacationType] = useState<VacationType>(VacationType.UW);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isOpen) {
      setError(''); 
      return;
    }

    if (existingVacation) {
      setVacationType(existingVacation.vacationType);
      setStartDate(existingVacation.startDate);
      setEndDate(existingVacation.endDate);
      setNotes(existingVacation.notes || '');
    } else if (initialSelectionRange) {
      setStartDate(formatIsoDate(initialSelectionRange.start));
      setEndDate(formatIsoDate(initialSelectionRange.end));
      setVacationType(initialVacationTypeForRange || VacationType.UW);
      setNotes('');
    } else if (initialSingleDate) {
      const dateStr = formatIsoDate(initialSingleDate);
      setStartDate(dateStr);
      setEndDate(dateStr); 
      setVacationType(VacationType.UW); 
      setNotes('');
    } else { 
      const todayStr = formatIsoDate(new Date());
      setStartDate(todayStr);
      setEndDate(todayStr);
      setVacationType(VacationType.UW);
      setNotes('');
    }
  }, [existingVacation, initialSingleDate, initialSelectionRange, isOpen, initialVacationTypeForRange]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    setError(''); 

    if (vacationType === VacationType.BL) {
      setEndDate(newStartDate);
    } else {
      if (!endDate || (newStartDate && parseIsoDate(newStartDate) > parseIsoDate(endDate))) {
        setEndDate(newStartDate);
      }
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    setError(''); 
  };
  
  const handleVacationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as VacationType;
    setVacationType(newType);
    if (newType === VacationType.BL && startDate) {
      setEndDate(startDate); 
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!startDate || !endDate) {
      setError('Daty początku i końca są wymagane.');
      return;
    }
    if (parseIsoDate(startDate) > parseIsoDate(endDate)) {
      setError('Data początku nie może być późniejsza niż data końca.');
      return;
    }

    if (vacationType === VacationType.BL && startDate !== endDate) {
        setError('Urlop "Dzień z Bliskimi" może trwać tylko jeden dzień.');
        return;
    }

    onSubmit({
      id: existingVacation?.id,
      vacationType,
      startDate,
      endDate,
      notes,
    });
  };

  const handleDelete = () => {
    if (existingVacation && existingVacation.id && onDelete) {
      onDelete(existingVacation.id);
    }
  };

  const handleDeleteRange = () => {
    if (initialSelectionRange && onDeleteInRange) {
      onDeleteInRange(initialSelectionRange);
    }
  };


  if (!isOpen) return null;

  const isRangeMode = !!initialSelectionRange && !existingVacation;
  const inputBaseClass = "w-full px-2 py-1.5 bg-pixel-bg-light dark:bg-pixel-bg-dark border-1 border-pixel-border-light dark:border-pixel-border-dark focus:outline-none focus:border-pixel-primary text-pixel-text-light dark:text-pixel-text-dark rounded-none";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-pixel-card-light dark:bg-pixel-card-dark p-5 border-1 border-pixel-border-light dark:border-pixel-border-dark w-full max-w-md relative rounded-none">
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
          {existingVacation ? 'Edytuj Urlop' : (isRangeMode ? 'Ustaw dla Zakresu' : 'Dodaj Urlop')}
        </h2>

        {isRangeMode && isMixedTypeInRange && (
          <div className="mb-3 p-2 bg-pixel-yellow/30 border-1 border-pixel-yellow text-pixel-text-light dark:text-pixel-yellow text-xs flex items-start rounded-none">
            <ExclamationTriangleIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
            <span>Zakres zawiera różne typy lub dni bez urlopu. Zapis ustawi typ dla całego okresu.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="vacationType" className="block text-xs font-semibold text-pixel-text-alt-light dark:text-pixel-text-alt-dark mb-0.5 uppercase">Typ Urlopu</label>
            <select
              id="vacationType"
              value={vacationType}
              onChange={handleVacationTypeChange}
              className={inputBaseClass}
            >
              {Object.values(VacationType).map(type => (
                <option key={type} value={type}>{VacationTypeLabels[type]}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="startDate" className="block text-xs font-semibold text-pixel-text-alt-light dark:text-pixel-text-alt-dark mb-0.5 uppercase">Data Od</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={handleStartDateChange}
                disabled={isRangeMode} 
                className={`${inputBaseClass} ${isRangeMode ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-xs font-semibold text-pixel-text-alt-light dark:text-pixel-text-alt-dark mb-0.5 uppercase">Data Do</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                min={startDate} 
                onChange={handleEndDateChange}
                disabled={vacationType === VacationType.BL || isRangeMode} 
                className={`${inputBaseClass} ${vacationType === VacationType.BL || isRangeMode ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
          <div>
            <label htmlFor="notes" className="block text-xs font-semibold text-pixel-text-alt-light dark:text-pixel-text-alt-dark mb-0.5 uppercase">Notatki</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={inputBaseClass}
            />
          </div>
          {error && <p className="text-xs text-pixel-danger">{error}</p>}
          <div className="flex justify-between items-center pt-3 border-t-1 border-pixel-border-light dark:border-pixel-border-dark mt-4">
            <div>
              {existingVacation && onDelete && (
                <ActionButton type="button" onClick={handleDelete} variant="danger" size="md">
                  <TrashIcon className="h-3 w-3 sm:mr-1 inline-block" /> Usuń
                </ActionButton>
              )}
              {isRangeMode && onDeleteInRange && initialSelectionRange && (
                <ActionButton type="button" onClick={handleDeleteRange} variant="danger" size="md">
                  <TrashIcon className="h-3 w-3 sm:mr-1 inline-block" /> Wyczyść
                </ActionButton>
              )}
            </div>
            <div className="flex gap-2">
              <ActionButton type="button" onClick={onClose} variant="secondary" size="md">
                Anuluj
              </ActionButton>
              <ActionButton type="submit" variant="primary" size="md">
                Zapisz
              </ActionButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VacationModal;