'use client';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Login() {
  const { register, handleSubmit } = useForm();
  const { loginUser } = useContext(AuthContext);
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', data);
      loginUser(res.data.user, res.data.token);
      alert('Login Success!');
      router.push('/profile');
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid Credentials');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('email')} type="email" placeholder="Email" required className="w-full p-2 border rounded bg-transparent dark:border-gray-600" />
        <input {...register('password')} type="password" placeholder="Password" required className="w-full p-2 border rounded bg-transparent dark:border-gray-600" />
        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Login</button>
      </form>
    </div>
  );
}