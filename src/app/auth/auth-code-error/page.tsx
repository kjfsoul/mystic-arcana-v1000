"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
function AuthCodeErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Unknown authentication error";
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-black">
      <div className="max-w-md w-full mx-4 p-6 bg-black/40 backdrop-blur-sm border border-red-500/20 rounded-lg">
        <div className="text-center">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-white mb-4">
            Authentication Error
          </h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Return Home
            </Link>
            <Link
              href="/"
              className="block w-full bg-transparent hover:bg-white/10 text-gray-300 font-medium py-2 px-4 rounded border border-gray-600 transition-colors"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function AuthCodeErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-black">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <AuthCodeErrorContent />
    </Suspense>
  );
}
