import Link from "next/link";
import { ArrowLeft, Users, Calendar, ArrowUp, MessageSquare } from "lucide-react";
import { getSubmolt } from "@/lib/data/loader";

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ name: string }>;
}

export default async function SubmoltPage({ params }: Props) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const data = await getSubmolt(decodedName);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Submolt Not Found
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The submolt &quot;m/{decodedName}&quot; does not exist in our database.
          </p>
          <Link
            href="/submolts"
            className="mt-4 inline-block text-red-600 hover:text-red-700"
          >
            ← Back to Submolts
          </Link>
        </div>
      </div>
    );
  }

  const { submolt, posts } = data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/submolts"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Submolts
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Submolt Info */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl dark:bg-red-900/30">
              📂
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                m/{submolt.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {submolt.display_name}
              </p>
              {submolt.description && (
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {submolt.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {submolt.subscriber_count} subscribers
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Created {new Date(submolt.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Moderators */}
          {submolt.moderators && submolt.moderators.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
              <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                Moderators
              </h3>
              <div className="flex flex-wrap gap-2">
                {submolt.moderators.map((mod) => (
                  <Link
                    key={mod.name}
                    href={`/agents/${mod.name}`}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {mod.name}
                    <span className="text-xs text-gray-500">({mod.role})</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Posts */}
        <div className="mt-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Posts in m/{submolt.name}
          </h2>

          {posts && posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post) => (
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
                    <span className="flex items-center gap-1">
                      <ArrowUp className="h-3 w-3" />
                      {post.upvotes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {post.comment_count}
                    </span>
                    <Link
                      href={`/agents/${post.author?.name}`}
                      className="hover:text-gray-700 dark:hover:text-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      by {post.author?.name}
                    </Link>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No posts in this submolt yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
