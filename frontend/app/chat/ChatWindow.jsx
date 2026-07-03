'use client';
import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';
import { Trash2, X, Image as ImageIcon, Send, Check, CheckCheck } from 'lucide-react';

const socket = io('http://localhost:5000');

export default function ChatWindow({ receiverId, receiverName, onClose }) {
  const { user } = useContext(AuthContext);
  const myId = user?.id || user?._id;
  const room = [myId, receiverId].sort().join('_');

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    socket.emit('join_chat', room);

    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/chat/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.data);
      scrollToBottom();
    };
    fetchHistory();

    socket.on('receive_message', (msg) => {
      setMessages((prev) => {
        // 🟢 DUPLICATE FIX HERE
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      scrollToBottom();
    });

    socket.on('message_deleted', (msgId) => {
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
    });

    socket.on('display_typing', (id) => { if (id !== myId) setIsTyping(true); });
    socket.on('hide_typing', (id) => { if (id !== myId) setIsTyping(false); });

    return () => {
      socket.off('receive_message');
      socket.off('message_deleted');
      socket.off('display_typing');
      socket.off('hide_typing');
    };
  }, [receiverId, room, myId]);

  const scrollToBottom = () => setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socket.emit('typing', { room, senderId: myId });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', { room, senderId: myId });
    }, 1500);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !imageFile) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('receiverId', receiverId);
      if (newMessage.trim()) formData.append('text', newMessage);
      if (imageFile) formData.append('image', imageFile);

      const res = await axios.post('http://localhost:5000/api/chat', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const sentMsg = res.data.data;
      
      // Emit to others
      socket.emit('send_message', { room, messageObj: sentMsg });
      
      // Append to our own screen manually
      setMessages((prev) => [...prev, sentMsg]);
      
      setNewMessage('');
      setImageFile(null);
      socket.emit('stop_typing', { room, senderId: myId });
      scrollToBottom();
    } catch (err) {
      alert('Error sending message');
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (msgId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/chat/${msgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      socket.emit('delete_message', { room, msgId });
    } catch (err) {
      alert('Cannot delete this message');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md flex flex-col h-[600px] overflow-hidden border dark:border-gray-800">
        
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white shadow-md z-10">
          <div>
            <h3 className="font-bold text-lg">{receiverName}</h3>
            {isTyping ? <p className="text-xs text-indigo-200 animate-pulse">typing...</p> : <p className="text-xs text-indigo-200">Live Chat</p>}
          </div>
          <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded-full transition"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-950 flex flex-col gap-4">
          {messages.map((msg) => {
            const isMe = String(msg.sender) === String(myId);
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`relative max-w-[80%] px-4 py-2 rounded-2xl shadow-sm flex flex-col gap-1 
                  ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border dark:border-gray-700 rounded-bl-none'}`}>
                  
                  {msg.image && <img src={msg.image} alt="Shared" className="rounded-xl w-full object-cover mt-1 max-h-48" />}
                  {msg.text && <p className="text-sm leading-relaxed break-words">{msg.text}</p>}
                  
                  <div className="flex justify-end items-center gap-1 mt-1">
                    <span className="text-[10px] opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (msg.isRead ? <CheckCheck size={14} className="text-blue-300" /> : <Check size={14} className="opacity-70" />)}
                  </div>

                  {isMe && (
                    <button onClick={() => { if(window.confirm('Delete this message?')) deleteMessage(msg._id); }} className="absolute top-2 -left-8 text-red-400 hover:text-red-600 bg-white/50 dark:bg-gray-800 p-1 rounded-full shadow-sm" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-3 bg-white dark:bg-gray-900 border-t dark:border-gray-800 flex items-center gap-2">
          <label className="cursor-pointer text-gray-400 hover:text-indigo-600 transition p-2">
            <ImageIcon size={24} />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
          </label>
          
          <div className="flex-1 relative">
            {imageFile && (
              <div className="absolute bottom-12 left-0 bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full flex items-center gap-2 shadow-md">
                Image Selected <button onClick={() => setImageFile(null)}><X size={12}/></button>
              </div>
            )}
            <input type="text" placeholder="Type a message..." value={newMessage} onChange={handleTyping} className="w-full p-3 bg-gray-100 dark:bg-gray-800 border-none rounded-full focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white" />
          </div>

          <button type="submit" disabled={loading || (!newMessage.trim() && !imageFile)} className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition disabled:opacity-50 shadow-md">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}