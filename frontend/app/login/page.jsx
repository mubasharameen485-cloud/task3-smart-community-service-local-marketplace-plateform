'use client';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const { register, handleSubmit } = useForm();
  const { loginUser } = useContext(AuthContext);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', data);
      
      // Save user to context and local storage
      loginUser(res.data.user, res.data.token);
      alert('Login Success!');
      
      // 🟢 FIX: Proper Role-Based Redirection
      if (res.data.user.role === 'ADMIN') {
        router.push('/admin'); // Admin ko Admin panel par bhejo
      } else {
        router.push('/dashboard'); // User ko uske Dashboard par bhejo
      }

    } catch (err) {
      alert(err.response?.data?.message || 'Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('email')} type="email" placeholder="Email" required className="w-full p-2 border rounded bg-transparent dark:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500" />
        <input {...register('password')} type="password" placeholder="Password" required className="w-full p-2 border rounded bg-transparent dark:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500" />
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition disabled:bg-gray-500">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        Don't have an account? <Link href="/register" className="text-indigo-600 font-bold hover:underline">Register</Link>
      </p>
    </div>
  );
}