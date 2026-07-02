'use client';
import { useState, useContext } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../../context/AuthContext';
import { Search, Plus, Trash2, CalendarCheck, Clock, CheckCircle } from 'lucide-react';

export default function ServicesPage() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();
  
  // States
  const [showModal, setShowModal] = useState(false);
  const [images, setImages] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: '' });
  const [bookingModal, setBookingModal] = useState(null); 
  const [bookingData, setBookingData] = useState({ preferredDate: '', preferredTime: '', notes: '' });

  const myId = user?.id || user?._id;

  // 1. Fetch Services
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const res = await axios.get(`http://localhost:5000/api/services?${params}`);
      return res.data.data;
    }
  });

  // 2. Create Service Mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => formData.append(key, data[key]));
      // Portfolio images ko FormData mein add karna
      Array.from(images).forEach(file => formData.append('portfolioImages', file));
      
      const token = localStorage.getItem('token');
      return await axios.post('http://localhost:5000/api/services', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      setShowModal(false); reset(); setImages([]);
      alert('✅ Service Published Locally!');
    }
  });

  // 3. Delete Service Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      return await axios.delete(`http://localhost:5000/api/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      alert('🗑️ Service Removed.');
    }
  });

  // 4. Booking Mutation
  const bookMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem('token');
      return await axios.post('http://localhost:5000/api/bookings', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      setBookingModal(null);
      setBookingData({ preferredDate: '', preferredTime: '', notes: '' });
      alert('🎉 Booking Confirmed! Check the Bookings tab.');
    },
    onError: (err) => alert(err.response?.data?.message || 'Booking failed')
  });

  const handleBookSubmit = (e) => {
    e.preventDefault();
    if (!bookingModal) return;
    bookMutation.mutate({ serviceId: bookingModal._id, ...bookingData });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-4 sm:p-8">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-700 gap-6 transition-all">
        <div className="space-y-1">
          <h1 className="text-4xl font-black dark:text-white tracking-tighter uppercase italic">Professional Services</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Explore and hire top-rated community experts.</p>
        </div>
        {(user?.role === 'SELLER' || user?.role === 'ADMIN') && (
          <button 
            onClick={() => setShowModal(true)} 
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-green-100 dark:shadow-none flex items-center gap-3"
          >
            <Plus size={20} /> Offer New Service
          </button>
        )}
      </div>

      {/* --- FILTER BAR --- */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search services by title..." 
            onChange={(e) => setFilters({...filters, search: e.target.value})} 
            className="w-full bg-white dark:bg-gray-800 border-none p-4 pl-12 rounded-2xl shadow-sm focus:ring-2 focus:ring-green-500 dark:text-white transition-all outline-none" 
          />
        </div>
        <select 
          onChange={(e) => setFilters({...filters, category: e.target.value})} 
          className="bg-white dark:bg-gray-800 border-none p-4 rounded-2xl shadow-sm dark:text-white outline-none font-bold min-w-[200px]"
        >
          <option value="">All Categories</option>
          <option value="Web Development">Web Development</option>
          <option value="Graphic Designing">Graphic Designing</option>
          <option value="Photography">Photography</option>
          <option value="Tutoring">Tutoring</option>
        </select>
      </div>

      {/* --- SERVICES GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map(s => {
          const providerId = s.provider?._id || s.provider;
          const isOwner = String(providerId) === String(myId);

          return (
            <div key={s._id} className="bg-white dark:bg-gray-800 rounded-[35px] shadow-2xl overflow-hidden flex flex-col group hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-green-200 dark:hover:border-gray-600">
              
              {/* Image Preview */}
              <div className="h-56 w-full bg-gray-100 dark:bg-gray-900 relative">
                {s.portfolioImages?.[0] ? (
                  <img src={s.portfolioImages[0]} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={s.title} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 uppercase font-black text-[10px] tracking-widest italic">No Portfolio Preview</div>
                )}
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1.5 rounded-full border dark:border-gray-600">
                   <span className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest">{s.category}</span>
                </div>

                {/* Delete for Owners */}
                {isOwner && (
                  <button 
                    onClick={() => { if(window.confirm('Delete service?')) deleteMutation.mutate(s._id); }} 
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-2xl shadow-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-8 flex-1 flex flex-col gap-5">
                <div className="flex justify-between items-start">
                  <h3 className="font-black text-2xl text-gray-800 dark:text-white tracking-tighter uppercase italic leading-none">{s.title}</h3>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase">Pricing</p>
                    <span className="text-2xl font-black text-green-600 tracking-tighter">${s.pricing}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{s.description}</p>
                
                {/* Provider Branding */}
                <div className="flex items-center gap-3 py-4 border-t border-b dark:border-gray-700">
                   <img src={s.provider?.profile?.profilePicture || 'https://via.placeholder.com/50'} className="w-10 h-10 rounded-full object-cover border-2 border-green-100 dark:border-gray-600 shadow-sm" />
                   <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expert</p>
                      <p className="text-sm font-black text-gray-700 dark:text-gray-200">{s.provider?.name} {isOwner && '(YOU)'}</p>
                   </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex justify-between items-center mt-auto">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock size={14} className="text-green-500" />
                    <span className="text-[10px] font-black uppercase">{s.estimatedDeliveryTime}</span>
                  </div>

                  {!isOwner && user ? (
                    <button 
                      onClick={() => setBookingModal(s)} 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-indigo-100 dark:shadow-none transition-all flex items-center gap-2"
                    >
                      <CalendarCheck size={14} /> Book Appointment
                    </button>
                  ) : isOwner ? (
                    <div className="flex items-center gap-1 text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">
                       <CheckCircle size={12} />
                       <span className="text-[10px] font-black uppercase">Your Service</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- MODAL: OFFER SERVICE --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 p-10 rounded-[45px] w-full max-w-xl shadow-2xl border dark:border-gray-700 animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-black mb-8 dark:text-white uppercase tracking-tighter italic border-b pb-4">New Service Offer</h2>
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-5">
              <input {...register('title')} placeholder="Service Heading" required className="w-full border-none bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl dark:text-white outline-none focus:ring-2 focus:ring-green-500 font-bold" />
              <div className="grid grid-cols-2 gap-4">
                <select {...register('category')} className="border-none bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl dark:text-white outline-none font-bold">
                  <option value="Web Development">Web Development</option>
                  <option value="Graphic Designing">Graphic Designing</option>
                  <option value="Photography">Photography</option>
                  <option value="Tutoring">Tutoring</option>
                </select>
                <input {...register('pricing')} type="number" placeholder="Fee $" required className="border-none bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl dark:text-white outline-none font-bold" />
              </div>
              <input {...register('estimatedDeliveryTime')} placeholder="Delivery Days (e.g. 3 Days)" required className="w-full border-none bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl dark:text-white outline-none font-bold" />
              <textarea {...register('description')} rows="3" placeholder="Explain your professional service..." required className="w-full border-none bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl dark:text-white outline-none font-bold"></textarea>
              <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-[0.2em] mb-2 block">Upload Portfolio</label>
                <input type="file" multiple onChange={(e) => setImages(e.target.files)} className="w-full text-xs text-gray-500" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 rounded-2xl font-black uppercase text-xs transition hover:bg-gray-200 dark:text-white">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-green-100 hover:bg-green-700 transition-all">
                  {createMutation.isPending ? 'OFFERING...' : 'CONFIRM & PUBLISH'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CONFIRM BOOKING --- */}
      {bookingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 p-10 rounded-[45px] w-full max-w-md border dark:border-gray-700 shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-3xl font-black mb-1 dark:text-white tracking-tighter uppercase italic">Secure Booking</h2>
            <p className="text-indigo-600 dark:text-indigo-400 font-black mb-8 uppercase text-xs tracking-widest">
               Service: {bookingModal.title}
            </p>
            
            <form onSubmit={handleBookSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Select Date</label>
                <input type="date" required value={bookingData.preferredDate} onChange={(e)=>setBookingData({...bookingData, preferredDate: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border-none p-4 rounded-2xl dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Select Time</label>
                <input type="time" required value={bookingData.preferredTime} onChange={(e)=>setBookingData({...bookingData, preferredTime: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border-none p-4 rounded-2xl dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Additional Notes</label>
                <textarea rows="3" value={bookingData.notes} onChange={(e)=>setBookingData({...bookingData, notes: e.target.value})} placeholder="Tell the provider your requirements..." className="w-full bg-gray-50 dark:bg-gray-900 border-none p-4 rounded-2xl dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold"></textarea>
              </div>
              
              <div className="flex gap-4 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={() => setBookingModal(null)} className="flex-1 py-4 bg-gray-50 dark:bg-gray-700 rounded-2xl font-black uppercase text-xs dark:text-white">Back</button>
                <button type="submit" disabled={bookMutation.isPending} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  {bookMutation.isPending ? 'PROCESSING...' : 'CONFIRM BOOKING'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}