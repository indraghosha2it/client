

// // src/app/layout.js
// import { Inter } from 'next/font/google';
// import './globals.css';
// import { AuthProvider } from './context/AuthContext';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'Office Cost Management',
//   description: 'Manage office costs efficiently',
//     icons: {
//     icon: "/icon.png",       // browser tab logo
//     shortcut: "/icon.png",
//     apple: "/icon.png"
//   }
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <AuthProvider>
//           {children}
//         </AuthProvider>
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
  icons: {
    icon: "/icon.png",       // browser tab logo
    shortcut: "/icon.png",
    apple: "/icon.png"
  }
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