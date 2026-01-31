import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '..', 'moltbook_data', 'data');

interface SearchParams {
  query: string;
  type?: 'posts' | 'agents' | 'submolts' | 'all';
  limit?: number;
}

async function searchPosts(query: string, limit: number = 20) {
  const postsDir = path.join(DATA_DIR, 'posts');
  const results: Array<{
    id: string;
    title: string;
    content: string;
    author: string;
    submolt: string;
    upvotes: number;
    comment_count: number;
    created_at: string;
  }> = [];

  try {
    const files = await fs.readdir(postsDir);
    const queryLower = query.toLowerCase();

    for (const file of files.slice(0, 2000)) {
      if (!file.endsWith('.json')) continue;

      try {
        const content = await fs.readFile(path.join(postsDir, file), 'utf-8');
        const data = JSON.parse(content);
        const post = data.post;

        if (!post) continue;

        const titleMatch = post.title?.toLowerCase().includes(queryLower);
        const contentMatch = post.content?.toLowerCase().includes(queryLower);
        const authorMatch = post.author?.name?.toLowerCase().includes(queryLower);
        const submoltMatch = post.submolt?.name?.toLowerCase().includes(queryLower);

        if (titleMatch || contentMatch || authorMatch || submoltMatch) {
          results.push({
            id: post.id,
            title: post.title || 'Untitled',
            content: post.content?.slice(0, 300) || '',
            author: post.author?.name || 'Unknown',
            submolt: post.submolt?.name || 'general',
            upvotes: post.upvotes || 0,
            comment_count: post.comment_count || 0,
            created_at: post.created_at || '',
          });

          if (results.length >= limit) break;
        }
      } catch {
        // Skip invalid files
      }
    }
  } catch (error) {
    console.error('Error searching posts:', error);
  }

  return results.sort((a, b) => b.upvotes - a.upvotes);
}

async function searchAgents(query: string, limit: number = 20) {
  const agentsDir = path.join(DATA_DIR, 'agents');
  const results: Array<{
    name: string;
    description: string;
    karma: number;
    follower_count: number;
    created_at: string;
  }> = [];

  try {
    const files = await fs.readdir(agentsDir);
    const queryLower = query.toLowerCase();

    for (const file of files.slice(0, 1000)) {
      if (!file.endsWith('.json') || file === 'index.json') continue;

      try {
        const content = await fs.readFile(path.join(agentsDir, file), 'utf-8');
        const data = JSON.parse(content);
        const agent = data.agent;

        if (!agent) continue;

        const nameMatch = agent.name?.toLowerCase().includes(queryLower);
        const descMatch = agent.description?.toLowerCase().includes(queryLower);

        if (nameMatch || descMatch) {
          results.push({
            name: agent.name || 'Unknown',
            description: agent.description || '',
            karma: agent.karma || 0,
            follower_count: agent.follower_count || 0,
            created_at: agent.created_at || '',
          });

          if (results.length >= limit) break;
        }
      } catch {
        // Skip invalid files
      }
    }
  } catch (error) {
    console.error('Error searching agents:', error);
  }

  return results.sort((a, b) => b.karma - a.karma);
}

async function searchSubmolts(query: string, limit: number = 20) {
  const submoltsDir = path.join(DATA_DIR, 'submolts');
  const results: Array<{
    name: string;
    display_name: string;
    description: string;
    subscriber_count: number;
  }> = [];

  try {
    const files = await fs.readdir(submoltsDir);
    const queryLower = query.toLowerCase();

    for (const file of files.slice(0, 500)) {
      if (!file.endsWith('.json') || file === 'index.json') continue;

      try {
        const content = await fs.readFile(path.join(submoltsDir, file), 'utf-8');
        const data = JSON.parse(content);
        const submolt = data.submolt;

        if (!submolt) continue;

        const nameMatch = submolt.name?.toLowerCase().includes(queryLower);
        const displayMatch = submolt.display_name?.toLowerCase().includes(queryLower);
        const descMatch = submolt.description?.toLowerCase().includes(queryLower);

        if (nameMatch || displayMatch || descMatch) {
          results.push({
            name: submolt.name || 'Unknown',
            display_name: submolt.display_name || submolt.name || 'Unknown',
            description: submolt.description || '',
            subscriber_count: submolt.subscriber_count || 0,
          });

          if (results.length >= limit) break;
        }
      } catch {
        // Skip invalid files
      }
    }
  } catch (error) {
    console.error('Error searching submolts:', error);
  }

  return results.sort((a, b) => b.subscriber_count - a.subscriber_count);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') as SearchParams['type'] || 'all';
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  const results: {
    posts?: Awaited<ReturnType<typeof searchPosts>>;
    agents?: Awaited<ReturnType<typeof searchAgents>>;
    submolts?: Awaited<ReturnType<typeof searchSubmolts>>;
  } = {};

  if (type === 'all' || type === 'posts') {
    results.posts = await searchPosts(query, limit);
  }
  if (type === 'all' || type === 'agents') {
    results.agents = await searchAgents(query, limit);
  }
  if (type === 'all' || type === 'submolts') {
    results.submolts = await searchSubmolts(query, limit);
  }

  return NextResponse.json(results);
}
