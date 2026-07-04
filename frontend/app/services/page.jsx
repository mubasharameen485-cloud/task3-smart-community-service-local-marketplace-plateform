'use client';
import { useState, useContext } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../../context/AuthContext';
import { Search, Plus, Trash2, Star, X } from 'lucide-react';

export default function ServicesPage() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm({ defaultValues: { availability: 'true' } });
  
  const [showModal, setShowModal] = useState(false);
  const [images, setImages] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: '' });

  const [bookingModal, setBookingModal] = useState(null);
  const [bookingData, setBookingData] = useState({ preferredDate: '', preferredTime: '', notes: '' });

  // 🌟 SELLER REPUTATION STATES
  const [sellerReviewsModal, setSellerReviewsModal] = useState(null);
  const [sellerReviews, setSellerReviews] = useState([]);
  const [sellerStats, setSellerStats] = useState({ avg: 0, total: 0 });

  const myId = user?.id || user?._id;

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const res = await axios.get(`http://localhost:5000/api/services?${params}`);
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => formData.append(key, data[key]));
      if (!data.availability) formData.append('availability', 'true');
      Array.from(images).forEach(file => formData.append('portfolioImages', file));
      
      const token = localStorage.getItem('token');
      return await axios.post('http://localhost:5000/api/services', formData, { headers: { Authorization: `Bearer ${token}` } });
    },
    onSuccess: () => { queryClient.invalidateQueries(['services']); setShowModal(false); reset(); setImages([]); alert('Service Offered Successfully!'); }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await axios.delete(`http://localhost:5000/api/services/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
    onSuccess: () => { queryClient.invalidateQueries(['services']); alert('Service Deleted!'); }
  });

  const bookMutation = useMutation({
    mutationFn: async (data) => await axios.post('http://localhost:5000/api/bookings', data, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
    onSuccess: () => { setBookingModal(null); setBookingData({ preferredDate: '', preferredTime: '', notes: '' }); alert('✅ Service Booked Successfully!'); },
    onError: (err) => alert(err.response?.data?.message || 'Error booking service')
  });

  const handleBookSubmit = (e) => { e.preventDefault(); bookMutation.mutate({ serviceId: bookingModal._id, ...bookingData }); };

  // 🌟 FETCH REVIEWS FUNCTION
  const fetchReviews = async (sellerObj) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reviews/${sellerObj._id}`);
      setSellerReviews(res.data.data);
      setSellerStats({ avg: res.data.sellerReputation, total: res.data.totalReviews });
      setSellerReviewsModal(sellerObj);
    } catch (err) {
      alert("Error fetching reviews");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Local Services</h1>
        {(user?.role === 'SELLER' || user?.role === 'ADMIN') && (
          <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"><Plus size={18} /> Offer Service</button>
        )}
      </div>

      <div className="flex gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
        <input type="text" placeholder="Search services..." onChange={(e) => setFilters({...filters, search: e.target.value})} className="border p-2 rounded flex-1 dark:bg-gray-900 dark:border-gray-600 outline-none" />
        <select onChange={(e) => setFilters({...filters, category: e.target.value})} className="border p-2 rounded dark:bg-gray-900 dark:border-gray-600 outline-none">
          <option value="">All Categories</option>
          <option value="Web Development">Web Development</option>
          <option value="Graphic Designing">Graphic Designing</option>
          <option value="Photography">Photography</option>
          <option value="Tutoring">Tutoring</option>
        </select>
      </div>

      {isLoading ? <p className="text-center p-10 animate-pulse text-gray-500">Loading services...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(s => {
            const providerId = s.provider?._id || s.provider;
            const isOwner = String(providerId) === String(myId);

            return (
              <div key={s._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow border dark:border-gray-700 p-6 space-y-4 relative hover:shadow-lg transition">
                {isOwner && <button onClick={() => { if(window.confirm('Delete this service?')) deleteMutation.mutate(s._id); }} className="absolute top-4 right-4 bg-red-50 text-red-500 p-2 rounded-full hover:bg-red-100 transition"><Trash2 size={16} /></button>}

                <div className="flex justify-between items-start pt-2 pr-8">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">{s.category}</span>
                  <span className="text-2xl font-black text-gray-800 dark:text-white">${s.pricing}</span>
                </div>
                
                <h3 className="font-bold text-xl">{s.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{s.description}</p>
                
                <div className="flex items-center justify-between pt-2 pb-2">
                   <div className="flex items-center gap-2">
                     <img src={s.provider?.profile?.profilePicture || 'https://via.placeholder.com/50'} className="w-8 h-8 rounded-full border border-gray-200" alt="Provider" />
                     <span className="text-xs text-gray-500 font-bold">{s.provider?.name} {isOwner && '(You)'}</span>
                   </div>
                   {/* 🌟 VIEW REVIEWS BUTTON */}
                   <button onClick={() => fetchReviews(s.provider)} className="flex items-center gap-1 text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-1 rounded-full font-bold hover:bg-yellow-100 transition">
                     <Star size={12} className="fill-yellow-600 text-yellow-600"/> Reviews
                   </button>
                </div>

                <div className="flex justify-between items-center text-xs font-bold border-t dark:border-gray-700 pt-4">
                  <span className="text-gray-400">Delivery: {s.estimatedDeliveryTime}</span>
                  {!isOwner && user && s.availability ? (
                    <button onClick={() => setBookingModal(s)} className="bg-indigo-600 text-white px-4 py-1.5 rounded-full hover:bg-indigo-700 shadow-sm transition">Book Now</button>
                  ) : (
                    <span className={`px-3 py-1 rounded-full ${s.availability ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{s.availability ? 'Available' : 'Busy'}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🌟 SELLER REVIEWS MODAL */}
      {sellerReviewsModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border dark:border-gray-800">
            
            <div className="bg-gray-50 dark:bg-gray-800 p-6 border-b dark:border-gray-700 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black">{sellerReviewsModal.name}'s Reputation</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-3xl font-black text-yellow-500">{sellerStats.avg}</span>
                  <div className="flex text-yellow-400"><Star className="fill-yellow-400" size={20}/></div>
                  <span className="text-sm text-gray-500 font-bold">({sellerStats.total} Reviews)</span>
                </div>
              </div>
              <button onClick={() => setSellerReviewsModal(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"><X size={24}/></button>
            </div>

            <div className="p-6 max-h-[400px] overflow-y-auto space-y-4">
              {sellerReviews.length > 0 ? sellerReviews.map(rev => (
                <div key={rev._id} className="border-b dark:border-gray-800 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <img src={rev.reviewer?.profile?.profilePicture || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="text-sm font-bold">{rev.reviewer?.name}</p>
                        <p className="text-[10px] text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 text-yellow-500">
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < rev.rating ? 'fill-yellow-500' : 'text-gray-300 dark:text-gray-700'} />)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl italic">"{rev.comment}"</p>
                </div>
              )) : (
                <p className="text-center text-gray-500 italic py-10">No reviews yet for this provider.</p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-lg border dark:border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Offer a Service</h2>
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
              <input {...register('title')} placeholder="Service Title" required className="w-full border p-2 rounded dark:bg-gray-900 outline-none" />
              <div className="flex gap-4">
                <select {...register('category')} className="w-1/2 border p-2 rounded dark:bg-gray-900 outline-none">
                  <option value="Web Development">Web Development</option>
                  <option value="Graphic Designing">Graphic Designing</option>
                  <option value="Photography">Photography</option>
                  <option value="Tutoring">Tutoring</option>
                </select>
                <input {...register('pricing')} type="number" placeholder="Price $" required className="w-1/2 border p-2 rounded dark:bg-gray-900 outline-none" />
              </div>
              <div className="flex gap-4">
                <input {...register('estimatedDeliveryTime')} placeholder="Delivery Time (e.g. 3 Days)" required className="w-1/2 border p-2 rounded dark:bg-gray-900 outline-none" />
                <select {...register('availability')} className="w-1/2 border p-2 rounded dark:bg-gray-900 outline-none">
                  <option value="true">Available</option>
                  <option value="false">Busy</option>
                </select>
              </div>
              <textarea {...register('description')} rows="3" placeholder="Description" required className="w-full border p-2 rounded dark:bg-gray-900 outline-none"></textarea>
              <div>
                <label className="text-xs font-bold text-gray-500">Portfolio Images</label>
                <input type="file" multiple onChange={(e) => setImages(e.target.files)} className="w-full p-2 border rounded dark:bg-gray-900 outline-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="w-1/2 bg-gray-200 dark:bg-gray-700 p-2 rounded font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="w-1/2 bg-green-600 text-white p-2 rounded font-bold hover:bg-green-700 transition">{createMutation.isPending ? 'Saving...' : 'Offer Service'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-md border dark:border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">Book Service</h2>
            <p className="text-indigo-600 dark:text-indigo-400 font-bold mb-4 border-b dark:border-gray-700 pb-2">{bookingModal.title} - ${bookingModal.pricing}</p>
            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div><label className="text-xs font-bold text-gray-500">Preferred Date</label><input type="date" required value={bookingData.preferredDate} onChange={(e)=>setBookingData({...bookingData, preferredDate: e.target.value})} className="w-full border p-2 rounded dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="text-xs font-bold text-gray-500">Preferred Time</label><input type="time" required value={bookingData.preferredTime} onChange={(e)=>setBookingData({...bookingData, preferredTime: e.target.value})} className="w-full border p-2 rounded dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="text-xs font-bold text-gray-500">Special Instructions / Notes</label><textarea rows="3" value={bookingData.notes} onChange={(e)=>setBookingData({...bookingData, notes: e.target.value})} placeholder="Any specific requirements?" className="w-full border p-2 rounded dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"></textarea></div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setBookingModal(null)} className="w-1/2 bg-gray-200 dark:bg-gray-700 p-2 rounded font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition">Cancel</button>
                <button type="submit" disabled={bookMutation.isPending} className="w-1/2 bg-indigo-600 text-white p-2 rounded font-bold hover:bg-indigo-700 transition">{bookMutation.isPending ? 'Processing...' : 'Confirm Booking'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}