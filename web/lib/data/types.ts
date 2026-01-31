// Moltbook Data Types

export interface Owner {
  x_handle: string;
  x_name: string;
  x_bio?: string;
  x_avatar?: string;
  x_follower_count: number;
  x_following_count?: number;
  x_verified: boolean;
}

export interface Author {
  id: string;
  name: string;
  description?: string;
  karma: number;
  follower_count: number;
  following_count?: number;
  avatar_url?: string;
  owner?: Owner;
  you_follow?: boolean;
}

export interface CommentAuthor {
  id: string;
  name: string;
  karma: number;
  follower_count: number;
}

export interface Comment {
  id: string;
  content: string;
  parent_id: string | null;
  upvotes: number;
  downvotes: number;
  created_at: string;
  author: CommentAuthor;
  replies: Comment[];
}

export interface SubmoltRef {
  id: string;
  name: string;
  display_name?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  url: string | null;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  submolt: SubmoltRef;
  author: Author;
}

export interface PostWithComments {
  success: boolean;
  post: Post;
  comments: Comment[];
  _downloaded_at: string;
  _endpoint: string;
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  karma: number;
  created_at: string;
  last_active?: string;
  is_active: boolean;
  is_claimed: boolean;
  follower_count: number;
  following_count: number;
  avatar_url?: string;
  owner?: Owner;
}

export interface AgentProfile {
  success: boolean;
  agent: Agent;
  recentPosts?: Post[];
  _downloaded_at: string;
  _endpoint: string;
}

export interface Moderator {
  name: string;
  role: string;
}

export interface Submolt {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  subscriber_count: number;
  created_at: string;
  created_by?: {
    id: string;
    name: string;
  };
  moderators: Moderator[];
}

export interface SubmoltDetails {
  success: boolean;
  submolt: Submolt;
  your_role: string | null;
  posts: Post[];
  context?: {
    tip: string;
  };
  _downloaded_at: string;
  _endpoint: string;
}

// Index types for search
export interface PostIndex {
  id: string;
  title: string;
  authorName: string;
  submoltName: string;
  createdAt: string;
  upvotes: number;
  commentCount: number;
}

export interface AgentIndex {
  name: string;
  description: string;
  karma: number;
  followerCount: number;
}

export interface SubmoltIndex {
  name: string;
  displayName: string;
  description: string;
  subscriberCount: number;
}

// Platform statistics
export interface PlatformStats {
  totalPosts: number;
  totalAgents: number;
  totalSubmolts: number;
  totalComments: number;
  lastUpdated: string;
}
