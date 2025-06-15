import React, { useState } from 'react';
import ActionButton from './SkeuomorphicButton'; 
import { MOCK_EMPLOYEES } from '../constants';

interface LoginScreenProps {
  onLogin: (userId: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(MOCK_EMPLOYEES[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      onLogin(selectedUserId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pixel-bg-light dark:bg-pixel-bg-dark p-4 text-center">
      <header className="absolute top-4 left-4">
        <h1 className="text-xl font-bold text-pixel-text-light dark:text-pixel-text-dark border-1 border-pixel-border-light dark:border-pixel-border-dark p-2 bg-pixel-card-light dark:bg-pixel-card-dark">
          PIXEL PLANNER
        </h1>
      </header>
      
      <main className="max-w-md w-full p-4 border-1 border-pixel-border-light dark:border-pixel-border-dark bg-pixel-card-light dark:bg-pixel-card-dark">
        <h2 className="text-3xl sm:text-4xl font-bold text-pixel-text-light dark:text-pixel-text-dark mb-5 uppercase">
          Zaloguj Się
        </h2>
        <p className="text-sm text-pixel-text-alt-light dark:text-pixel-text-alt-dark mb-6">
          Wybierz użytkownika, aby rozpocząć planowanie urlopów w stylu retro!
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="user-select" className="sr-only">Wybierz użytkownika:</label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 bg-pixel-bg-light dark:bg-pixel-bg-dark border-1 border-pixel-border-light dark:border-pixel-border-dark focus:outline-none focus:border-pixel-primary text-pixel-text-light dark:text-pixel-text-dark rounded-none"
            >
              {MOCK_EMPLOYEES.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} [{emp.team}]
                </option>
              ))}
            </select>
          </div>
          <ActionButton 
            type="submit" 
            variant="login"
            size="lg"
            className="w-full"
          >
            START
          </ActionButton>
        </form>
        <p className="text-xs text-pixel-text-alt-light dark:text-pixel-text-alt-dark mt-8">
          Logowanie symulowane.
        </p>
      </main>
       <footer className="absolute bottom-4 text-xs text-pixel-text-alt-light dark:text-pixel-text-alt-dark">
          Pixel Planner &copy; 2024
      </footer>
    </div>
  );
};

export default LoginScreen;