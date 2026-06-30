import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="text-center md:text-left">
          <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">Smart Community</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Connecting locals. Empowering businesses.
          </p>
        </div>

        <div className="text-sm text-gray-400 dark:text-gray-500">
          &copy; {new Date().getFullYear()} Teyzix Core Internship (FSWD-3). All rights reserved.
        </div>

      </div>
    </footer>
  );
}