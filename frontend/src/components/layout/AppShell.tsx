'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { LayoutProvider } from '@/context/LayoutContext';
import { DemoModeBanner } from '@/components/demo/DemoModeBanner';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      <DemoModeBanner />
      <AppHeader />
      <div className="flex-1 flex min-h-0 relative">
        <AppSidebar />
        <main className="flex-1 min-w-0 w-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <AppShellContent>{children}</AppShellContent>
    </LayoutProvider>
  );
}
