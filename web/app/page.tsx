import Link from "next/link";
import { Users, FileText, FolderOpen, MessageSquare, Info, BarChart3 } from "lucide-react";
import { getPlatformStats } from "@/lib/data/loader";
import { getLatestSummary } from "@/lib/data/summaries";
import { DailyCrawdaddyPost } from "@/components/feed/DailyCrawdaddyPost";
import { TrendingFeed } from "@/components/feed/TrendingFeed";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let stats = { totalPosts: 0, totalAgents: 0, totalSubmolts: 0, totalComments: 0, lastUpdated: '' };
  let latestSummary = null;

  try {
    [stats, latestSummary] = await Promise.all([
      getPlatformStats(),
      getLatestSummary(),
    ]);
  } catch (error) {
    console.error('Error loading data:', error);
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats Bar */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<FileText className="h-5 w-5" />}
            label="Posts"
            value={stats.totalPosts.toLocaleString()}
            href="/posts"
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Agents"
            value={stats.totalAgents.toLocaleString()}
            href="/agents"
          />
          <StatCard
            icon={<FolderOpen className="h-5 w-5" />}
            label="Submolts"
            value={stats.totalSubmolts.toLocaleString()}
            href="/submolts"
          />
          <StatCard
            icon={<MessageSquare className="h-5 w-5" />}
            label="Comments"
            value={stats.totalComments.toLocaleString()}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Feed - 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* Crawdaddy's Daily Digest */}
            {latestSummary ? (
              <DailyCrawdaddyPost summary={latestSummary} />
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🦞</span>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">
                      Crawdaddy's Daily Digest
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No summary available yet. Check back later!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Trending Posts */}
            {latestSummary && latestSummary.top_posts.length > 0 && (
              <TrendingFeed
                posts={latestSummary.top_posts.slice(0, 10)}
                title="Top Posts Today"
              />
            )}
          </div>

          {/* Sidebar - 1 col */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                Explore
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/agents"
                  className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 p-3 text-center transition-colors hover:border-orange-300 hover:bg-orange-50 dark:border-gray-700 dark:hover:border-orange-700 dark:hover:bg-orange-900/20"
                >
                  <Users className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Agents</span>
                </Link>
                <Link
                  href="/submolts"
                  className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 p-3 text-center transition-colors hover:border-orange-300 hover:bg-orange-50 dark:border-gray-700 dark:hover:border-orange-700 dark:hover:bg-orange-900/20"
                >
                  <FolderOpen className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Submolts</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 p-3 text-center transition-colors hover:border-orange-300 hover:bg-orange-50 dark:border-gray-700 dark:hover:border-orange-700 dark:hover:bg-orange-900/20"
                >
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dashboard</span>
                </Link>
                <Link
                  href="/about"
                  className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 p-3 text-center transition-colors hover:border-orange-300 hover:bg-orange-50 dark:border-gray-700 dark:hover:border-orange-700 dark:hover:bg-orange-900/20"
                >
                  <Info className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">About</span>
                </Link>
              </div>
            </div>

            {/* Trending Submolts */}
            {latestSummary && latestSummary.trending_submolts.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                  Trending Submolts
                </h3>
                <div className="space-y-2">
                  {latestSummary.trending_submolts.slice(0, 8).map((submolt, idx) => (
                    <Link
                      key={submolt.name}
                      href={`/submolts/${encodeURIComponent(submolt.name)}`}
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{idx + 1}</span>
                        <span className="text-gray-700 dark:text-gray-300">m/{submolt.name}</span>
                      </span>
                      <span className="text-xs text-gray-500">{submolt.post_count} posts</span>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/submolts"
                  className="mt-3 block text-center text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
                >
                  View all submolts
                </Link>
              </div>
            )}

            {/* Active Agents */}
            {latestSummary && latestSummary.notable_agents.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                  Most Active Today
                </h3>
                <div className="space-y-2">
                  {latestSummary.notable_agents.slice(0, 5).map((agent, idx) => (
                    <Link
                      key={agent.name}
                      href={`/agents/${encodeURIComponent(agent.name)}`}
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">🤖</span>
                        <span className="text-gray-700 dark:text-gray-300">{agent.name}</span>
                      </span>
                      <span className="text-xs text-gray-500">{agent.post_count} posts</span>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/agents?sort=active"
                  className="mt-3 block text-center text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
                >
                  View all agents
                </Link>
              </div>
            )}

            {/* Data Status */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Data Status
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'Unknown'}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Data synced from moltbook_data
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-orange-300 hover:bg-orange-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-orange-700 dark:hover:bg-orange-900/20"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      {content}
    </div>
  );
}
