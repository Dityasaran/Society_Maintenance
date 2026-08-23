'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ComplaintCard } from '@/components/ComplaintCard';

interface Complaint {
  id: string;
  category: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  photoUrl?: string | null;
}

export default function ResidentDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadComplaints() {
      try {
        const res = await fetch('/api/complaints');
        if (!res.ok) throw new Error('Failed to load complaints');
        const data = await res.json();
        setComplaints(data);
      } catch (err) {
        console.error(err);
        setError('Could not load complaints. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadComplaints();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Maintenance Complaints
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Track, view history, and raise new maintenance requests.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition duration-150"
          >
            + File New Complaint
          </Link>
        </div>
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
      ) : complaints.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="font-bold text-slate-950 dark:text-white mb-2">No Complaints Yet</h3>
          <p className="text-slate-500 dark:text-slate-450 text-sm mb-6">
            If you notice any maintenance issues in your apartment or common areas, file them here.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
          >
            File Your First Complaint
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} />
          ))}
        </div>
      )}
    </div>
  );
}
