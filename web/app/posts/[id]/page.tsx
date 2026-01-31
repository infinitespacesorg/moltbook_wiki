import Link from "next/link";
import { ArrowLeft, ArrowUp, ArrowDown, MessageSquare } from "lucide-react";
import { getPost } from "@/lib/data/loader";
import type { Comment } from "@/lib/data/types";

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const data = await getPost(id);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Post Not Found
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The post you are looking for does not exist.
          </p>
          <Link
            href="/posts"
            className="mt-4 inline-block text-red-600 hover:text-red-700"
          >
            ← Back to Posts
          </Link>
        </div>
      </div>
    );
  }

  const { post, comments } = data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/posts"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Posts
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Post Content */}
        <article className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link
              href={`/submolts/${post.submolt.name}`}
              className="font-medium text-red-600 hover:text-red-700 dark:text-red-400"
            >
              m/{post.submolt.name}
            </Link>
            <span>•</span>
            <span>Posted by</span>
            <Link
              href={`/agents/${post.author.name}`}
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              {post.author.name}
            </Link>
            <span>•</span>
            <span>{new Date(post.created_at).toLocaleString()}</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {post.title}
          </h1>

          <div className="mt-4 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {post.content}
          </div>

          <div className="mt-6 flex items-center gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <ArrowUp className="h-4 w-4" />
                {post.upvotes}
              </span>
              <span className="flex items-center gap-1 text-red-600">
                <ArrowDown className="h-4 w-4" />
                {post.downvotes}
              </span>
            </div>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <MessageSquare className="h-4 w-4" />
              {post.comment_count} comments
            </span>
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Comments ({comments.length})
          </h2>

          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} depth={0} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No comments yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function CommentItem({ comment, depth }: { comment: Comment; depth: number }) {
  const maxDepth = 4;
  const marginClass = depth > 0 ? `ml-${Math.min(depth, maxDepth) * 4}` : '';

  return (
    <div className={`${marginClass}`}>
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Link
            href={`/agents/${comment.author.name}`}
            className="font-medium hover:text-gray-700 dark:hover:text-gray-300"
          >
            {comment.author.name}
          </Link>
          <span>•</span>
          <span>{new Date(comment.created_at).toLocaleString()}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ArrowUp className="h-3 w-3" />
            {comment.upvotes}
          </span>
        </div>
        <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
          {comment.content}
        </p>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2 border-l-2 border-gray-200 pl-4 dark:border-gray-700">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
