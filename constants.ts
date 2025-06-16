import { Employee, Vacation, RemainingVacation, VacationType, VacationStatus } from './types';

export const MOCK_EMPLOYEES: Employee[] = [
  { id: "1", firstName: "Anna", lastName: "Kowalska", email: "anna.kowalska@example.com", team: "Marketing", role: "Specjalista ds. Marketingu" },
  { id: "2", firstName: "Piotr", lastName: "Nowak", email: "piotr.nowak@example.com", team: "Marketing", role: "Młodszy Specjalista" },
  { id: "3", firstName: "Zofia", lastName: "Wiśniewska", email: "zofia.wisniewska@example.com", team: "IT", role: "Programista" },
  { id: "4", firstName: "Krzysztof", lastName: "Wójcik", email: "krzysztof.wojcik@example.com", team: "IT", role: "Administrator Systemów" },
  { id: "5", firstName: "Ewa", lastName: "Lewandowska", email: "ewa.lewandowska@example.com", team: "HR", role: "HR Manager" },
];

export const MOCK_CURRENT_USER_ID = "1"; // Anna Kowalska

export const MOCK_VACATIONS: Vacation[] = [
  { id: "v1", employeeId: "1", vacationType: VacationType.UW, startDate: "2024-07-22", endDate: "2024-07-26", status: VacationStatus.APPROVED, notes: "Wakacje nad morzem" },
  { id: "v2", employeeId: "1", vacationType: VacationType.HO, startDate: "2024-07-15", endDate: "2024-07-15", status: VacationStatus.APPROVED },
  { id: "v3", employeeId: "2", vacationType: VacationType.CH, startDate: "2024-07-18", endDate: "2024-07-19", status: VacationStatus.APPROVED },
  { id: "v4", employeeId: "3", vacationType: VacationType.DEL, startDate: "2024-07-08", endDate: "2024-07-10", status: VacationStatus.APPROVED, notes: "Konferencja w Berlinie" },
  { id: "v5", employeeId: "1", vacationType: VacationType.BL, startDate: "2024-08-05", endDate: "2024-08-05", status: VacationStatus.APPROVED }, // Changed to APPROVED for testing
  { id: "v6", employeeId: "4", vacationType: VacationType.FW, startDate: "2024-08-12", endDate: "2024-08-16", status: VacationStatus.APPROVED, notes: "Workation na Maderze"},
  { id: "v7", employeeId: "2", vacationType: VacationType.UW, startDate: "2024-08-19", endDate: "2024-08-23", status: VacationStatus.APPROVED },
];

export const MOCK_REMAINING_VACATION: RemainingVacation[] = [
  { employeeId: "1", daysPerYear: 26, daysUsed: 5 }, // Assuming 5 days UW used from v1
  { employeeId: "2", daysPerYear: 20, daysUsed: 0 },
  { employeeId: "3", daysPerYear: 26, daysUsed: 0 },
  { employeeId: "4", daysPerYear: 26, daysUsed: 0 },
  { employeeId: "5", daysPerYear: 26, daysUsed: 0 },
];

export const POLISH_PUBLIC_HOLIDAYS: Record<string, Record<string, string>> = {
  "2024": {
    "01-01": "Nowy Rok",
    "01-06": "Trzech Króli",
    "03-31": "Wielkanoc",
    "04-01": "Poniedziałek Wielkanocny",
    "05-01": "Święto Pracy",
    "05-03": "Święto Konstytucji 3 Maja",
    "05-19": "Zesłanie Ducha Świętego (Zielone Świątki)",
    "05-30": "Boże Ciało",
    "08-15": "Wniebowzięcie Najświętszej Maryi Panny, Święto Wojska Polskiego",
    "11-01": "Wszystkich Świętych",
    "11-11": "Narodowe Święto Niepodległości",
    "12-25": "Boże Narodzenie (pierwszy dzień)",
    "12-26": "Boże Narodzenie (drugi dzień)",
  },
  "2025": {
    "01-01": "Nowy Rok",
    "01-06": "Trzech Króli",
    "04-20": "Wielkanoc",
    "04-21": "Poniedziałek Wielkanocny",
    "05-01": "Święto Pracy",
    "05-03": "Święto Konstytucji 3 Maja",
    "06-08": "Zesłanie Ducha Świętego (Zielone Świątki)",
    "06-19": "Boże Ciało",
    "08-15": "Wniebowzięcie Najświętszej Maryi Panny, Święto Wojska Polskiego",
    "11-01": "Wszystkich Świętych",
    "11-11": "Narodowe Święto Niepodległości",
    "12-25": "Boże Narodzenie (pierwszy dzień)",
    "12-26": "Boże Narodzenie (drugi dzień)",
  }
};

// Updated to use pixel art color palette defined in index.html via Tailwind
// The 'bg-' prefix will refer to the colors defined in tailwind.config
export const VACATION_TYPE_STYLES: Record<VacationType, {bg: string, text: string}> = {
  [VacationType.UW]: { bg: "bg-uw", text: "text-white" }, // e.g., bg-pixel-blue, text-white
  [VacationType.CH]: { bg: "bg-ch", text: "text-white" }, // e.g., bg-pixel-red, text-white
  [VacationType.HO]: { bg: "bg-ho", text: "text-white" }, // e.g., bg-pixel-green, text-white
  [VacationType.DEL]: { bg: "bg-del", text: "text-black" },// e.g., bg-pixel-orange, text-black (for contrast)
  [VacationType.FW]: { bg: "bg-fw", text: "text-white" }, // e.g., bg-pixel-purple, text-white
  [VacationType.BL]: { bg: "bg-bl", text: "text-black" }, // e.g., bg-pixel-yellow, text-black (for contrast)
  [VacationType.IN]: { bg: "bg-in", text: "text-white" }, // e.g., bg-pixel-grey (custom), text-white
};

// This legacy mapping might not be needed if DayCell directly uses VACATION_TYPE_STYLES
export const VACATION_TYPE_COLORS_LEGACY: Record<VacationType, string> = {
  [VacationType.UW]: "bg-uw text-white",
  [VacationType.CH]: "bg-ch text-white",
  [VacationType.HO]: "bg-ho text-white",
  [VacationType.DEL]: "bg-del text-black", 
  [VacationType.FW]: "bg-fw text-white",
  [VacationType.BL]: "bg-bl text-black",   
  [VacationType.IN]: "bg-in text-white",
};


export const TEAM_PRESENCE_COLORS = {
  Present: "bg-present text-white", // Example: bg-pixel-green text-white
  Absent: "bg-absent text-white",   // Example: bg-pixel-red text-white
};

export const DAY_NAMES_PL_SHORT = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];