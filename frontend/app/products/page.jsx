'use client';
import { useState, useContext } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../../context/AuthContext';
import { Heart, Trash2, Plus } from 'lucide-react';

export default function ProductsPage() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();
  
  const [showModal, setShowModal] = useState(false);
  const [images, setImages] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: '', minPrice: '', maxPrice: '' });

  const myId = user?.id || user?._id;

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const res = await axios.get(`http://localhost:5000/api/products?${params}`);
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => formData.append(key, data[key]));
      Array.from(images).forEach(file => formData.append('images', file));
      
      const token = localStorage.getItem('token');
      return await axios.post('http://localhost:5000/api/products', formData, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'multipart/form-data' 
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      setShowModal(false); reset(); setImages([]);
      alert('Product Listed Successfully!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      return await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      alert('Product Deleted!');
    }
  });

  const favMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      return await axios.put(`http://localhost:5000/api/products/${id}/favorite`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['products']),
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Community Marketplace</h1>
        {(user?.role === 'SELLER' || user?.role === 'ADMIN') && (
          <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg font-bold">
            <Plus size={18} /> Sell Product
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border dark:border-gray-700 flex flex-wrap gap-4 transition-colors">
        <input type="text" placeholder="Search products..." onChange={(e) => setFilters({...filters, search: e.target.value})} className="border p-2 rounded-xl flex-1 dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500" />
        <select onChange={(e) => setFilters({...filters, category: e.target.value})} className="border p-2 rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none">
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Home">Home</option>
        </select>
        <div className="flex gap-2 items-center">
            <input type="number" placeholder="Min $" onChange={(e) => setFilters({...filters, minPrice: e.target.value})} className="border p-2 rounded-xl w-24 dark:bg-gray-900" />
            <span className="text-gray-400">-</span>
            <input type="number" placeholder="Max $" onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} className="border p-2 rounded-xl w-24 dark:bg-gray-900" />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(p => {
          const sellerId = p.seller?._id || p.seller;
          const isOwner = String(sellerId) === String(myId);
          const isFav = myId && p.favorites.includes(myId);

          return (
            <div key={p._id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border dark:border-gray-700 overflow-hidden group hover:shadow-xl transition duration-300">
              <div className="h-52 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                
                {/* 👈 PRODUCT IMAGE DISPLAY */}
                {p.images && p.images.length > 0 ? (
                    <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={p.title} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 italic">No Preview</div>
                )}
                
                <button 
                  onClick={() => { if (!myId) return alert('Login to favorite!'); favMutation.mutate(p._id); }} 
                  className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 p-2 rounded-full hover:scale-110 transition shadow-md"
                >
                  <Heart size={18} className={isFav ? "fill-red-500 text-red-500" : "text-gray-500"} />
                </button>

                {isOwner && (
                  <button 
                    onClick={() => { if(window.confirm('Remove this product?')) deleteMutation.mutate(p._id); }} 
                    className="absolute top-3 left-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-md"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="p-5 space-y-3">
                <span className="text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded-full font-black uppercase tracking-widest">{p.category}</span>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white line-clamp-1">{p.title}</h3>
                <p className="text-3xl font-black text-green-600 tracking-tighter">${p.price}</p>
                
                <div className="flex items-center gap-2 mt-4 pt-4 border-t dark:border-gray-700">
                  <img src={p.seller?.profile?.profilePicture || 'https://via.placeholder.com/50'} className="w-7 h-7 rounded-full object-cover border dark:border-gray-600" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{p.seller?.name} {isOwner && '(You)'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] w-full max-w-lg shadow-2xl border dark:border-gray-700">
            <h2 className="text-3xl font-black mb-6 dark:text-white uppercase tracking-tighter">List Your Product</h2>
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
              <input {...register('title', {required:true})} placeholder="Product Title (e.g. iPhone 15 Pro)" className="w-full border p-4 rounded-2xl dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
              <div className="flex gap-4">
                <select {...register('category')} className="w-1/2 border p-4 rounded-2xl dark:bg-gray-900 dark:text-white outline-none">
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home">Home</option>
                </select>
                <input {...register('price', {required:true})} type="number" placeholder="Price $" className="w-1/2 border p-4 rounded-2xl dark:bg-gray-900 dark:text-white outline-none" />
              </div>
              <textarea {...register('description')} rows="3" placeholder="Condition, details, reason for selling..." className="w-full border p-4 rounded-2xl dark:bg-gray-900 dark:text-white outline-none"></textarea>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Gallery (Max 5)</label>
                <input type="file" multiple onChange={(e) => setImages(e.target.files)} className="w-full p-2 border rounded-2xl mt-1 dark:bg-gray-900 dark:text-gray-500" />
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl font-bold dark:text-white">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-[2] bg-indigo-600 text-white p-4 rounded-2xl font-black shadow-xl shadow-indigo-200 transition hover:bg-indigo-700">{createMutation.isPending ? 'LISTING...' : 'CONFIRM LISTING'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}