'use client';
import { useContext, useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../../context/AuthContext';
import { CalendarClock, CheckCircle, XCircle, History, Clock } from 'lucide-react';

export default function BookingsPage() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'

  // 100% Bulletproof ID extraction
  const myId = user?.id || user?._id;

  const { data: allBookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.data;
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const token = localStorage.getItem('token');
      return await axios.patch(`http://localhost:5000/api/bookings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['bookings'])
  });

  if (!user) return <div className="p-10 text-center text-xl font-bold">Please login to view bookings.</div>;

  // Filter Bookings based on Tab
  const displayedBookings = allBookings.filter(b => {
    if (activeTab === 'active') {
      return b.status === 'Pending' || b.status === 'Accepted';
    } else {
      return b.status === 'Completed' || b.status === 'Rejected' || b.status === 'Cancelled';
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b dark:border-gray-800 pb-4">
        <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
          <CalendarClock className="text-indigo-500" size={32} /> Booking Management
        </h1>
      </div>

      {/* 🟢 TABS SYSTEM 🟢 */}
      <div className="flex gap-4">
        <button 
          onClick={() => setActiveTab('active')} 
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition ${activeTab === 'active' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300'}`}
        >
          <Clock size={18} /> Active Bookings
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300'}`}
        >
          <History size={18} /> Booking History
        </button>
      </div>

      {/* BOOKINGS LIST */}
      {isLoading ? <p className="text-center p-10 animate-pulse text-gray-500">Loading your bookings...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {displayedBookings.map(b => {
            
            // 🟢 BULLETPROOF ID CHECK (Extract ID directly from object or string)
            const providerId = b.provider?._id || b.provider;
            const customerId = b.customer?._id || b.customer;
            
            const isProvider = String(providerId) === String(myId);
            const isCustomer = String(customerId) === String(myId);
            
            // Badge Colors
            const badgeColor = 
              b.status === 'Accepted' ? 'bg-green-100 text-green-700' :
              b.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
              b.status === 'Rejected' || b.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
              'bg-yellow-100 text-yellow-700';

            return (
              <div key={b._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 space-y-4 relative">
                
                {/* Status Badge */}
                <span className={`absolute top-4 right-4 px-3 py-1 text-xs font-black uppercase rounded-full ${badgeColor}`}>
                  {b.status}
                </span>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white pr-20">{b.service?.title || 'Unknown Service'}</h3>
                  <p className="text-indigo-600 font-bold">${b.service?.pricing || 0} <span className="text-xs text-gray-500 font-normal">({b.service?.category || 'N/A'})</span></p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl flex flex-col gap-2 text-sm border dark:border-gray-700">
                  <p><span className="font-bold text-gray-500">Date & Time:</span> {b.preferredDate} at {b.preferredTime}</p>
                  
                  {/* Dynamic Role Display */}
                  {isProvider ? (
                    <p><span className="font-bold text-gray-500">Requested By:</span> {b.customer?.name} <span className="bg-blue-100 text-blue-700 text-[10px] px-2 rounded-full">Buyer</span></p>
                  ) : (
                    <p><span className="font-bold text-gray-500">Service Provider:</span> {b.provider?.name} <span className="bg-green-100 text-green-700 text-[10px] px-2 rounded-full">Seller</span></p>
                  )}

                  {b.notes && <p className="italic text-gray-600 dark:text-gray-400 mt-2">"{b.notes}"</p>}
                </div>

                {/* 🟢 ACTION BUTTONS (FIXED) 🟢 */}
                <div className="flex gap-2 pt-2 border-t dark:border-gray-700">
                  
                  {/* PROVIDER ACTIONS */}
                  {isProvider && b.status === 'Pending' && (
                    <>
                      <button onClick={() => statusMutation.mutate({ id: b._id, status: 'Accepted' })} className="flex-1 bg-green-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition flex justify-center items-center gap-1"><CheckCircle size={16}/> Accept</button>
                      <button onClick={() => statusMutation.mutate({ id: b._id, status: 'Rejected' })} className="flex-1 bg-red-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-red-600 transition flex justify-center items-center gap-1"><XCircle size={16}/> Reject</button>
                    </>
                  )}
                  {isProvider && b.status === 'Accepted' && (
                    <button onClick={() => statusMutation.mutate({ id: b._id, status: 'Completed' })} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition">Mark as Completed</button>
                  )}

                  {/* CUSTOMER ACTIONS */}
                  {isCustomer && (b.status === 'Pending' || b.status === 'Accepted') && (
                    <button 
                      onClick={() => { if(window.confirm('Cancel this booking?')) statusMutation.mutate({ id: b._id, status: 'Cancelled' })}} 
                      className="w-full bg-red-100 text-red-600 border border-red-200 py-2 rounded-lg font-bold text-sm hover:bg-red-200 transition"
                    >
                      Cancel Booking
                    </button>
                  )}

                  {/* NO ACTIONS FOR HISTORY TAB */}
                  {(b.status === 'Completed' || b.status === 'Rejected' || b.status === 'Cancelled') && (
                    <p className="w-full text-center text-gray-400 text-sm font-bold italic py-2">No further actions available.</p>
                  )}

                </div>
              </div>
            );
          })}
          {displayedBookings.length === 0 && (
            <p className="col-span-2 text-center p-10 text-gray-500 italic">No {activeTab} bookings found.</p>
          )}
        </div>
      )}
    </div>
  );
}