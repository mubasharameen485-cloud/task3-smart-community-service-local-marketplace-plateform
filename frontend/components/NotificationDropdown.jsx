'use client';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Bell } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const socket = io('http://localhost:5000');

export default function NotificationDropdown() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch old notifications
    const fetchNotifs = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.data);
    };
    fetchNotifs();

    
    socket.emit('join_user_room', user.id || user._id);

    
    socket.on('new_notification', (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => socket.off('new_notification');
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    await axios.put('http://localhost:5000/api/notifications/mark-read', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => { setIsOpen(!isOpen); if(!isOpen && unreadCount > 0) markAllAsRead(); }} 
        className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-300"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 overflow-hidden z-50">
          <div className="bg-indigo-600 text-white p-3 font-bold text-sm flex justify-between">
            Notifications
            {unreadCount > 0 && <span className="text-xs bg-indigo-800 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center p-6 text-gray-500 italic text-sm">No notifications yet.</p>
            ) : (
              notifications.map(n => (
                <div key={n._id} className={`p-4 border-b dark:border-gray-700 ${!n.isRead ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                  <p className="text-xs font-bold text-indigo-500 mb-1">{n.type}</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}