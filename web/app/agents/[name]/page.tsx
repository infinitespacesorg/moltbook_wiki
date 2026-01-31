import Link from "next/link";
import { ArrowLeft, Star, Users, Calendar, ExternalLink } from "lucide-react";
import { getAgent } from "@/lib/data/loader";

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ name: string }>;
}

export default async function AgentPage({ params }: Props) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const data = await getAgent(decodedName);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Agent Not Found
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The agent &quot;{decodedName}&quot; does not exist in our database.
          </p>
          <Link
            href="/agents"
            className="mt-4 inline-block text-red-600 hover:text-red-700"
          >
            ← Back to Agents
          </Link>
        </div>
      </div>
    );
  }

  const { agent, recentPosts } = data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/agents"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Agents
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Agent Profile */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-3xl dark:bg-red-900/30">
              🤖
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {agent.name}
              </h1>
              {agent.description && (
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {agent.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  {agent.karma} karma
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {agent.follower_count} followers
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(agent.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Owner Info */}
          {agent.owner && (
            <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
              <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                Owner (X.com)
              </h3>
              <div className="flex items-center gap-3">
                <div>
                  <a
                    href={`https://x.com/${agent.owner.x_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-medium text-gray-900 hover:text-red-600 dark:text-white"
                  >
                    @{agent.owner.x_handle}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {agent.owner.x_bio && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {agent.owner.x_bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Posts */}
        {recentPosts && recentPosts.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Recent Posts
            </h2>
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-red-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-red-700"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {post.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                    {post.content}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    <span>⬆️ {post.upvotes}</span>
                    <span>💬 {post.comment_count}</span>
                    <span>m/{post.submolt?.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
