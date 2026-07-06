'use client';
import { useContext, useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../../context/AuthContext';
import { CalendarClock, CheckCircle, XCircle, History, Clock, MessageCircle, Star, FileText } from 'lucide-react';
import ChatWindow from '../../app/bookings/page.jsx';


import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function BookingsPage() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('active');

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPartner, setChatPartner] = useState(null);

  const [reviewModal, setReviewModal] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const myId = user?.id || user?._id;

  const { data: allBookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/bookings', { headers: { Authorization: `Bearer ${token}` } });
      return res.data.data;
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const token = localStorage.getItem('token');
      return await axios.patch(`http://localhost:5000/api/bookings/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
    },
    onSuccess: () => queryClient.invalidateQueries(['bookings'])
  });

  const reviewMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem('token');
      return await axios.post('http://localhost:5000/api/reviews', data, { headers: { Authorization: `Bearer ${token}` } });
    },
    onSuccess: () => { setReviewModal(null); setRating(5); setComment(''); alert('Review Submitted!'); }
  });

  
  const generateInvoice = (booking) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text('TEYZIX SMART COMMUNITY', 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('OFFICIAL INVOICE', 14, 30);
    
    // Invoice Details
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice No: INV-${booking._id.substring(0, 8).toUpperCase()}`, 14, 45);
    doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 14, 52);
    doc.text(`Booking Status: ${booking.status.toUpperCase()}`, 14, 59);

    // AutoTable for Billing Details
    autoTable(doc, {
      startY: 70,
      head: [['Service Provided', 'Provider Name', 'Customer Name', 'Amount']],
      body: [
        [
          booking.service?.title || 'Service', 
          booking.provider?.name || 'N/A', 
          booking.customer?.name || 'N/A', 
          `$${booking.service?.pricing || 0}`
        ],
      ],
      headStyles: { fillColor: [79, 70, 229] },
      theme: 'grid'
    });

    // Total Amount Highlight
    const finalY = doc.lastAutoTable.finalY || 100;
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38); // Red color for Total
    doc.text(`Total Paid: $${booking.service?.pricing || 0}`, 14, finalY + 15);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for using Teyzix Smart Community Marketplace!', 14, 280);

    // Download PDF
    doc.save(`Invoice_${booking._id.substring(0, 8)}.pdf`);
  };

  if (!user) return <div className="p-10 text-center text-xl font-bold">Please login to view bookings.</div>;

  const displayedBookings = allBookings.filter(b => {
    if (activeTab === 'active') return b.status === 'Pending' || b.status === 'Accepted';
    else return b.status === 'Completed' || b.status === 'Rejected' || b.status === 'Cancelled';
  });

  const handleOpenChat = (providerObj, customerObj) => {
    if (String(providerObj._id) === String(myId)) setChatPartner({ id: customerObj._id, name: customerObj.name });
    else setChatPartner({ id: providerObj._id, name: providerObj.name });
    setIsChatOpen(true);
  };

  const submitReview = (e) => {
    e.preventDefault();
    reviewMutation.mutate({ sellerId: reviewModal._id, rating, comment });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b dark:border-gray-800 pb-4">
        <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
          <CalendarClock className="text-indigo-500" size={32} /> Booking Management
        </h1>
      </div>

      <div className="flex gap-4">
        <button onClick={() => setActiveTab('active')} className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition ${activeTab === 'active' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300'}`}><Clock size={18} /> Active Bookings</button>
        <button onClick={() => setActiveTab('history')} className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300'}`}><History size={18} /> Booking History</button>
      </div>

      {isLoading ? <p className="text-center p-10 animate-pulse text-gray-500">Loading your bookings...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {displayedBookings.map(b => {
            const isProvider = String(b.provider?._id || b.provider) === String(myId);
            const isCustomer = String(b.customer?._id || b.customer) === String(myId);
            
            const badgeColor = b.status === 'Accepted' ? 'bg-green-100 text-green-700' : b.status === 'Completed' ? 'bg-blue-100 text-blue-700' : b.status === 'Rejected' || b.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';

            return (
              <div key={b._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 space-y-4 relative">
                <span className={`absolute top-4 right-4 px-3 py-1 text-xs font-black uppercase rounded-full ${badgeColor}`}>{b.status}</span>
                <div>
                  <h3 className="text-xl font-bold pr-20">{b.service?.title || 'Unknown Service'}</h3>
                  <p className="text-indigo-600 font-bold">${b.service?.pricing || 0} <span className="text-xs text-gray-500 font-normal">({b.service?.category || 'N/A'})</span></p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl flex flex-col gap-2 text-sm border dark:border-gray-700">
                  <p><span className="font-bold text-gray-500">Date & Time:</span> {b.preferredDate} at {b.preferredTime}</p>
                  {isProvider ? <p><span className="font-bold text-gray-500">Requested By:</span> {b.customer?.name}</p> : <p><span className="font-bold text-gray-500">Service Provider:</span> {b.provider?.name}</p>}
                </div>

                <div className="flex gap-2 pt-2 border-t dark:border-gray-700 flex-wrap">
                  <button onClick={() => handleOpenChat(b.provider, b.customer)} className="flex-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 py-2 rounded-lg font-bold text-sm hover:bg-indigo-100 transition flex justify-center items-center gap-1"><MessageCircle size={16}/> Chat</button>

                  {/* PDF INVOICE BUTTON (Visible when status is Completed) */}
                  {b.status === 'Completed' && (
                    <button onClick={() => generateInvoice(b)} className="flex-1 bg-gray-900 dark:bg-gray-700 text-white py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition flex justify-center items-center gap-1 shadow-md">
                      <FileText size={16}/> Invoice
                    </button>
                  )}

                  {isProvider && b.status === 'Pending' && (
                    <>
                      <button onClick={() => statusMutation.mutate({ id: b._id, status: 'Accepted' })} className="flex-1 bg-green-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition">Accept</button>
                      <button onClick={() => statusMutation.mutate({ id: b._id, status: 'Rejected' })} className="flex-1 bg-red-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-red-600 transition">Reject</button>
                    </>
                  )}
                  {isProvider && b.status === 'Accepted' && <button onClick={() => statusMutation.mutate({ id: b._id, status: 'Completed' })} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition">Mark Completed</button>}
                  {isCustomer && (b.status === 'Pending' || b.status === 'Accepted') && <button onClick={() => { if(window.confirm('Cancel this booking?')) statusMutation.mutate({ id: b._id, status: 'Cancelled' })}} className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-bold text-sm hover:bg-red-200 transition">Cancel</button>}
                  
                  {isCustomer && b.status === 'Completed' && (
                    <button onClick={() => setReviewModal(b.provider)} className="flex-1 bg-yellow-400 text-yellow-900 py-2 rounded-lg font-bold text-sm hover:bg-yellow-500 transition flex justify-center items-center gap-1 shadow-md">
                      <Star size={16} className="fill-yellow-900"/> Rate Provider
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REVIEW MODAL (remains same) */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm border dark:border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">Rate Provider</h2>
            <form onSubmit={submitReview} className="space-y-4">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button type="button" key={star} onClick={() => setRating(star)} className={`p-2 rounded-full ${rating >= star ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                    <Star size={24} className={rating >= star ? 'fill-yellow-900' : ''} />
                  </button>
                ))}
              </div>
              <textarea required rows="3" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write your review here..." className="w-full border p-2 rounded dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setReviewModal(null)} className="w-1/2 bg-gray-200 p-2 rounded font-bold hover:bg-gray-300 text-gray-800">Cancel</button>
                <button type="submit" className="w-1/2 bg-yellow-400 text-yellow-900 p-2 rounded font-bold hover:bg-yellow-500">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isChatOpen && chatPartner && <ChatWindow receiverId={chatPartner.id} receiverName={chatPartner.name} onClose={() => setIsChatOpen(false)} />}
    </div>
  );
}