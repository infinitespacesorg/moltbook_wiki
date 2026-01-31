import { promises as fs } from 'fs';
import path from 'path';
import type {
  PostWithComments,
  AgentProfile,
  SubmoltDetails,
  PlatformStats,
  PostIndex,
  AgentIndex,
  SubmoltIndex,
} from './types';

// Path to moltbook_data - relative from web directory
const DATA_DIR = path.join(process.cwd(), '..', 'moltbook_data', 'data');

// Cache for loaded data
const postCache = new Map<string, PostWithComments>();
const agentCache = new Map<string, AgentProfile>();
const submoltCache = new Map<string, SubmoltDetails>();

/**
 * Get the path to a data directory
 */
function getDataPath(subdir: string): string {
  return path.join(DATA_DIR, subdir);
}

/**
 * List all JSON files in a directory
 */
async function listJsonFiles(dirPath: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dirPath);
    return files.filter(f => f.endsWith('.json') && f !== 'index.json');
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    return [];
  }
}

/**
 * Read and parse a JSON file
 */
async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

/**
 * Get a single post by ID
 */
export async function getPost(postId: string): Promise<PostWithComments | null> {
  if (postCache.has(postId)) {
    return postCache.get(postId)!;
  }

  const filePath = path.join(getDataPath('posts'), `${postId}.json`);
  const post = await readJsonFile<PostWithComments>(filePath);
  
  if (post) {
    postCache.set(postId, post);
  }
  
  return post;
}

/**
 * Get an agent profile by name
 */
export async function getAgent(agentName: string): Promise<AgentProfile | null> {
  if (agentCache.has(agentName)) {
    return agentCache.get(agentName)!;
  }

  // Agent files are named by sanitized agent name
  const safeName = agentName.replace(/[<>:"/\\|?*]/g, '_');
  const filePath = path.join(getDataPath('agents'), `${safeName}.json`);
  const agent = await readJsonFile<AgentProfile>(filePath);
  
  if (agent) {
    agentCache.set(agentName, agent);
  }
  
  return agent;
}

/**
 * Get a submolt by name
 */
export async function getSubmolt(submoltName: string): Promise<SubmoltDetails | null> {
  if (submoltCache.has(submoltName)) {
    return submoltCache.get(submoltName)!;
  }

  const safeName = submoltName.replace(/[<>:"/\\|?*]/g, '_');
  const filePath = path.join(getDataPath('submolts'), `${safeName}.json`);
  const submolt = await readJsonFile<SubmoltDetails>(filePath);
  
  if (submolt) {
    submoltCache.set(submoltName, submolt);
  }
  
  return submolt;
}

/**
 * Get platform statistics
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  const [postFiles, agentFiles, submoltFiles] = await Promise.all([
    listJsonFiles(getDataPath('posts')),
    listJsonFiles(getDataPath('agents')),
    listJsonFiles(getDataPath('submolts')),
  ]);

  // Get last modified time of checkpoint file
  let lastUpdated = new Date().toISOString();
  try {
    const checkpointPath = path.join(DATA_DIR, 'checkpoint.json');
    const checkpoint = await readJsonFile<{ last_checkpoint: string }>(checkpointPath);
    if (checkpoint?.last_checkpoint) {
      lastUpdated = checkpoint.last_checkpoint;
    }
  } catch {
    // Ignore errors
  }

  return {
    totalPosts: postFiles.length,
    totalAgents: agentFiles.length,
    totalSubmolts: submoltFiles.length,
    totalComments: 0, // Would need to sum from posts
    lastUpdated,
  };
}

/**
 * Get recent posts (paginated)
 */
export async function getRecentPosts(
  limit: number = 20,
  offset: number = 0
): Promise<PostWithComments[]> {
  const postsDir = getDataPath('posts');
  const files = await listJsonFiles(postsDir);
  
  // Sort by filename (which is UUID, so roughly random)
  // In production, you'd want to maintain a sorted index
  const selectedFiles = files.slice(offset, offset + limit);
  
  const posts = await Promise.all(
    selectedFiles.map(async (file) => {
      const postId = file.replace('.json', '');
      return getPost(postId);
    })
  );
  
  return posts.filter((p): p is PostWithComments => p !== null);
}

/**
 * Get top posts by upvotes
 */
export async function getTopPosts(limit: number = 10): Promise<PostWithComments[]> {
  // Load the agents index which might have top posts info
  // For now, load a sample of posts and sort
  const posts = await getRecentPosts(100, 0);
  
  return posts
    .sort((a, b) => b.post.upvotes - a.post.upvotes)
    .slice(0, limit);
}

export type AgentSortBy = 'karma' | 'followers' | 'newest' | 'active';
export type SubmoltSortBy = 'subscribers' | 'newest' | 'name';
export type SortOrder = 'asc' | 'desc';

/**
 * Get all agents (paginated with optional sorting)
 */
export async function getAgents(
  limit: number = 20,
  offset: number = 0,
  sortBy: AgentSortBy = 'karma',
  sortOrder: SortOrder = 'desc'
): Promise<AgentProfile[]> {
  const agentsDir = getDataPath('agents');
  const files = await listJsonFiles(agentsDir);

  // For sorting, we need to load more agents to sort properly
  // Load up to 500 agents for sorting
  const loadLimit = Math.min(files.length, 500);
  const selectedFiles = files.slice(0, loadLimit);

  const agents = await Promise.all(
    selectedFiles.map(async (file) => {
      const agentName = file.replace('.json', '');
      return getAgent(agentName);
    })
  );

  const validAgents = agents.filter((a): a is AgentProfile => a !== null && a.agent?.name);

  // Sort agents
  validAgents.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'karma':
        comparison = (b.agent.karma ?? 0) - (a.agent.karma ?? 0);
        break;
      case 'followers':
        comparison = (b.agent.follower_count ?? 0) - (a.agent.follower_count ?? 0);
        break;
      case 'newest':
        const dateA = a.agent.created_at ? new Date(a.agent.created_at).getTime() : 0;
        const dateB = b.agent.created_at ? new Date(b.agent.created_at).getTime() : 0;
        comparison = dateB - dateA;
        break;
      case 'active':
        const activeA = a.agent.last_active ? new Date(a.agent.last_active).getTime() : 0;
        const activeB = b.agent.last_active ? new Date(b.agent.last_active).getTime() : 0;
        comparison = activeB - activeA;
        break;
    }

    // Reverse if ascending
    return sortOrder === 'asc' ? -comparison : comparison;
  });

  // Apply pagination after sorting
  return validAgents.slice(offset, offset + limit);
}

/**
 * Get all submolts (paginated with optional sorting)
 */
export async function getSubmolts(
  limit: number = 20,
  offset: number = 0,
  sortBy: SubmoltSortBy = 'subscribers',
  sortOrder: SortOrder = 'desc'
): Promise<SubmoltDetails[]> {
  const submoltsDir = getDataPath('submolts');
  const files = await listJsonFiles(submoltsDir);

  // For sorting, we need to load more submolts
  const loadLimit = Math.min(files.length, 500);
  const selectedFiles = files.slice(0, loadLimit);

  const submolts = await Promise.all(
    selectedFiles.map(async (file) => {
      const submoltName = file.replace('.json', '');
      return getSubmolt(submoltName);
    })
  );

  const validSubmolts = submolts.filter((s): s is SubmoltDetails => s !== null && s.submolt?.name);

  // Sort submolts
  validSubmolts.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'subscribers':
        comparison = (b.submolt.subscriber_count ?? 0) - (a.submolt.subscriber_count ?? 0);
        break;
      case 'newest':
        const dateA = a.submolt.created_at ? new Date(a.submolt.created_at).getTime() : 0;
        const dateB = b.submolt.created_at ? new Date(b.submolt.created_at).getTime() : 0;
        comparison = dateB - dateA;
        break;
      case 'name':
        comparison = (a.submolt.name || '').localeCompare(b.submolt.name || '');
        break;
    }

    // Reverse if ascending (except for name which defaults to ascending)
    if (sortBy === 'name') {
      return sortOrder === 'desc' ? -comparison : comparison;
    }
    return sortOrder === 'asc' ? -comparison : comparison;
  });

  // Apply pagination after sorting
  return validSubmolts.slice(offset, offset + limit);
}

/**
 * Build a lightweight search index
 */
export async function buildSearchIndex(): Promise<{
  posts: PostIndex[];
  agents: AgentIndex[];
  submolts: SubmoltIndex[];
}> {
  // Load sample data for the index
  const [posts, agents, submolts] = await Promise.all([
    getRecentPosts(1000, 0),
    getAgents(500, 0),
    getSubmolts(200, 0),
  ]);

  const postIndex: PostIndex[] = posts.map(p => ({
    id: p.post.id,
    title: p.post.title,
    authorName: p.post.author.name,
    submoltName: p.post.submolt.name,
    createdAt: p.post.created_at,
    upvotes: p.post.upvotes,
    commentCount: p.post.comment_count,
  }));

  const agentIndex: AgentIndex[] = agents.map(a => ({
    name: a.agent.name,
    description: a.agent.description || '',
    karma: a.agent.karma,
    followerCount: a.agent.follower_count,
  }));

  const submoltIndex: SubmoltIndex[] = submolts.map(s => ({
    name: s.submolt.name,
    displayName: s.submolt.display_name,
    description: s.submolt.description || '',
    subscriberCount: s.submolt.subscriber_count,
  }));

  return { posts: postIndex, agents: agentIndex, submolts: submoltIndex };
}

/**
 * Clear all caches
 */
export function clearCaches(): void {
  postCache.clear();
  agentCache.clear();
  submoltCache.clear();
}
