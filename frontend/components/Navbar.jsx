'use client';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from 'next-themes';
import { Sun, Moon, LayoutDashboard, ShieldAlert } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const { user, logoutUser } = useContext(AuthContext);
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const currentTheme = theme === 'system' ? systemTheme : theme;

  // 🟢 Role Checks
  const isAdmin = user?.role === 'ADMIN';

  return (
    <nav className="bg-white dark:bg-gray-900 p-4 shadow-md border-b dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* LOGO */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">Smart Community</Link>
          
          {/* 🟢 NAVIGATION LINKS (Conditional based on role) */}
          <div className="hidden md:flex gap-6 font-bold text-sm text-gray-600 dark:text-gray-300">
            {isAdmin ? (
              // Admin Links
              <Link href="/admin" className="hover:text-red-500 text-red-600 flex items-center gap-1 transition">
                <ShieldAlert size={18}/> Admin Control Panel
              </Link>
            ) : (
              // Buyer/Seller Links
              <>
                {user && <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition"><LayoutDashboard size={18}/> Dashboard</Link>}
                <Link href="/products" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">🛍️ Products</Link>
                <Link href="/services" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">🛠️ Services</Link>
                {user && <Link href="/bookings" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">📅 Bookings</Link>}
              </>
            )}
          </div>
        </div>

        {/* RIGHT SIDE ACTIONS */}
        <div className="flex gap-4 items-center">
          {mounted && (
            <button onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              {currentTheme === 'dark' ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-gray-600" size={20} />}
            </button>
          )}

          {user ? (
            <>
              {!isAdmin && <NotificationDropdown />} 
              <Link href="/profile" className="text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-indigo-500 transition">
                {user.name} <span className={`px-2 py-0.5 rounded-full text-xs ml-1 hidden sm:inline-block ${isAdmin ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>{user.role}</span>
              </Link>
              <button onClick={logoutUser} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-md transition">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Login</Link>
              <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-bold shadow-md transition">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}