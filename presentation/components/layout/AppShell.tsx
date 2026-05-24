'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { RightWidget } from './RightWidget';
import { MobileBottomNav } from './MobileBottomNav';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  
  // Hide shell on auth pages
  if (pathname?.startsWith('/auth')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <div className="container mx-auto flex max-w-7xl justify-center">
        {/* Left Sidebar (Desktop/Tablet) */}
        <Sidebar />

        {/* Main Content Column */}
        {/* Adds left margin equal to sidebar width (w-20 or xl:w-64) */}
        <main className="flex-1 min-w-0 border-r border-gray-800 ml-20 xl:ml-64 pb-16 md:pb-0 max-w-2xl w-full xl:max-w-3xl">
          {children}
        </main>

        {/* Right Widget (Desktop only) */}
        <RightWidget />
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}
