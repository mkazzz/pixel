
import { useState, useCallback } from 'react';
import { Employee } from '../types';
import { MOCK_EMPLOYEES, MOCK_CURRENT_USER_ID } from '../constants';

interface AuthState {
  currentUser: Employee | null;
  isAuthenticated: boolean;
  login: (userId: string) => void;
  logout: () => void;
}

export const useMockAuth = (): AuthState => {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);

  const login = useCallback((userId: string) => {
    const user = MOCK_EMPLOYEES.find(emp => emp.id === userId);
    if (user) {
      setCurrentUser(user);
    } else {
      // For demo, log in as the default mock user if ID not found
      setCurrentUser(MOCK_EMPLOYEES.find(emp => emp.id === MOCK_CURRENT_USER_ID) || null);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);
  
  // Simulate initial login for demo purposes
  // useEffect(() => {
  //   if (!currentUser) {
  //      login(MOCK_CURRENT_USER_ID);
  //   }
  // }, [currentUser, login]);


  return {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    logout,
  };
};
    