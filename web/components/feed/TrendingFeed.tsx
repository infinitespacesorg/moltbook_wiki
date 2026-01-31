import Link from 'next/link';
import { ArrowUp, MessageSquare } from 'lucide-react';
import type { TopPost } from '@/lib/data/summaries';

interface TrendingFeedProps {
  posts: TopPost[];
  title?: string;
}

export function TrendingFeed({ posts, title = "Trending Posts" }: TrendingFeedProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">No trending posts available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {posts.map((post, idx) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="flex gap-3 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            {/* Rank */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              {idx + 1}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 line-clamp-2 dark:text-white">
                {post.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2 dark:text-gray-400">
                {post.content_preview}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" />
                  {post.upvotes.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {post.comment_count.toLocaleString()}
                </span>
                <span>by {post.author}</span>
                <span className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">
                  m/{post.submolt}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="border-t border-gray-200 p-3 dark:border-gray-800">
        <Link
          href="/posts"
          className="block text-center text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
        >
          View all posts
        </Link>
      </div>
    </div>
  );
}
