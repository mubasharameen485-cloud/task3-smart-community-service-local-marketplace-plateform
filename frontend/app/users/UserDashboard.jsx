'use client';
import { useContext } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../../context/AuthContext';
import { LayoutDashboard, Wallet, Heart, Briefcase, Bell, History, Clock } from 'lucide-react';
import Link from 'next/link';

export default function UserDashboard() {
  const { user } = useContext(AuthContext);

  const { data, isLoading } = useQuery({
    queryKey: ['userDashboard'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      return res.data.data;
    },
    enabled: !!user
  });

  if (isLoading) return <div className="p-10 text-center animate-pulse text-gray-500">Loading your dashboard...</div>;
  const { activeListingsCount, favoriteItems, serviceRequests, bookingHistory, earnings, recentNotifications } = data || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b dark:border-gray-800 pb-4">
        <LayoutDashboard className="text-indigo-600" size={32} />
        <h1 className="text-3xl font-black dark:text-white">My Dashboard</h1>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-600 p-6 rounded-2xl text-white shadow-lg"><p className="text-xs uppercase font-bold text-green-200">Total Earnings</p><h2 className="text-4xl font-black">${earnings}</h2></div>
        <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg"><p className="text-xs uppercase font-bold text-indigo-200">Active Listings</p><h2 className="text-4xl font-black">{activeListingsCount}</h2></div>
        <div className="bg-pink-600 p-6 rounded-2xl text-white shadow-lg"><p className="text-xs uppercase font-bold text-pink-200">Favorite Items</p><h2 className="text-4xl font-black">{favoriteItems?.length || 0}</h2></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* REQUESTS & HISTORY */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><Bell className="text-indigo-500"/> Service Requests</h3>
            {serviceRequests?.map(req => (
              <div key={req._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg mb-2">
                <p className="font-bold text-sm dark:text-white">{req.service?.title}</p>
                <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-1 rounded-full uppercase">{req.status}</span>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><History className="text-gray-500"/> Booking History</h3>
            {bookingHistory?.map(b => (
              <div key={b._id} className="flex justify-between items-center border-b dark:border-gray-700 pb-2 mb-2">
                <p className="text-sm dark:text-gray-300">{b.service?.title}</p>
                <span className="text-[10px] bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{b.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* NOTIFICATIONS & FAVORITES */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><Clock className="text-green-500"/> Activity Log (Notifications)</h3>
            {recentNotifications?.map(n => (
              <p key={n._id} className="text-sm text-gray-600 dark:text-gray-300 border-b dark:border-gray-700 pb-2 mb-2">👉 {n.message}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}