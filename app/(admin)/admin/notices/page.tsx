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

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadNotices = async () => {
    try {
      const res = await fetch('/api/notices');
      if (!res.ok) throw new Error('Could not retrieve notices.');
      const data = await res.json();
      setNotices(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve notice history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    if (!title.trim() || !body.trim()) {
      setError('Title and body are required.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          isImportant,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to post notice.');
      }

      setSuccessMsg('Notice posted successfully! Residents have been notified.');
      setTitle('');
      setBody('');
      setIsImportant(false);
      await loadNotices();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Announcements & Notice Board
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Post updates, repairs notice, and general announcements. Important announcements broadcast email alerts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm sticky top-24">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Post New Notice
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs p-3 rounded-lg dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400">
                  {successMsg}
                </div>
              )}
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-455">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lift Maintenance Schedule"
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-xl dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">
                  Announcement Body
                </label>
                <textarea
                  rows={5}
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write clear explanation..."
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-xl dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="isImportant"
                  type="checkbox"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label
                  htmlFor="isImportant"
                  className="ml-2 block text-xs font-bold text-slate-900 dark:text-slate-300"
                >
                  Mark as Important (Sends Email Broadcast)
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Notices Board List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            Currently Active Board
          </h3>

          {loading ? (
            <div className="py-10 flex justify-center items-center">
              <div className="w-6 h-6 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : notices.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-205 dark:border-slate-800 rounded-xl text-slate-400">
              No notices published yet.
            </div>
          ) : (
            <div className="space-y-4">
              {notices.map((notice) => (
                <NoticeCard key={notice.id} notice={notice} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
