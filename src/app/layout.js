


// import './globals.css';
// import { Inter } from 'next/font/google';
// import Sidebar from '@/components/layout/Sidebar';
// import Header from '@/components/layout/Header';
// import AuthProvider from '@/services/AuthProvider';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'Office Cost Analysis System',
//   description: 'Track office costs and analyze profit/loss in real-time',
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
    

    
//       <body className={`${inter.className} bg-gray-50`}>
//           <AuthProvider>
//         <div className="flex min-h-screen">
//           {/* <Sidebar /> */}
//           <div className="flex-1">
//             {/* <Header /> */}
//             <main className="p-4 md:p-6">
//               {children}
//             </main>
//           </div>
//         </div>
//             </AuthProvider>
//       </body>
    
//     </html>
//   );
// }

// src/app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Office Cost Management',
  description: 'Manage office costs efficiently',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}