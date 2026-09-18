import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'TrashTag — Environmental Recovery Platform',
  description: 'Community-powered environmental recovery platform tracking pollution hotspots.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
