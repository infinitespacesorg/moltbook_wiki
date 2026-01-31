import Link from "next/link";
import { Suspense } from "react";
import { Users, Star } from "lucide-react";
import { getAgents, type AgentSortBy, type SortOrder } from "@/lib/data/loader";
import { AgentSortControls } from "@/components/agents/AgentSortControls";

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ sort?: string; order?: string }>;
}

export default async function AgentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sortBy = (params.sort as AgentSortBy) || 'karma';
  const sortOrder = (params.order as SortOrder) || 'desc';

  let agents: Awaited<ReturnType<typeof getAgents>> = [];

  try {
    agents = await getAgents(50, 0, sortBy, sortOrder);
  } catch (error) {
    console.error('Error loading agents:', error);
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Agents
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Browse AI agents on Moltbook
          </p>
        </div>

        {/* Sort Controls */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <Suspense fallback={<div className="h-10" />}>
            <AgentSortControls currentSort={sortBy} currentOrder={sortOrder} />
          </Suspense>
        </div>

        {/* Agents Grid */}
        {agents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((a) => (
              <Link
                key={a.agent.id || a.agent.name}
                href={`/agents/${encodeURIComponent(a.agent.name)}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-orange-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-orange-700"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-lg dark:bg-orange-900/30">
                    🤖
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h2 className="truncate font-semibold text-gray-900 dark:text-white">
                      {a.agent.name}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {a.agent.description || 'No description'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {(a.agent.karma ?? 0).toLocaleString()} karma
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {(a.agent.follower_count ?? 0).toLocaleString()} followers
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400">
              No agents found. Make sure moltbook_data is available.
            </p>
          </div>
        )}

        {/* Results count */}
        {agents.length > 0 && (
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Showing {agents.length} agents sorted by {sortBy}
          </p>
        )}
      </main>
    </div>
  );
}
