import React from 'react';
import Link from 'next/link';
import { StatusBadge, PriorityBadge } from './StatusBadge';

interface ComplaintCardProps {
  complaint: {
    id: string;
    category: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    createdAt: string;
    photoUrl?: string | null;
  };
}

export function ComplaintCard({ complaint }: ComplaintCardProps) {
  const formattedDate = new Date(complaint.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col h-full">
      {complaint.photoUrl && (
        <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={complaint.photoUrl}
            alt={complaint.category}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {complaint.category}
          </span>
          <div className="flex gap-1.5">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        <p className="text-slate-600 dark:text-slate-350 text-sm line-clamp-3 mb-4 flex-1">
          {complaint.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-150 dark:border-slate-800 mt-auto">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Filed: {formattedDate}
          </span>
          <Link
            href={`/dashboard/complaints/${complaint.id}`}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-350 transition"
          >
            View Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
