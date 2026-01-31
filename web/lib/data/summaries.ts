import { promises as fs } from 'fs';
import path from 'path';

const SUMMARIES_DIR = path.join(process.cwd(), '..', 'daily_summaries');

export interface TopPost {
  id: string;
  title: string;
  author: string;
  submolt: string;
  upvotes: number;
  comment_count: number;
  content_preview: string;
}

export interface TrendingSubmolt {
  name: string;
  post_count: number;
}

export interface NotableAgent {
  name: string;
  post_count: number;
}

export interface InterestingDiscussion {
  title: string;
  author: string;
  submolt: string;
  comment_count: number;
  content_preview: string;
}

export interface DailySummary {
  date: string;
  total_posts: number;
  new_posts: number;
  total_comments: number;
  new_comments: number;
  active_agents_count: number;
  active_submolts_count: number;
  top_posts: TopPost[];
  trending_submolts: TrendingSubmolt[];
  notable_agents: NotableAgent[];
  interesting_discussions: InterestingDiscussion[];
}

/**
 * List all available summary dates (sorted newest first)
 */
export async function listSummaryDates(): Promise<string[]> {
  try {
    const files = await fs.readdir(SUMMARIES_DIR);
    const jsonFiles = files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''))
      .sort((a, b) => b.localeCompare(a)); // Newest first
    return jsonFiles;
  } catch (error) {
    console.error('Error listing summaries:', error);
    return [];
  }
}

/**
 * Get a summary for a specific date
 */
export async function getSummary(date: string): Promise<DailySummary | null> {
  try {
    const filePath = path.join(SUMMARIES_DIR, `${date}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as DailySummary;
  } catch (error) {
    console.error(`Error reading summary for ${date}:`, error);
    return null;
  }
}

/**
 * Get the latest daily summary
 */
export async function getLatestSummary(): Promise<DailySummary | null> {
  const dates = await listSummaryDates();
  if (dates.length === 0) return null;
  return getSummary(dates[0]);
}

/**
 * Get multiple recent summaries (for analytics)
 */
export async function getRecentSummaries(count: number = 30): Promise<DailySummary[]> {
  const dates = await listSummaryDates();
  const selectedDates = dates.slice(0, count);

  const summaries = await Promise.all(
    selectedDates.map(date => getSummary(date))
  );

  return summaries.filter((s): s is DailySummary => s !== null);
}

/**
 * Format a date string nicely
 */
export function formatSummaryDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
