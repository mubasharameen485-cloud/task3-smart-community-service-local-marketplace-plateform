import Link from 'next/link';
import { ArrowRight, ShoppingBag, Wrench, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto space-y-16 py-10">
      
      {/* HERO SECTION */}
      <section className="text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
          Welcome to the <span className="text-indigo-600 dark:text-indigo-400">Smart Community</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Your all-in-one local marketplace. Hire trusted freelancers, buy and sell products, and connect with your community seamlessly.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-indigo-500/30 transition flex items-center gap-2">
            Join Now <ArrowRight size={20} />
          </Link>
          <Link href="/login" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 px-8 py-3 rounded-full font-bold shadow-sm transition">
            Login
          </Link>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {/* Feature 1 */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center hover:-translate-y-2 transition-transform duration-300">
          <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400">
            <ShoppingBag size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">Product Marketplace</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Buy and sell new or used items within your trusted local community securely.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center hover:-translate-y-2 transition-transform duration-300">
          <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
            <Wrench size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">Hire Professionals</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Find the best local plumbers, web developers, tutors, and more. Book them instantly.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center hover:-translate-y-2 transition-transform duration-300">
          <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600 dark:text-purple-400">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">Real-Time Chat</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Communicate safely with buyers and sellers using our encrypted real-time messaging system.
          </p>
        </div>
      </section>

    </div>
  );
}