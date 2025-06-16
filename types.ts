

export enum VacationType {
  UW = "UW", // Urlop wypoczynkowy
  CH = "CH", // Chorobowe
  HO = "HO", // Home office
  DEL = "Del", // Delegacja / wyjazd służbowy
  FW = "FW", // Workation
  BL = "BL", // Dzień z bliskimi
  IN = "IN", // INNE
}

export const VacationTypeLabels: Record<VacationType, string> = {
  [VacationType.UW]: "Urlop Wypoczynkowy",
  [VacationType.CH]: "Chorobowe",
  [VacationType.HO]: "Home Office",
  [VacationType.DEL]: "Delegacja",
  [VacationType.FW]: "Workation",
  [VacationType.BL]: "Dzień z Bliskimi",
  [VacationType.IN]: "Inne",
};

export enum VacationStatus {
  REQUESTED = "Oczekujący",
  APPROVED = "Zaakceptowany",
  REJECTED = "Odrzucony",
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  team: string;
  role: string;
}

export interface Vacation {
  id: string;
  employeeId: string;
  vacationType: VacationType;
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string; // ISO date string YYYY-MM-DD
  status: VacationStatus;
  notes?: string;
}

export interface RemainingVacation {
  employeeId: string;
  daysPerYear: number;
  daysUsed: number; // Specifically for UW, for simplicity
}

export interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  isPublicHoliday: boolean;
  publicHolidayName?: string;
  vacations: Vacation[]; // Vacations for the current user (monthly view default) or specific employee (matrix view)
  allUserVacationsOnDay?: { employeeId: string; vacationType: VacationType }[]; // For favorites mode in monthly view
  teamMemberStatus?: 'Present' | 'Absent' | VacationType; // General status for matrix, DayCell may use more specific logic now
  employeeIdForCell?: string; // ID of the employee this cell pertains to in MatrixView
}

export type ViewMode = 'monthly' | 'matrix';