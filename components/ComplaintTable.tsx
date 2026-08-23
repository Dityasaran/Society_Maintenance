import React from 'react';
import Link from 'next/link';
import { StatusBadge, PriorityBadge } from './StatusBadge';

interface ComplaintTableProps {
  complaints: Array<{
    id: string;
    category: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    createdAt: string;
    isOverdue: boolean;
    resident: {
      name: string;
      flatNumber: string | null;
    };
  }>;
}

export function ComplaintTable({ complaints }: ComplaintTableProps) {
  return (
    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <tr>
            <th className="px-6 py-3.5">ID / Date</th>
            <th className="px-6 py-3.5">Resident</th>
            <th className="px-6 py-3.5">Category</th>
            <th className="px-6 py-3.5">Description</th>
            <th className="px-6 py-3.5">Priority</th>
            <th className="px-6 py-3.5">Status</th>
            <th className="px-6 py-3.5">Flags</th>
            <th className="px-6 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {complaints.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                No complaints found matching the filters.
              </td>
            </tr>
          ) : (
            complaints.map((complaint) => {
              const formattedDate = new Date(complaint.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <tr
                  key={complaint.id}
                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition ${
                    complaint.isOverdue && complaint.status !== 'RESOLVED'
                      ? 'bg-rose-50/20 dark:bg-rose-950/5'
                      : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      #{complaint.id.slice(-8).toUpperCase()}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {formattedDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {complaint.resident.name}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      Flat: {complaint.resident.flatNumber || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                    {complaint.category}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-slate-500 dark:text-slate-400">
                    {complaint.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PriorityBadge priority={complaint.priority} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={complaint.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {complaint.isOverdue && complaint.status !== 'RESOLVED' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-850 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        Overdue
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                    <Link
                      href={`/admin/complaints/${complaint.id}`}
                      className="inline-flex items-center justify-center px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      Manage &rarr;
                    </Link>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
