'use client';

import React, { useEffect, useState } from 'react';
import { NoticeCard } from '@/components/NoticeCard';

interface Notice {
  id: string;
  title: string;
  body: string;
  isImportant: boolean;
  createdAt: string;
  admin?: {
    name: string;
  } | null;
}

export default function NoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNotices() {
      try {
        const res = await fetch('/api/notices');
        if (!res.ok) throw new Error('Failed to load notice board');
        const data = await res.json();

        // Sort notices: Important ones pinned at top, then by date descending
        const sorted = (data as Notice[]).sort((a, b) => {
          if (a.isImportant && !b.isImportant) return -1;
          if (!a.isImportant && b.isImportant) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setNotices(sorted);
      } catch (err) {
        console.error(err);
        setError('Could not load notices. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    loadNotices();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Notice Board
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Stay updated with the latest society announcements, repairs, and updates.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-450">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : notices.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-slate-400 dark:text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <h3 className="font-bold text-slate-950 dark:text-white mb-2">No Announcements</h3>
          <p className="text-slate-500 dark:text-slate-450 text-sm">
            There are currently no active notices posted on the board.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      )}
    </div>
  );
}
