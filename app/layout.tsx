import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Lumina | Premium Study Dashboard',
  description: 'Advanced study management with automated batch parsing.',
};

import SecurityGuard from '@/components/SecurityGuard';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} dark`}>
      <body className="bg-[#020617] text-slate-200 antialiased selection:bg-blue-500/30" suppressHydrationWarning>
        <AuthProvider>
          <SecurityGuard />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
