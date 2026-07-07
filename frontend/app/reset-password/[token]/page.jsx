'use client';
import { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';

export default function ResetPassword() {
  const { token } = useParams(); // URL se token extract kiya
  const { register, handleSubmit, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      return alert("Passwords don't match!");
    }

    setLoading(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/auth/reset-password/${token}`, { password: data.password });
      alert(res.data.message);
      router.push('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Create New Password</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500">New Password</label>
            <input 
              {...register('password', { required: true, minLength: 6 })} 
              type="password" 
              placeholder="••••••••" 
              className="w-full p-3 border rounded bg-transparent dark:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500" 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500">Confirm Password</label>
            <input 
              {...register('confirmPassword', { required: true })} 
              type="password" 
              placeholder="••••••••" 
              className="w-full p-3 border rounded bg-transparent dark:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500" 
            />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white p-3 rounded font-bold hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Resetting...' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}