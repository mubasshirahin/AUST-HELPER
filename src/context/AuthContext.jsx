import { createContext, useContext, useEffect, useState } from 'react';
import {
  clearSession,
  getInitials,
  guestUser,
  loginAccount,
  restoreSessionUser,
  signupAccount,
  startSession,
  updateAccountProfile,
} from '../utils/authStorage';

const AuthContext = createContext();
const userStorageKey = 'aust-user-profile';

export function AuthProvider({ children }) {
  const [sessionUser, setSessionUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(sessionUser);
  const user = sessionUser ?? guestUser;

  useEffect(() => {
    const restoredUser = restoreSessionUser();
    if (restoredUser) {
      setSessionUser(restoredUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    const account = loginAccount(email, password);
    const nextUser = startSession(account);
    setSessionUser(nextUser);
    return nextUser;
  };

  const signup = async (payload) => {
    const account = signupAccount(payload);
    const nextUser = startSession(account);
    setSessionUser(nextUser);
    return nextUser;
  };

  const logout = () => {
    clearSession();
    setSessionUser(null);
  };

  const updateUser = (nextUserData) => {
    if (!sessionUser) return false;

    const updatedUser = {
      ...sessionUser,
      ...nextUserData,
      initials: nextUserData.name ? getInitials(nextUserData.name) : sessionUser.initials,
    };
    setSessionUser(updatedUser);
    localStorage.setItem(userStorageKey, JSON.stringify(updatedUser));
    updateAccountProfile(sessionUser.id, nextUserData);
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isGuest: !isAuthenticated,
      isLoading,
      login,
      signup,
      logout,
      updateUser,
    }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
