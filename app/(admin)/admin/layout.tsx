'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/complaints', label: 'Manage Complaints' },
    { href: '/admin/notices', label: 'Post Notices' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Admin Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/admin/dashboard" className="flex items-center gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  Admin Dashboard
                </span>
                <span className="px-1.5 py-0.5 rounded bg-violet-650 text-[10px] uppercase font-bold tracking-wider text-violet-100">
                  Staff
                </span>
              </Link>
              <nav className="hidden md:flex space-x-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                        isActive
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center px-4 py-2 border border-slate-700 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-850 hover:text-white transition"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950/40 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400 dark:text-slate-500">
          Society Maintenance Tracker &copy; {new Date().getFullYear()}. Staff Administration.
        </div>
      </footer>
    </div>
  );
}
