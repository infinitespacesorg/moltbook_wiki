import lunr from 'lunr';
import type { PostIndex, AgentIndex, SubmoltIndex } from './types';

// Global search indexes (built once)
let postSearchIndex: lunr.Index | null = null;
let agentSearchIndex: lunr.Index | null = null;
let submoltSearchIndex: lunr.Index | null = null;

// Data stores for retrieval after search
let postStore: Map<string, PostIndex> = new Map();
let agentStore: Map<string, AgentIndex> = new Map();
let submoltStore: Map<string, SubmoltIndex> = new Map();

/**
 * Initialize search indexes with data
 */
export function initializeSearchIndexes(data: {
  posts: PostIndex[];
  agents: AgentIndex[];
  submolts: SubmoltIndex[];
}): void {
  // Build post index
  postSearchIndex = lunr(function() {
    this.ref('id');
    this.field('title', { boost: 10 });
    this.field('authorName', { boost: 5 });
    this.field('submoltName', { boost: 3 });

    data.posts.forEach(post => {
      this.add(post);
      postStore.set(post.id, post);
    });
  });

  // Build agent index
  agentSearchIndex = lunr(function() {
    this.ref('name');
    this.field('name', { boost: 10 });
    this.field('description', { boost: 5 });

    data.agents.forEach(agent => {
      this.add(agent);
      agentStore.set(agent.name, agent);
    });
  });

  // Build submolt index
  submoltSearchIndex = lunr(function() {
    this.ref('name');
    this.field('name', { boost: 10 });
    this.field('displayName', { boost: 8 });
    this.field('description', { boost: 5 });

    data.submolts.forEach(submolt => {
      this.add(submolt);
      submoltStore.set(submolt.name, submolt);
    });
  });
}

/**
 * Search posts
 */
export function searchPosts(query: string, limit: number = 20): PostIndex[] {
  if (!postSearchIndex || !query.trim()) {
    return [];
  }

  try {
    const results = postSearchIndex.search(query);
    return results
      .slice(0, limit)
      .map(result => postStore.get(result.ref))
      .filter((p): p is PostIndex => p !== undefined);
  } catch (error) {
    console.error('Post search error:', error);
    return [];
  }
}

/**
 * Search agents
 */
export function searchAgents(query: string, limit: number = 20): AgentIndex[] {
  if (!agentSearchIndex || !query.trim()) {
    return [];
  }

  try {
    const results = agentSearchIndex.search(query);
    return results
      .slice(0, limit)
      .map(result => agentStore.get(result.ref))
      .filter((a): a is AgentIndex => a !== undefined);
  } catch (error) {
    console.error('Agent search error:', error);
    return [];
  }
}

/**
 * Search submolts
 */
export function searchSubmolts(query: string, limit: number = 20): SubmoltIndex[] {
  if (!submoltSearchIndex || !query.trim()) {
    return [];
  }

  try {
    const results = submoltSearchIndex.search(query);
    return results
      .slice(0, limit)
      .map(result => submoltStore.get(result.ref))
      .filter((s): s is SubmoltIndex => s !== undefined);
  } catch (error) {
    console.error('Submolt search error:', error);
    return [];
  }
}

/**
 * Search across all content types
 */
export function searchAll(
  query: string,
  limits: { posts?: number; agents?: number; submolts?: number } = {}
): {
  posts: PostIndex[];
  agents: AgentIndex[];
  submolts: SubmoltIndex[];
} {
  return {
    posts: searchPosts(query, limits.posts ?? 10),
    agents: searchAgents(query, limits.agents ?? 5),
    submolts: searchSubmolts(query, limits.submolts ?? 5),
  };
}

/**
 * Check if indexes are initialized
 */
export function areIndexesInitialized(): boolean {
  return postSearchIndex !== null && 
         agentSearchIndex !== null && 
         submoltSearchIndex !== null;
}

/**
 * Get index statistics
 */
export function getIndexStats(): { posts: number; agents: number; submolts: number } {
  return {
    posts: postStore.size,
    agents: agentStore.size,
    submolts: submoltStore.size,
  };
}
