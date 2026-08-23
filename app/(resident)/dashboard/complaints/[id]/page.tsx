'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';

interface HistoryEntry {
  id: string;
  oldStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | null;
  newStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  note?: string | null;
  changedAt: string;
  user: {
    name: string;
    role: string;
  };
}

interface Complaint {
  id: string;
  category: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  photoUrl?: string | null;
  statusHistory: HistoryEntry[];
}

export default function ComplaintDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDetail() {
      try {
        const res = await fetch(`/api/complaints/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Complaint not found.');
          throw new Error('Failed to load complaint details.');
        }
        const data = await res.json();
        setComplaint(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <h2 className="text-xl font-bold text-rose-600 mb-4">{error || 'Complaint not found'}</h2>
        <Link href="/dashboard" className="text-indigo-650 font-semibold hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(complaint.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-650 dark:text-indigo-400">
            Complaint Details
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            #{complaint.id.slice(-8).toUpperCase()} - {complaint.category}
          </h1>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-slate-650 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-xs font-semibold text-slate-400">Status:</span>
              <StatusBadge status={complaint.status} />
              <span className="text-xs font-semibold text-slate-400 ml-2">Priority:</span>
              <PriorityBadge priority={complaint.priority} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                {complaint.description}
              </p>
            </div>

            {complaint.photoUrl && (
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-850">
                <h3 className="text-sm font-semibold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-4">
                  Attached Image
                </h3>
                <div className="relative rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 inline-block max-w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={complaint.photoUrl}
                    alt="Complaint attachment"
                    className="max-h-96 w-auto object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Timeline */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">
              Activity History
            </h3>

            <div className="flow-root">
              <ul className="-mb-8">
                {complaint.statusHistory.map((history, idx) => {
                  const entryDate = new Date(history.changedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <li key={history.id}>
                      <div className="relative pb-8">
                        {idx !== complaint.statusHistory.length - 1 && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-800"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center ring-8 ring-white dark:ring-slate-900">
                              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              Status changed to{' '}
                              <span className="font-extrabold text-indigo-650 dark:text-indigo-400">
                                {history.newStatus}
                              </span>
                            </p>
                            {history.note && (
                              <p className="text-xs text-slate-650 dark:text-slate-400 mt-1 italic">
                                &ldquo;{history.note}&rdquo;
                              </p>
                            )}
                            <div className="text-[10px] text-slate-400 dark:text-slate-550 mt-1 flex items-center gap-1.5 justify-between">
                              <span>By: {history.user.name} ({history.user.role})</span>
                              <span>{entryDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-slate-900/40 rounded-xl p-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold block mb-1">Filed On</span>
            {formattedDate}
          </div>
        </div>
      </div>
    </div>
  );
}
