'use client';
import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser } = useContext(AuthContext);

  return (
    <nav className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 p-4 sticky top-0 z-50 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* LOGO & LINKS */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
            Smart Community
          </Link>
          
          <div className="hidden md:flex gap-6 font-bold text-sm text-gray-600 dark:text-gray-300">
            <Link href="/products" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              🛍️ Products
            </Link>
            <Link href="/services" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              🛠️ Services
            </Link>
            <Link href="/bookings" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              📅 Bookings
            </Link>
          </div>
        </div>

        {/* AUTH AREA */}
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link href="/profile" className="text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-indigo-500 transition">
                {user.name} <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full text-[10px] ml-1">{user.role}</span>
              </Link>
              <button onClick={logoutUser} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition shadow-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline text-sm">
                Login
              </Link>
              <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition shadow-md">
                Register
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}