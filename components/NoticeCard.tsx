import React from 'react';

interface NoticeCardProps {
  notice: {
    id: string;
    title: string;
    body: string;
    isImportant: boolean;
    createdAt: string;
    admin?: {
      name: string;
    } | null;
  };
}

export function NoticeCard({ notice }: NoticeCardProps) {
  const formattedDate = new Date(notice.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`border rounded-xl p-5 shadow-sm transition duration-200 ${
        notice.isImportant
          ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/50 ring-1 ring-rose-500/10'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between mb-2.5 gap-2">
        <h3 className="font-semibold text-slate-900 dark:text-white text-base md:text-lg">
          {notice.title}
        </h3>
        {notice.isImportant && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400">
            ⚠️ Important
          </span>
        )}
      </div>
      <p className="text-slate-600 dark:text-slate-350 text-sm whitespace-pre-wrap leading-relaxed mb-4">
        {notice.body}
      </p>
      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <span>Posted by: {notice.admin?.name || 'Admin'}</span>
        <span>{formattedDate}</span>
      </div>
    </div>
  );
}
