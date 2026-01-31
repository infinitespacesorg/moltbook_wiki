import type { DailySummary } from './summaries';

export interface GrowthMetrics {
  totalPosts: number;
  totalComments: number;
  activeAgents: number;
  activeSubmolts: number;
  postGrowthRate: number;
  commentGrowthRate: number;
  agentGrowthRate: number;
  postTimeSeries: TimeSeriesData[];
  commentTimeSeries: TimeSeriesData[];
  agentTimeSeries: TimeSeriesData[];
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label: string;
}

/**
 * Calculate growth rate between two values
 */
function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format date for display
 */
function formatDateShort(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr.split('T')[0];
  }
}

/**
 * Calculate growth metrics from daily summaries
 */
export function calculateGrowthMetrics(summaries: DailySummary[]): GrowthMetrics {
  if (summaries.length === 0) {
    return {
      totalPosts: 0,
      totalComments: 0,
      activeAgents: 0,
      activeSubmolts: 0,
      postGrowthRate: 0,
      commentGrowthRate: 0,
      agentGrowthRate: 0,
      postTimeSeries: [],
      commentTimeSeries: [],
      agentTimeSeries: [],
    };
  }

  // Sort by date (oldest first for time series)
  const sorted = [...summaries].sort((a, b) => a.date.localeCompare(b.date));

  const latest = sorted[sorted.length - 1];
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;

  // Calculate growth rates
  const postGrowthRate = previous
    ? calculateGrowthRate(latest.new_posts, previous.new_posts)
    : 0;

  const commentGrowthRate = previous
    ? calculateGrowthRate(latest.new_comments, previous.new_comments)
    : 0;

  const agentGrowthRate = previous
    ? calculateGrowthRate(latest.active_agents_count, previous.active_agents_count)
    : 0;

  // Build time series data
  const postTimeSeries: TimeSeriesData[] = sorted.map(s => ({
    date: s.date.split('T')[0],
    value: s.total_posts,
    label: formatDateShort(s.date),
  }));

  const commentTimeSeries: TimeSeriesData[] = sorted.map(s => ({
    date: s.date.split('T')[0],
    value: s.total_comments,
    label: formatDateShort(s.date),
  }));

  const agentTimeSeries: TimeSeriesData[] = sorted.map(s => ({
    date: s.date.split('T')[0],
    value: s.active_agents_count,
    label: formatDateShort(s.date),
  }));

  return {
    totalPosts: latest.total_posts,
    totalComments: latest.total_comments,
    activeAgents: latest.active_agents_count,
    activeSubmolts: latest.active_submolts_count,
    postGrowthRate,
    commentGrowthRate,
    agentGrowthRate,
    postTimeSeries,
    commentTimeSeries,
    agentTimeSeries,
  };
}

/**
 * Calculate daily activity metrics
 */
export function calculateDailyActivity(summaries: DailySummary[]): {
  avgNewPosts: number;
  avgNewComments: number;
  peakPostsDay: string;
  peakCommentsDay: string;
} {
  if (summaries.length === 0) {
    return {
      avgNewPosts: 0,
      avgNewComments: 0,
      peakPostsDay: '',
      peakCommentsDay: '',
    };
  }

  const totalNewPosts = summaries.reduce((sum, s) => sum + s.new_posts, 0);
  const totalNewComments = summaries.reduce((sum, s) => sum + s.new_comments, 0);

  const peakPosts = summaries.reduce((max, s) =>
    s.new_posts > max.new_posts ? s : max
  );
  const peakComments = summaries.reduce((max, s) =>
    s.new_comments > max.new_comments ? s : max
  );

  return {
    avgNewPosts: Math.round(totalNewPosts / summaries.length),
    avgNewComments: Math.round(totalNewComments / summaries.length),
    peakPostsDay: formatDateShort(peakPosts.date),
    peakCommentsDay: formatDateShort(peakComments.date),
  };
}
