'use client';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import axios from 'axios';

export default function Profile() {
  const { user, updateSessionUser } = useContext(AuthContext);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name,
      bio: user?.profile?.bio,
      location: user?.profile?.location,
      contactInformation: user?.profile?.contactInformation,
      skills: user?.profile?.skills?.join(', ')
    }
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!user) return <div className="text-center mt-10">Please Login...</div>;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      Object.keys(data).forEach(key => formData.append(key, data[key]));
      if (file) formData.append('profilePic', file);

      const res = await axios.put('http://localhost:5000/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      
      updateSessionUser(res.data.user);
      alert('Profile Updated Successfully!');
    } catch (err) {
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700">
      <div className="flex items-center gap-6 mb-8 border-b pb-6 dark:border-gray-700">
        <img 
          src={user.profile?.profilePicture || 'https://via.placeholder.com/150'} 
          alt="Profile" 
          className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500"
        />
        <div>
          <h1 className="text-3xl font-black">{user.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">{user.email} • <span className="font-bold text-indigo-500">{user.role}</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label className="text-xs font-bold text-gray-500">Name</label><input {...register('name')} className="w-full p-2 border rounded bg-transparent dark:border-gray-600" /></div>
        <div><label className="text-xs font-bold text-gray-500">Profile Picture</label><input type="file" onChange={e => setFile(e.target.files[0])} className="w-full p-2 border rounded bg-transparent dark:border-gray-600" /></div>
        <div><label className="text-xs font-bold text-gray-500">Location</label><input {...register('location')} className="w-full p-2 border rounded bg-transparent dark:border-gray-600" /></div>
        <div><label className="text-xs font-bold text-gray-500">Contact No.</label><input {...register('contactInformation')} className="w-full p-2 border rounded bg-transparent dark:border-gray-600" /></div>
        <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500">Skills (Comma separated)</label><input {...register('skills')} placeholder="e.g. React, Plumber, Tutor" className="w-full p-2 border rounded bg-transparent dark:border-gray-600" /></div>
        <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500">Bio</label><textarea {...register('bio')} rows="3" className="w-full p-2 border rounded bg-transparent dark:border-gray-600"></textarea></div>
        
        <button type="submit" disabled={loading} className="md:col-span-2 bg-indigo-600 text-white font-bold py-3 rounded hover:bg-indigo-700 disabled:bg-gray-500 transition">
          {loading ? 'Saving Changes...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}