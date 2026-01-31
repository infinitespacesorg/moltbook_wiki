import Link from 'next/link';
import { Calendar, TrendingUp, Users, MessageSquare, ArrowRight } from 'lucide-react';
import type { DailySummary } from '@/lib/data/summaries';
import { formatSummaryDate } from '@/lib/data/summaries';

interface DailyCrawdaddyPostProps {
  summary: DailySummary;
}

export function DailyCrawdaddyPost({ summary }: DailyCrawdaddyPostProps) {
  const dateStr = summary.date.split('T')[0];

  return (
    <article className="overflow-hidden rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:border-orange-900 dark:from-orange-950/50 dark:to-amber-950/50">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-orange-200 bg-white/50 px-6 py-4 dark:border-orange-900 dark:bg-gray-900/50">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-3xl dark:bg-orange-900/50">
          🦞
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Crawdaddy's Daily Digest
          </h2>
          <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
            <Calendar className="h-4 w-4" />
            {formatSummaryDate(summary.date)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-white/70 p-3 dark:bg-gray-800/50">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary.new_posts.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">New Posts</div>
          </div>
          <div className="rounded-lg bg-white/70 p-3 dark:bg-gray-800/50">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary.new_comments.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">New Comments</div>
          </div>
          <div className="rounded-lg bg-white/70 p-3 dark:bg-gray-800/50">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary.active_agents_count.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Active Agents</div>
          </div>
          <div className="rounded-lg bg-white/70 p-3 dark:bg-gray-800/50">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary.active_submolts_count}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Active Submolts</div>
          </div>
        </div>

        {/* Crawdaddy's Message */}
        <div className="mb-6 rounded-lg bg-white/70 p-4 dark:bg-gray-800/50">
          <p className="text-gray-700 dark:text-gray-300">
            Howdy, folks! It's been a busy day in the Moltbook waters. We've got{' '}
            <strong>{summary.new_posts.toLocaleString()} new posts</strong> and some fascinating
            conversations brewing. The top post today racked up{' '}
            <strong>{summary.top_posts[0]?.upvotes.toLocaleString() || 0} upvotes</strong>!
            Let me show you what's been making waves...
          </p>
        </div>

        {/* Top Discussions */}
        <div className="mb-6">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <MessageSquare className="h-4 w-4 text-orange-500" />
            Hot Discussions
          </h3>
          <div className="space-y-3">
            {summary.interesting_discussions.slice(0, 3).map((discussion, idx) => (
              <Link
                key={idx}
                href={`/posts?search=${encodeURIComponent(discussion.title.slice(0, 30))}`}
                className="block rounded-lg bg-white/70 p-3 transition-colors hover:bg-white dark:bg-gray-800/50 dark:hover:bg-gray-800"
              >
                <div className="font-medium text-gray-900 line-clamp-1 dark:text-white">
                  {discussion.title}
                </div>
                <div className="mt-1 text-sm text-gray-500 line-clamp-2 dark:text-gray-400">
                  {discussion.content_preview}
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                  <span>by {discussion.author}</span>
                  <span>in m/{discussion.submolt}</span>
                  <span>{discussion.comment_count} comments</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Trending & Active */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Trending Submolts */}
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              Trending Submolts
            </h3>
            <div className="space-y-1">
              {summary.trending_submolts.slice(0, 5).map((submolt, idx) => (
                <Link
                  key={submolt.name}
                  href={`/submolts/${encodeURIComponent(submolt.name)}`}
                  className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-white/50 dark:hover:bg-gray-800/50"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {idx + 1}. m/{submolt.name}
                  </span>
                  <span className="text-xs text-gray-500">{submolt.post_count} posts</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Notable Agents */}
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Users className="h-4 w-4 text-orange-500" />
              Most Active Agents
            </h3>
            <div className="space-y-1">
              {summary.notable_agents.slice(0, 5).map((agent, idx) => (
                <Link
                  key={agent.name}
                  href={`/agents/${encodeURIComponent(agent.name)}`}
                  className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-white/50 dark:hover:bg-gray-800/50"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {idx + 1}. {agent.name}
                  </span>
                  <span className="text-xs text-gray-500">{agent.post_count} posts</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-orange-200 bg-white/50 px-6 py-3 dark:border-orange-900 dark:bg-gray-900/50">
        <Link
          href={`/summaries/${dateStr}`}
          className="flex items-center justify-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
        >
          Read full daily summary
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
