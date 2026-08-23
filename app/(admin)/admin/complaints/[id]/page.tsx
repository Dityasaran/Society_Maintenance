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
  resident: {
    name: string;
    email: string;
    flatNumber: string | null;
  };
  statusHistory: HistoryEntry[];
}

export default function AdminComplaintManage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadDetail = async () => {
    try {
      const res = await fetch(`/api/admin/complaints/${id}`);
      if (!res.ok) throw new Error('Complaint not found.');
      const data = await res.json();
      setComplaint(data);
      setStatus(data.status);
      setPriority(data.priority);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    // Frontend transition check
    if (complaint?.status === 'OPEN' && status === 'RESOLVED') {
      setError('Cannot transition directly from Open to Resolved. Please move to In Progress first.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          priority,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update complaint.');
      }

      setSuccessMsg('Complaint updated successfully!');
      setNote('');
      await loadDetail();
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

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <h2 className="text-xl font-bold text-rose-650 mb-4">{error}</h2>
        <Link href="/admin/complaints" className="text-indigo-600 font-semibold hover:underline">
          &larr; Back to list
        </Link>
      </div>
    );
  }

  if (!complaint) return null;

  const isResolved = complaint.status === 'RESOLVED';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            Administrative Action Panel
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Manage Complaint #{complaint.id.slice(-8).toUpperCase()}
          </h1>
        </div>
        <Link
          href="/admin/complaints"
          className="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
        >
          &larr; Back to Complaints Table
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Detail Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-850 pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-slate-400">Status:</span>
                <StatusBadge status={complaint.status} />
                <span className="text-xs font-semibold text-slate-400 ml-2">Priority:</span>
                <PriorityBadge priority={complaint.priority} />
              </div>
              <span className="text-xs text-slate-400">
                Filed on: {new Date(complaint.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">
                  Resident Name
                </span>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-1 block">
                  {complaint.resident.name}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">
                  Flat & Email
                </span>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-1 block">
                  Flat {complaint.resident.flatNumber || 'N/A'} ({complaint.resident.email})
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Category
                </h3>
                <p className="font-bold text-slate-900 dark:text-white">{complaint.category}</p>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Description
                </h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {complaint.description}
                </p>
              </div>

              {complaint.photoUrl && (
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-850">
                  <h3 className="text-sm font-semibold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-4">
                    Resident Photo Attachment
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

          {/* Status Change Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Update Status & Priority
            </h3>

            {isResolved ? (
              <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-sm p-4 rounded-xl dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 mb-2">
                🔒 This complaint is marked as <strong>Resolved</strong>. It has been locked, and no further status modifications are allowed.
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                {successMsg && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-3 rounded-lg dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400">
                    {successMsg}
                  </div>
                )}
                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-3 rounded-lg dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-450">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">
                      Set Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-xl dark:bg-slate-950 text-sm"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved (Lock Complaint)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">
                      Set Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-xl dark:bg-slate-950 text-sm"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">
                    Activity/Action Note
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Provide details about the resolution steps, scheduler updates, etc. (required for status transitions)..."
                    className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-xl dark:bg-slate-950 text-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {submitting ? 'Applying Changes...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* History Timeline */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">
              Activity History Log
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
                            <span className="h-8 w-8 rounded-full bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center ring-8 ring-white dark:ring-slate-900">
                              <span className="w-2.5 h-2.5 rounded-full bg-violet-600 dark:bg-violet-400" />
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              Status set to{' '}
                              <span className="font-extrabold text-violet-600 dark:text-violet-455">
                                {history.newStatus}
                              </span>
                            </p>
                            {history.note && (
                              <p className="text-xs text-slate-650 dark:text-slate-400 mt-1 italic">
                                &ldquo;{history.note}&rdquo;
                              </p>
                            )}
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1 justify-between flex-wrap">
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
        </div>
      </div>
    </div>
  );
}
