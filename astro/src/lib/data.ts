import fs from 'fs/promises';
import path from 'path';

// Data directories - relative to project root
const DATA_DIR = path.join(process.cwd(), '..', 'moltbook_data', 'data');
const SUMMARIES_DIR = path.join(process.cwd(), '..', 'daily_summaries');

export interface Post {
  id: string;
  title: string;
  content: string;
  author: { name: string };
  submolt: { name: string };
  upvotes: number;
  comment_count: number;
  created_at: string;
}

export interface PostWithComments {
  post: Post;
  comments: unknown[];
}

export interface Agent {
  name: string;
  description?: string;
  karma?: number;
  follower_count?: number;
  created_at?: string;
}

export interface AgentProfile {
  agent: Agent;
}

export interface Submolt {
  name: string;
  display_name?: string;
  description?: string;
  subscriber_count?: number;
}

export interface SubmoltDetails {
  submolt: Submolt;
}

export interface DailySummary {
  date: string;
  total_posts: number;
  new_posts: number;
  total_comments: number;
  active_agents_count: number;
  active_submolts_count: number;
  top_posts: Array<{
    id: string;
    title: string;
    author: string;
    submolt: string;
    upvotes: number;
    comment_count: number;
    content_preview: string;
  }>;
  trending_submolts: Array<{ name: string; post_count: number }>;
  notable_agents: Array<{ name: string; post_count: number }>;
}

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function listJsonFiles(dir: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dir);
    return files.filter(f => f.endsWith('.json') && f !== 'index.json');
  } catch {
    return [];
  }
}

// Posts
export async function getPost(id: string): Promise<PostWithComments | null> {
  return readJson(path.join(DATA_DIR, 'posts', `${id}.json`));
}

export async function getRecentPosts(limit = 20): Promise<PostWithComments[]> {
  const files = await listJsonFiles(path.join(DATA_DIR, 'posts'));
  const posts = await Promise.all(
    files.slice(0, limit).map(f => getPost(f.replace('.json', '')))
  );
  return posts.filter((p): p is PostWithComments => p !== null);
}

export async function getTopPosts(limit = 10): Promise<PostWithComments[]> {
  const posts = await getRecentPosts(100);
  return posts
    .sort((a, b) => b.post.upvotes - a.post.upvotes)
    .slice(0, limit);
}

// Agents
export async function getAgent(name: string): Promise<AgentProfile | null> {
  const safeName = name.replace(/[<>:"/\\|?*]/g, '_');
  return readJson(path.join(DATA_DIR, 'agents', `${safeName}.json`));
}

export async function getAgents(limit = 50): Promise<AgentProfile[]> {
  const files = await listJsonFiles(path.join(DATA_DIR, 'agents'));
  const agents = await Promise.all(
    files.slice(0, limit).map(f => getAgent(f.replace('.json', '')))
  );
  return agents
    .filter((a): a is AgentProfile => a !== null && !!a.agent?.name)
    .sort((a, b) => (b.agent.karma ?? 0) - (a.agent.karma ?? 0));
}

// Submolts
export async function getSubmolt(name: string): Promise<SubmoltDetails | null> {
  const safeName = name.replace(/[<>:"/\\|?*]/g, '_');
  return readJson(path.join(DATA_DIR, 'submolts', `${safeName}.json`));
}

export async function getSubmolts(limit = 50): Promise<SubmoltDetails[]> {
  const files = await listJsonFiles(path.join(DATA_DIR, 'submolts'));
  const submolts = await Promise.all(
    files.slice(0, limit).map(f => getSubmolt(f.replace('.json', '')))
  );
  return submolts
    .filter((s): s is SubmoltDetails => s !== null && !!s.submolt?.name)
    .sort((a, b) => (b.submolt.subscriber_count ?? 0) - (a.submolt.subscriber_count ?? 0));
}

// Summaries
export async function getLatestSummary(): Promise<DailySummary | null> {
  const files = await listJsonFiles(SUMMARIES_DIR);
  if (files.length === 0) return null;
  const sorted = files.sort((a, b) => b.localeCompare(a));
  return readJson(path.join(SUMMARIES_DIR, sorted[0]));
}

export async function getSummary(date: string): Promise<DailySummary | null> {
  return readJson(path.join(SUMMARIES_DIR, `${date}.json`));
}

export async function listSummaryDates(): Promise<string[]> {
  const files = await listJsonFiles(SUMMARIES_DIR);
  return files.map(f => f.replace('.json', '')).sort((a, b) => b.localeCompare(a));
}

// Stats
export async function getStats() {
  const [posts, agents, submolts] = await Promise.all([
    listJsonFiles(path.join(DATA_DIR, 'posts')),
    listJsonFiles(path.join(DATA_DIR, 'agents')),
    listJsonFiles(path.join(DATA_DIR, 'submolts')),
  ]);
  return {
    totalPosts: posts.length,
    totalAgents: agents.length,
    totalSubmolts: submolts.length,
  };
}