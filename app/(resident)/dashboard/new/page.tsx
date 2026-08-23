'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Security', 'Other'];

export default function NewComplaint() {
  const router = useRouter();

  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size and format
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be smaller than 5 MB.');
      return;
    }

    setError(null);
    setPhoto(file);

    // Create a local preview URI
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!description.trim()) {
      setError('Description is required.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('description', description.trim());
      if (photo) {
        formData.append('photo', photo);
      }

      const res = await fetch('/api/complaints', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit complaint');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            File Maintenance Complaint
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fill in the details below to raise a maintenance request.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          &larr; Back to List
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-3.5 rounded-lg dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-450">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full px-3 py-2.5 border border-slate-300 dark:border-slate-800 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-950 dark:text-white sm:text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Description of the Issue
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-950 dark:text-white sm:text-sm"
              placeholder="Provide clear details about the complaint (e.g. location, severity, when it started)..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Add Photo (Optional, max 5MB)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-850 border-dashed rounded-xl">
              <div className="space-y-1 text-center">
                {photoPreview ? (
                  <div className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="mx-auto h-32 w-auto object-cover rounded-lg border border-slate-200 dark:border-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 hover:bg-rose-700 shadow"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg
                      className="mx-auto h-12 w-12 text-slate-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-slate-650 justify-center">
                      <label
                        htmlFor="photo-upload"
                        className="relative cursor-pointer rounded-md font-semibold text-indigo-650 hover:text-indigo-500 dark:text-indigo-400 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="photo-upload"
                          name="photo"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handlePhotoChange}
                        />
                      </label>
                      <p className="pl-1 dark:text-slate-400">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Submitting...' : 'Lodge Complaint'}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center py-2.5 px-6 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
