'use client';
import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser } = useContext(AuthContext);

  return (
    <nav className="bg-white dark:bg-gray-900 p-4 shadow-md border-b dark:border-gray-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Smart Community</Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link href="/profile" className="font-bold hover:text-indigo-500">{user.name} ({user.role})</Link>
              <button onClick={logoutUser} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-indigo-600 font-bold">Login</Link>
              <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}