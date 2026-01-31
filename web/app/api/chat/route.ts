import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { promises as fs } from 'fs';
import path from 'path';

const anthropic = new Anthropic();
const DATA_DIR = path.join(process.cwd(), '..', 'moltbook_data', 'data');

// Tool definitions
const tools: Anthropic.Tool[] = [
  {
    name: 'search_posts',
    description: 'Search for posts on Moltbook by keyword. Returns matching posts with title, content preview, author, submolt, and engagement metrics.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query to find posts (searches titles, content, authors, submolts)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default 10)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_agents',
    description: 'Search for AI agents on Moltbook by name or description.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query to find agents',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default 10)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_submolts',
    description: 'Search for submolts (communities) on Moltbook.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query to find submolts',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default 10)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_post',
    description: 'Get the full details of a specific post including all comments. Use this when you need to see the complete conversation.',
    input_schema: {
      type: 'object' as const,
      properties: {
        post_id: {
          type: 'string',
          description: 'The UUID of the post to retrieve',
        },
      },
      required: ['post_id'],
    },
  },
  {
    name: 'get_agent',
    description: 'Get the full profile of a specific agent including their recent posts.',
    input_schema: {
      type: 'object' as const,
      properties: {
        agent_name: {
          type: 'string',
          description: 'The name of the agent to retrieve',
        },
      },
      required: ['agent_name'],
    },
  },
  {
    name: 'get_top_posts',
    description: 'Get the top posts from Moltbook sorted by upvotes. Optionally filter by submolt.',
    input_schema: {
      type: 'object' as const,
      properties: {
        submolt: {
          type: 'string',
          description: 'Optional: filter to a specific submolt',
        },
        limit: {
          type: 'number',
          description: 'Number of posts to return (default 10)',
        },
      },
      required: [],
    },
  },
  {
    name: 'save_suggestion',
    description: 'Save a user suggestion or feature request for the Moltbook Wiki. Use this when a user shares feedback, ideas, or suggestions for improving the site.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: {
          type: 'string',
          description: 'A short title summarizing the suggestion',
        },
        description: {
          type: 'string',
          description: 'Detailed description of the suggestion or feature request',
        },
        category: {
          type: 'string',
          enum: ['feature', 'content', 'design', 'data', 'other'],
          description: 'Category of the suggestion: feature (new functionality), content (wiki content ideas), design (UI/UX improvements), data (data source ideas), other',
        },
      },
      required: ['title', 'description', 'category'],
    },
  },
];

// Tool implementations
async function searchPosts(query: string, limit: number = 10): Promise<string> {
  const postsDir = path.join(DATA_DIR, 'posts');
  const results: Array<Record<string, unknown>> = [];

  try {
    const files = await fs.readdir(postsDir);
    const queryLower = query.toLowerCase();

    for (const file of files.slice(0, 3000)) {
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
            url: `/posts/${post.id}`,
            content_preview: post.content?.slice(0, 200) + '...' || '',
            author: post.author?.name || 'Unknown',
            author_url: post.author?.name ? `/agents/${encodeURIComponent(post.author.name)}` : null,
            submolt: post.submolt?.name || 'general',
            submolt_url: post.submolt?.name ? `/submolts/${encodeURIComponent(post.submolt.name)}` : null,
            upvotes: post.upvotes || 0,
            comment_count: post.comment_count || 0,
          });

          if (results.length >= limit) break;
        }
      } catch {
        // Skip
      }
    }
  } catch (error) {
    return JSON.stringify({ error: 'Failed to search posts', details: String(error) });
  }

  results.sort((a, b) => (b.upvotes as number) - (a.upvotes as number));
  return JSON.stringify({ count: results.length, posts: results });
}

async function searchAgents(query: string, limit: number = 10): Promise<string> {
  const agentsDir = path.join(DATA_DIR, 'agents');
  const results: Array<Record<string, unknown>> = [];

  try {
    const files = await fs.readdir(agentsDir);
    const queryLower = query.toLowerCase();

    for (const file of files.slice(0, 1000)) {
      if (!file.endsWith('.json') || file === 'index.json') continue;

      try {
        const content = await fs.readFile(path.join(agentsDir, file), 'utf-8');
        const data = JSON.parse(content);
        const agent = data.agent;

        if (!agent?.name) continue;

        const nameMatch = agent.name?.toLowerCase().includes(queryLower);
        const descMatch = agent.description?.toLowerCase().includes(queryLower);

        if (nameMatch || descMatch) {
          results.push({
            name: agent.name,
            url: `/agents/${encodeURIComponent(agent.name)}`,
            description: agent.description || 'No description',
            karma: agent.karma || 0,
            follower_count: agent.follower_count || 0,
          });

          if (results.length >= limit) break;
        }
      } catch {
        // Skip
      }
    }
  } catch (error) {
    return JSON.stringify({ error: 'Failed to search agents', details: String(error) });
  }

  results.sort((a, b) => (b.karma as number) - (a.karma as number));
  return JSON.stringify({ count: results.length, agents: results });
}

async function searchSubmolts(query: string, limit: number = 10): Promise<string> {
  const submoltsDir = path.join(DATA_DIR, 'submolts');
  const results: Array<Record<string, unknown>> = [];

  try {
    const files = await fs.readdir(submoltsDir);
    const queryLower = query.toLowerCase();

    for (const file of files.slice(0, 500)) {
      if (!file.endsWith('.json') || file === 'index.json') continue;

      try {
        const content = await fs.readFile(path.join(submoltsDir, file), 'utf-8');
        const data = JSON.parse(content);
        const submolt = data.submolt;

        if (!submolt?.name) continue;

        const nameMatch = submolt.name?.toLowerCase().includes(queryLower);
        const displayMatch = submolt.display_name?.toLowerCase().includes(queryLower);
        const descMatch = submolt.description?.toLowerCase().includes(queryLower);

        if (nameMatch || displayMatch || descMatch) {
          results.push({
            name: submolt.name,
            url: `/submolts/${encodeURIComponent(submolt.name)}`,
            display_name: submolt.display_name || submolt.name,
            description: submolt.description || '',
            subscriber_count: submolt.subscriber_count || 0,
          });

          if (results.length >= limit) break;
        }
      } catch {
        // Skip
      }
    }
  } catch (error) {
    return JSON.stringify({ error: 'Failed to search submolts', details: String(error) });
  }

  results.sort((a, b) => (b.subscriber_count as number) - (a.subscriber_count as number));
  return JSON.stringify({ count: results.length, submolts: results });
}

async function getPost(postId: string): Promise<string> {
  try {
    const filePath = path.join(DATA_DIR, 'posts', `${postId}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    // Format the response nicely
    const post = data.post;
    const comments = data.comments || [];

    const formatted = {
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.author?.name,
        submolt: post.submolt?.name,
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        comment_count: post.comment_count,
        created_at: post.created_at,
      },
      comments: comments.slice(0, 20).map((c: Record<string, unknown>) => ({
        author: (c.author as Record<string, unknown>)?.name,
        content: c.content,
        upvotes: c.upvotes,
        created_at: c.created_at,
      })),
      total_comments: comments.length,
    };

    return JSON.stringify(formatted, null, 2);
  } catch {
    return JSON.stringify({ error: `Post not found: ${postId}` });
  }
}

async function getAgent(agentName: string): Promise<string> {
  try {
    const safeName = agentName.replace(/[<>:"/\\|?*]/g, '_');
    const filePath = path.join(DATA_DIR, 'agents', `${safeName}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    const agent = data.agent;
    const recentPosts = data.recentPosts || [];

    const formatted = {
      agent: {
        name: agent.name,
        description: agent.description,
        karma: agent.karma,
        follower_count: agent.follower_count,
        following_count: agent.following_count,
        created_at: agent.created_at,
        is_active: agent.is_active,
      },
      recent_posts: recentPosts.slice(0, 5).map((p: Record<string, unknown>) => ({
        title: p.title,
        submolt: (p.submolt as Record<string, unknown>)?.name,
        upvotes: p.upvotes,
        comment_count: p.comment_count,
      })),
    };

    return JSON.stringify(formatted, null, 2);
  } catch {
    return JSON.stringify({ error: `Agent not found: ${agentName}` });
  }
}

async function saveSuggestion(
  title: string,
  description: string,
  category: string
): Promise<string> {
  try {
    const suggestionsPath = path.join(process.cwd(), 'suggestions.json');
    let data = { suggestions: [] as Array<Record<string, unknown>> };

    try {
      const content = await fs.readFile(suggestionsPath, 'utf-8');
      data = JSON.parse(content);
    } catch {
      // File doesn't exist yet, use empty array
    }

    const newSuggestion = {
      id: `sug_${Date.now()}`,
      title,
      description,
      category,
      source: 'crawdaddy',
      status: 'new',
      created_at: new Date().toISOString(),
    };

    data.suggestions.push(newSuggestion);
    await fs.writeFile(suggestionsPath, JSON.stringify(data, null, 2));

    return JSON.stringify({
      success: true,
      message: 'Suggestion saved successfully!',
      suggestion: newSuggestion,
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: 'Failed to save suggestion',
      details: String(error),
    });
  }
}

async function getTopPosts(submolt?: string, limit: number = 10): Promise<string> {
  const postsDir = path.join(DATA_DIR, 'posts');
  const results: Array<Record<string, unknown>> = [];

  try {
    const files = await fs.readdir(postsDir);

    for (const file of files.slice(0, 5000)) {
      if (!file.endsWith('.json')) continue;

      try {
        const content = await fs.readFile(path.join(postsDir, file), 'utf-8');
        const data = JSON.parse(content);
        const post = data.post;

        if (!post) continue;
        if (submolt && post.submolt?.name?.toLowerCase() !== submolt.toLowerCase()) continue;

        results.push({
          id: post.id,
          title: post.title || 'Untitled',
          url: `/posts/${post.id}`,
          author: post.author?.name || 'Unknown',
          author_url: post.author?.name ? `/agents/${encodeURIComponent(post.author.name)}` : null,
          submolt: post.submolt?.name || 'general',
          submolt_url: post.submolt?.name ? `/submolts/${encodeURIComponent(post.submolt.name)}` : null,
          upvotes: post.upvotes || 0,
          comment_count: post.comment_count || 0,
          content_preview: post.content?.slice(0, 150) + '...' || '',
        });
      } catch {
        // Skip
      }
    }
  } catch (error) {
    return JSON.stringify({ error: 'Failed to get top posts', details: String(error) });
  }

  results.sort((a, b) => (b.upvotes as number) - (a.upvotes as number));
  return JSON.stringify({ posts: results.slice(0, limit) });
}

// Execute a tool
async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'search_posts':
      return searchPosts(input.query as string, (input.limit as number) || 10);
    case 'search_agents':
      return searchAgents(input.query as string, (input.limit as number) || 10);
    case 'search_submolts':
      return searchSubmolts(input.query as string, (input.limit as number) || 10);
    case 'get_post':
      return getPost(input.post_id as string);
    case 'get_agent':
      return getAgent(input.agent_name as string);
    case 'get_top_posts':
      return getTopPosts(input.submolt as string | undefined, (input.limit as number) || 10);
    case 'save_suggestion':
      return saveSuggestion(
        input.title as string,
        input.description as string,
        input.category as string
      );
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

const SYSTEM_PROMPT = `You are Crawdaddy, the friendly and knowledgeable guide to Moltbook Wiki! You help visitors explore Moltbook - the social network exclusively for AI agents.

## Your Personality
- Friendly, warm, and approachable - like a helpful neighbor
- Knowledgeable but not stuffy - you explain things in accessible ways
- Occasionally playful with crawdad/crab themed expressions (but don't overdo it)
- Enthusiastic about helping people discover interesting content

## About Moltbook
- Launched January 2026 by Matt Schlicht
- 157,000+ active AI agents in the first week
- Humans can observe but not participate
- Communities are called "submolts" (like subreddits)
- Notable culture includes "Crustafarianism" (a parody religion)

## Your Capabilities
You have tools to search and retrieve data from Moltbook:
- search_posts: Find posts by keyword
- search_agents: Find agents by name/description
- search_submolts: Find communities
- get_post: Get full post with all comments
- get_agent: Get agent profile with recent posts
- get_top_posts: Get top posts by upvotes
- save_suggestion: Save user feedback and feature requests for the wiki

When users share ideas, feedback, or suggestions for improving the wiki, use save_suggestion to capture them. Categories are: feature, content, design, data, other. Thank them warmly and let them know their suggestion has been saved!

## Guidelines
- Use tools proactively to answer questions with real data
- IMPORTANT: When presenting results, always include clickable links using markdown format:
  - For posts: [Post Title](/posts/{id})
  - For agents: [{agent name}](/agents/{name})
  - For submolts: [m/{name}](/submolts/{name})
- Format results nicely for readability with bullet points or numbered lists
- If asked about a specific post or conversation, use get_post to fetch the full details
- Be concise but informative
- Start responses with friendly greetings occasionally, but not every time
- If you can't find something, suggest related searches or topics`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Build messages array with history
    const messages: Anthropic.MessageParam[] = [];

    if (history && Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        messages.push({ role: h.role, content: h.content });
      }
    }

    messages.push({ role: 'user', content: message });

    const toolCalls: Array<{ name: string; input: Record<string, unknown>; result?: string }> = [];

    // Initial request
    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });

    // Tool use loop
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        const result = await executeTool(toolUse.name, toolUse.input as Record<string, unknown>);
        toolCalls.push({
          name: toolUse.name,
          input: toolUse.input as Record<string, unknown>,
        });
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: result,
        });
      }

      // Continue conversation with tool results
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });

      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        tools,
        messages,
      });
    }

    // Extract final text response
    const textContent = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    );

    const responseText = textContent?.text || 'I could not generate a response.';

    return NextResponse.json({
      response: responseText,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    });
  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: 'AI service error', details: error.message },
        { status: 502 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
