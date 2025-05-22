'use client';
import { ArrowLeftCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function UnauthorizedPage() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-center px-4">
      <div className="max-w-md">
        <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Forbidden</h1>
        <p className="text-gray-700 mb-6">
          You don’t have permission to access <strong>{from}</strong>.
        </p>

        <div className="flex flex-col gap-4 items-center">
        <a
            href={from}
            className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
          >
            <ArrowLeftCircle className="w-5 h-5" />
            Try Again
          </a>
          <a
            href="/"
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}
