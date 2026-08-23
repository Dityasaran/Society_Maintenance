'use client';

import React, { useEffect, useState } from 'react';
import { ComplaintTable } from '@/components/ComplaintTable';

const CATEGORIES = ['ALL', 'Plumbing', 'Electrical', 'Cleaning', 'Security', 'Other'];
const STATUSES = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'];

export default function AdminComplaintsList() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (category !== 'ALL') query.append('category', category);
      if (status !== 'ALL') query.append('status', status);
      if (startDate) query.append('startDate', startDate);
      if (endDate) query.append('endDate', endDate);

      const res = await fetch(`/api/admin/complaints?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to retrieve complaints.');
      const data = await res.json();
      setComplaints(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, status, startDate, endDate]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Manage Maintenance Complaints
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Filter, set priority, resolve issues, and view detailed audit histories. Overdue items are pinned to top automatically.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-950 dark:text-white text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-950 dark:text-white text-sm"
            >
              {STATUSES.map((stat) => (
                <option key={stat} value={stat}>
                  {stat === 'ALL' ? 'All Statuses' : stat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-950 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-950 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(category !== 'ALL' || status !== 'ALL' || startDate || endDate) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setCategory('ALL');
                setStatus('ALL');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-indigo-650 font-semibold hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
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
      ) : (
        <ComplaintTable complaints={complaints} />
      )}
    </div>
  );
}
