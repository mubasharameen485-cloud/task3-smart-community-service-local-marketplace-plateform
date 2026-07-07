'use client';
import { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

export default function ForgotPassword() {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', data);
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Error requesting password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2">Reset Password</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Enter your email and we will send you a reset link.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input 
            {...register('email', { required: true })} 
            type="email" 
            placeholder="Enter your email" 
            className="w-full p-3 border rounded bg-transparent dark:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500" 
          />
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white p-3 rounded font-bold hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Sending Link...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Remember your password? <Link href="/login" className="text-indigo-600 font-bold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}