import { createContext, useContext, useMemo, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

// Read the saved user once when the app first loads.
const readStoredUser = () => {
  const value = localStorage.getItem('team_task_user');
  return value ? JSON.parse(value) : null;
};

export function AuthProvider({ children }) {
  // Store the current logged-in user and whether an auth request is running.
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(false);

  // Save token/user in localStorage so refresh keeps the session.
  const persistSession = ({ token, user: nextUser }) => {
    localStorage.setItem('team_task_token', token);
    localStorage.setItem('team_task_user', JSON.stringify(nextUser));
    setUser(nextUser);
  };

  // Login with email/password and persist the returned session.
  const login = async (payload) => {
    setLoading(true);
    try {
      const { data } = await authApi.login(payload);
      persistSession(data);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  // Create a new account and persist the returned session.
  const signup = async (payload) => {
    setLoading(true);
    try {
      const { data } = await authApi.signup(payload);
      persistSession(data);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  // Clear the saved session and return the app to the login screen.
  const logout = () => {
    localStorage.removeItem('team_task_token');
    localStorage.removeItem('team_task_user');
    setUser(null);
  };

  // Memoize context value so consumers do not re-render unnecessarily.
  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    signup,
    logout
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
