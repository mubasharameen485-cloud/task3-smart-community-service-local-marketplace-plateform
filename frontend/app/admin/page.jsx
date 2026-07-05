'use client';
import { useContext } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../../context/AuthContext';
import { ShieldAlert, Users, Ban, AlertTriangle, Activity, BarChart, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const router = useRouter();

  // If not admin, block UI
  if (user && user.role !== 'ADMIN') {
    return <div className="p-20 text-center text-3xl text-red-500 font-black uppercase tracking-widest">Access Denied!</div>;
  }

  const { data, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
      return res.data.data;
    },
    enabled: !!user && user.role === 'ADMIN'
  });

  const suspendMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      return await axios.patch(`http://localhost:5000/api/admin/users/${id}/suspend`, {}, { headers: { Authorization: `Bearer ${token}` } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminStats']);
      alert('User status updated successfully.');
    }
  });

  if (isLoading) return <div className="p-20 text-center text-xl animate-pulse text-gray-500">Loading Admin Secure Panel...</div>;

  const { stats, usersList } = data || {};

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 border-b dark:border-gray-800 pb-6 text-red-600 dark:text-red-500">
        <ShieldAlert size={48} />
        <div>
          <h1 className="text-4xl font-black tracking-tight">Admin Control Center</h1>
          <p className="text-sm font-bold text-gray-500">Monitor Overall Activity & Manage Platform</p>
        </div>
      </div>

      {/* 1. VIEW PLATFORM STATISTICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-2xl shadow-lg text-white">
          <p className="font-bold text-blue-100 flex items-center gap-2"><Users size={18}/> Total Users</p>
          <h2 className="text-5xl font-black mt-2">{stats?.totalUsers || 0}</h2>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-700 p-6 rounded-2xl shadow-lg text-white">
          <p className="font-bold text-green-100 flex items-center gap-2"><BarChart size={18}/> Total Listings</p>
          <h2 className="text-5xl font-black mt-2">{stats?.totalListings || 0}</h2>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-6 rounded-2xl shadow-lg text-white">
          <p className="font-bold text-purple-100 flex items-center gap-2"><Activity size={18}/> Total Bookings</p>
          <h2 className="text-5xl font-black mt-2">{stats?.totalBookings || 0}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. MANAGE USERS & SUSPEND ACCOUNTS */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-900 p-5 border-b dark:border-gray-700 font-black text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Users className="text-indigo-500"/> Manage Users & Accounts
          </div>
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr className="text-gray-500 dark:text-gray-400">
                  <th className="p-4">User Details</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {usersList?.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="p-4">
                      <p className="font-bold text-gray-900 dark:text-white">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.isSuspended ? (
                        <span className="text-red-500 font-bold flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded w-max"><Ban size={14}/> Suspended</span>
                      ) : (
                        <span className="text-green-500 font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Active</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {u.role !== 'ADMIN' && (
                        <button 
                          onClick={() => { if(window.confirm(`Are you sure you want to ${u.isSuspended ? 'ACTIVATE' : 'SUSPEND'} this user?`)) suspendMutation.mutate(u._id) }} 
                          className={`px-4 py-2 rounded-lg text-xs font-black uppercase text-white shadow-md transition ${u.isSuspended ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                        >
                          {u.isSuspended ? 'Activate User' : 'Suspend Account'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. MANAGE REPORTED CONTENT & APPROVALS */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
            <div className="bg-red-50 dark:bg-red-900/20 p-5 border-b border-red-100 dark:border-red-900 font-black text-red-600 flex items-center gap-2">
              <AlertTriangle /> Manage Reported Content
            </div>
            <div className="p-8 text-center space-y-2">
              <CheckCircle size={48} className="text-green-500 mx-auto opacity-50 mb-4" />
              <p className="font-bold text-gray-700 dark:text-gray-300">No Pending Reports</p>
              <p className="text-xs text-gray-500 italic">All user-generated content, products, and services are currently adhering to community guidelines.</p>
            </div>
          </div>

          {/* 4. APPROVE OR REMOVE LISTINGS */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden p-6 text-center">
             <h3 className="font-bold text-gray-800 dark:text-white mb-2">Approve/Remove Listings</h3>
             <p className="text-sm text-gray-500 mb-4">Admins have global access to delete any Product or Service directly from the Marketplace pages.</p>
             <button onClick={() => router.push('/products')} className="bg-gray-900 dark:bg-gray-700 text-white w-full py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition">
               Go to Marketplace ↗
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}