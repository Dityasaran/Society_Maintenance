'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardChart } from '@/components/DashboardChart';
import { StatusBadge } from '@/components/StatusBadge';

interface DashboardData {
  statusCounts: {
    OPEN: number;
    IN_PROGRESS: number;
    RESOLVED: number;
  };
  categoryCounts: Array<{ category: string; count: number }>;
  overdueCount: number;
  recentComplaints: Array<{
    id: string;
    category: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    createdAt: string;
    resident: { name: string };
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (!res.ok) throw new Error('Failed to load dashboard data.');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError('Could not retrieve dashboard statistics.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <h2 className="text-xl font-bold text-rose-600 mb-4">{error || 'Failed to load'}</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Overview
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor status counts, complaints by category, and track overdue items.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-450 dark:text-slate-450 uppercase tracking-wider">
              Open Complaints
            </span>
            <h3 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
              {data.statusCounts.OPEN}
            </h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-450 dark:text-slate-450 uppercase tracking-wider">
              In Progress
            </span>
            <h3 className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
              {data.statusCounts.IN_PROGRESS}
            </h3>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
            </svg>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-450 dark:text-slate-450 uppercase tracking-wider">
              Resolved
            </span>
            <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
              {data.statusCounts.RESOLVED}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/45 rounded-2xl p-5 shadow-sm flex items-center justify-between ring-1 ring-rose-500/5">
          <div>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-450 uppercase tracking-wider">
              🚨 Overdue Requests
            </span>
            <h3 className="text-3xl font-extrabold text-rose-600 dark:text-rose-455 mt-2">
              {data.overdueCount}
            </h3>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Chart & Actionable Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category breakdown bar chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">
            Complaints by Category
          </h3>
          <DashboardChart data={data.categoryCounts} />
        </div>

        {/* Recent complaints table snippet */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Activity
            </h3>
            <Link
              href="/admin/complaints"
              className="text-xs font-semibold text-indigo-650 hover:underline dark:text-indigo-400"
            >
              See All &rarr;
            </Link>
          </div>

          <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800">
            {data.recentComplaints.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm py-10">
                No recent activity.
              </div>
            ) : (
              data.recentComplaints.map((c) => {
                const recentDate = new Date(c.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <div key={c.id} className="py-3 flex items-center justify-between text-sm">
                    <div className="min-w-0 pr-4">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {c.category}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        Resident: {c.resident.name} • Filed {recentDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={c.status} />
                      <Link
                        href={`/admin/complaints/${c.id}`}
                        className="text-xs font-semibold text-indigo-655 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
