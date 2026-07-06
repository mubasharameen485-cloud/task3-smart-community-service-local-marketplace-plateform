import './globals.css';
import Providers from './providers';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer'; 

export const metadata = {
  title: 'Smart Community & Local Marketplace',
  description: 'Teyzix Core FSWD-3 Task',
  manifest: '/manifest.json', 
  themeColor: '#4f46e5',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col transition-colors duration-300">
        <Providers>
          <Navbar />
          
          {/* Main content expands to push footer down */}
          <main className="flex-1 p-6">
            {children}
          </main>
          
          <Footer /> {/* FOOTER YAHAN ADD HUA HAI */}
        </Providers>
      </body>
    </html>
  );
}