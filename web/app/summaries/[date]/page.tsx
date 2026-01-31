import Link from "next/link";
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ date: string }>;
}

async function getSummaryContent(date: string): Promise<string | null> {
  const summaryPath = path.join(process.cwd(), '..', 'daily_summaries', `${date}.md`);

  try {
    const content = await fs.readFile(summaryPath, 'utf-8');
    return content;
  } catch {
    return null;
  }
}

async function getAdjacentDates(date: string): Promise<{ prev: string | null; next: string | null }> {
  const summariesDir = path.join(process.cwd(), '..', 'daily_summaries');

  try {
    const files = await fs.readdir(summariesDir);
    const dates = files
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''))
      .sort();

    const currentIndex = dates.indexOf(date);

    return {
      prev: currentIndex > 0 ? dates[currentIndex - 1] : null,
      next: currentIndex < dates.length - 1 ? dates[currentIndex + 1] : null,
    };
  } catch {
    return { prev: null, next: null };
  }
}

function parseMarkdown(content: string): string {
  // Simple markdown to HTML conversion
  let html = content
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-2 text-gray-900 dark:text-white">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-red-600 hover:text-red-700 underline" target="_blank" rel="noopener">$1</a>')
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:text-gray-400 my-2">$1</blockquote>')
    // Unordered lists
    .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc text-gray-700 dark:text-gray-300">$1</li>')
    // Tables (basic)
    .replace(/\|([^|]+)\|([^|]+)\|/g, '<tr><td class="border px-4 py-2">$1</td><td class="border px-4 py-2">$2</td></tr>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="my-8 border-gray-300 dark:border-gray-700" />')
    // Paragraphs (wrap remaining text)
    .replace(/^(?!<[hlubtro]|$)(.+)$/gm, '<p class="my-4 text-gray-700 dark:text-gray-300">$1</p>');

  // Wrap lists
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="my-4 space-y-1">$&</ul>');

  return html;
}

export default async function SummaryPage({ params }: Props) {
  const { date } = await params;
  const content = await getSummaryContent(date);
  const { prev, next } = await getAdjacentDates(date);

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Summary Not Found
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            No summary exists for {date}.
          </p>
          <Link
            href="/summaries"
            className="mt-4 inline-block text-red-600 hover:text-red-700"
          >
            ← Back to Summaries
          </Link>
        </div>
      </div>
    );
  }

  const dateObj = new Date(date + 'T00:00:00Z');
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const htmlContent = parseMarkdown(content);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/summaries"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Summaries
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {formattedDate}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{date}</p>
            </div>

            {/* Navigation */}
            <div className="flex gap-2">
              {prev && (
                <Link
                  href={`/summaries/${prev}`}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>
              )}
              {next && (
                <Link
                  href={`/summaries/${next}`}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <article className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          <div
            className="prose prose-gray dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </article>
      </main>
    </div>
  );
}
