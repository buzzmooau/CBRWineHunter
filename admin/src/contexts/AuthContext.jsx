import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if credentials exist in sessionStorage
    const stored = sessionStorage.getItem('adminAuth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCredentials(parsed);
        setIsAuthenticated(true);
      } catch (e) {
        sessionStorage.removeItem('adminAuth');
      }
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const auth = { username, password };
    sessionStorage.setItem('adminAuth', JSON.stringify(auth));
    setCredentials(auth);
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem('adminAuth');
    setCredentials(null);
    setIsAuthenticated(false);
  };

  const getAuthHeader = () => {
    if (!credentials) return null;
    const token = btoa(`${credentials.username}:${credentials.password}`);
    return `Basic ${token}`;
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      getAuthHeader,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
