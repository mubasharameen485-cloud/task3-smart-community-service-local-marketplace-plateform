'use client';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Register() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      await axios.post('http://localhost:5000/api/auth/register', data);
      alert('Registration Success! Please Login.');
      router.push('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-center">Join Community</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('name')} placeholder="Full Name" required className="w-full p-2 border rounded bg-transparent dark:border-gray-600" />
        <input {...register('email')} type="email" placeholder="Email" required className="w-full p-2 border rounded bg-transparent dark:border-gray-600" />
        <input {...register('password')} type="password" placeholder="Password" required className="w-full p-2 border rounded bg-transparent dark:border-gray-600" />
        <select {...register('role')} required className="w-full p-2 border rounded bg-transparent dark:border-gray-600">
          <option className="dark:bg-gray-800" value="BUYER">I want to Buy Services/Products</option>
          <option className="dark:bg-gray-800" value="SELLER">I want to Sell Services/Products</option>
        </select>
        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Register</button>
      </form>
    </div>
  );
}