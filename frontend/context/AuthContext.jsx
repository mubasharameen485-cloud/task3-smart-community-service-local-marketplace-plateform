'use client';
import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const loginUser = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  const updateSessionUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, updateSessionUser }}>
      {children}
    </AuthContext.Provider>
  );
};