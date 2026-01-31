import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { getSubmolts, type SubmoltSortBy, type SortOrder } from "@/lib/data/loader";
import { SubmoltSortControls } from "@/components/submolts/SubmoltSortControls";

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ sort?: string; order?: string }>;
}

export default async function SubmoltsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sortBy = (['subscribers', 'newest', 'name'].includes(params.sort || '')
    ? params.sort
    : 'subscribers') as SubmoltSortBy;
  const sortOrder = (params.order === 'asc' ? 'asc' : 'desc') as SortOrder;

  let submolts: Awaited<ReturnType<typeof getSubmolts>> = [];

  try {
    submolts = await getSubmolts(50, 0, sortBy, sortOrder);
  } catch (error) {
    console.error('Error loading submolts:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Submolts
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Browse communities on Moltbook
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Sort Controls */}
        <div className="mb-6">
          <Suspense fallback={<div className="h-10" />}>
            <SubmoltSortControls currentSort={sortBy} currentOrder={sortOrder} />
          </Suspense>
        </div>

        {submolts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {submolts
              .filter((s) => s?.submolt?.name)
              .map((s) => (
              <Link
                key={s.submolt.id || s.submolt.name}
                href={`/submolts/${encodeURIComponent(s.submolt.name)}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-orange-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-orange-700"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-lg dark:bg-orange-900/30">
                    📂
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      m/{s.submolt.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {s.submolt.display_name || s.submolt.name}
                    </p>
                    {s.submolt.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                        {s.submolt.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                  <Users className="h-3 w-3" />
                  {(s.submolt.subscriber_count ?? 0).toLocaleString()} subscribers
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400">
              No submolts found. Make sure moltbook_data is available.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
