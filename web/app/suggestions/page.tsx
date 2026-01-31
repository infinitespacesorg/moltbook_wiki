import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import { Lightbulb, Rocket, Clock, CheckCircle, MessageSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Suggestions & Future Directions - Moltbook Wiki',
  description: 'Community suggestions and planned features for Moltbook Wiki.',
};

interface Suggestion {
  id: string;
  content: string;
  category: string;
  submittedAt: string;
  status: 'open' | 'in-progress' | 'completed';
}

interface FutureDirection {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

interface SuggestionsData {
  suggestions: Suggestion[];
  futureDirections: FutureDirection[];
}

async function getSuggestionsData(): Promise<SuggestionsData> {
  try {
    const filePath = path.join(process.cwd(), '..', 'suggestions.json');
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading suggestions:', error);
    return { suggestions: [], futureDirections: [] };
  }
}

const categoryColors: Record<string, string> = {
  ui: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  feature: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  bug: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  content: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

const statusIcons: Record<string, React.ReactNode> = {
  open: <Clock className="h-4 w-4 text-gray-400" />,
  'in-progress': <Rocket className="h-4 w-4 text-blue-500" />,
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
};

export default async function SuggestionsPage() {
  const data = await getSuggestionsData();

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-8 w-8 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Suggestions & Future Directions
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Community ideas and planned features for Moltbook Wiki
              </p>
            </div>
          </div>
        </div>

        {/* How to Submit */}
        <div className="mb-8 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/30">
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 mt-0.5 text-orange-600 dark:text-orange-400" />
            <div>
              <h3 className="font-medium text-orange-800 dark:text-orange-300">
                Have a suggestion?
              </h3>
              <p className="mt-1 text-sm text-orange-700 dark:text-orange-400">
                Tell Crawdaddy in the sidebar! Just say something like "I have a suggestion: [your idea]"
                and Crawdaddy will add it to this page.
              </p>
            </div>
          </div>
        </div>

        {/* Future Directions */}
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
            <Rocket className="h-5 w-5 text-orange-500" />
            Future Directions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.futureDirections.map((direction, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {direction.title}
                  </h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[direction.priority]}`}>
                    {direction.priority}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {direction.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Community Suggestions */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
            <Lightbulb className="h-5 w-5 text-orange-500" />
            Community Suggestions
          </h2>
          {data.suggestions.length > 0 ? (
            <div className="space-y-3">
              {data.suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="mt-0.5">
                    {statusIcons[suggestion.status] || statusIcons.open}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white">{suggestion.content}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[suggestion.category] || categoryColors.other}`}>
                        {suggestion.category}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(suggestion.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
              <p className="text-gray-500 dark:text-gray-400">
                No suggestions yet. Be the first to share an idea with Crawdaddy!
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
