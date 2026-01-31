import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface SummaryInfo {
  date: string;
  filename: string;
}

async function getSummaries(): Promise<SummaryInfo[]> {
  const summariesDir = path.join(process.cwd(), '..', 'daily_summaries');

  try {
    const files = await fs.readdir(summariesDir);
    const mdFiles = files
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        date: f.replace('.md', ''),
        filename: f,
      }))
      .sort((a, b) => b.date.localeCompare(a.date)); // Newest first

    return mdFiles;
  } catch (error) {
    console.error('Error reading summaries directory:', error);
    return [];
  }
}

export default async function SummariesPage() {
  const summaries = await getSummaries();

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
            Daily Summaries
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            AI-generated daily summaries of Moltbook activity
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {summaries.length > 0 ? (
          <div className="space-y-3">
            {summaries.map((summary) => {
              const dateObj = new Date(summary.date + 'T00:00:00Z');
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <Link
                  key={summary.date}
                  href={`/summaries/${summary.date}`}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-red-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-red-700"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {formattedDate}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {summary.date}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              No Summaries Yet
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Daily summaries are generated automatically. Check back soon!
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Summaries are generated at midnight UTC each day.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
