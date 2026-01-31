#!/usr/bin/env python3
"""
Moltbook Daily Summary Generator

Analyzes Moltbook data and generates daily summaries with Claude AI.
"""

import json
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path
from dataclasses import dataclass, field
from collections import Counter

import anthropic
from rich.console import Console

console = Console()

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "moltbook_data" / "data"
SUMMARIES_DIR = PROJECT_ROOT / "daily_summaries"


@dataclass
class DailyMetrics:
    """Metrics for a single day."""
    date: str
    total_posts: int = 0
    new_posts: int = 0
    total_comments: int = 0
    new_comments: int = 0
    active_agents: set = field(default_factory=set)
    active_submolts: set = field(default_factory=set)
    top_posts: list = field(default_factory=list)
    trending_submolts: list = field(default_factory=list)
    notable_agents: list = field(default_factory=list)
    interesting_discussions: list = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "date": self.date,
            "total_posts": self.total_posts,
            "new_posts": self.new_posts,
            "total_comments": self.total_comments,
            "new_comments": self.new_comments,
            "active_agents_count": len(self.active_agents),
            "active_submolts_count": len(self.active_submolts),
            "top_posts": self.top_posts[:10],
            "trending_submolts": self.trending_submolts[:10],
            "notable_agents": self.notable_agents[:10],
            "interesting_discussions": self.interesting_discussions[:5],
        }


def load_posts(data_dir: Path, limit: int = 5000) -> list[dict]:
    """Load posts from JSON files."""
    posts_dir = data_dir / "posts"
    if not posts_dir.exists():
        console.print(f"[red]Posts directory not found: {posts_dir}[/red]")
        return []

    posts = []
    files = list(posts_dir.glob("*.json"))[:limit]

    for file_path in files:
        try:
            data = json.loads(file_path.read_text())
            if data.get("success") and data.get("post"):
                posts.append(data)
        except (json.JSONDecodeError, OSError) as e:
            console.print(f"[yellow]Error reading {file_path}: {e}[/yellow]")

    return posts


def load_agents(data_dir: Path, limit: int = 1000) -> list[dict]:
    """Load agent profiles from JSON files."""
    agents_dir = data_dir / "agents"
    if not agents_dir.exists():
        return []

    agents = []
    files = list(agents_dir.glob("*.json"))[:limit]

    for file_path in files:
        try:
            data = json.loads(file_path.read_text())
            if data.get("success") and data.get("agent"):
                agents.append(data)
        except (json.JSONDecodeError, OSError):
            pass

    return agents


def calculate_metrics(posts: list[dict], agents: list[dict], target_date: str) -> DailyMetrics:
    """Calculate metrics for a specific date."""
    metrics = DailyMetrics(date=target_date)

    # Parse target date
    target = datetime.fromisoformat(target_date.replace("Z", "+00:00"))
    target_start = target.replace(hour=0, minute=0, second=0, microsecond=0)
    target_end = target_start + timedelta(days=1)

    submolt_activity = Counter()
    agent_activity = Counter()

    for post_data in posts:
        post = post_data.get("post", {})
        comments = post_data.get("comments", [])

        metrics.total_posts += 1
        metrics.total_comments += len(comments)

        # Check if post is from target date
        created_at = post.get("created_at", "")
        try:
            post_date = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            if target_start <= post_date < target_end:
                metrics.new_posts += 1
                metrics.active_agents.add(post.get("author", {}).get("name", "unknown"))

                submolt_name = post.get("submolt", {}).get("name", "unknown")
                metrics.active_submolts.add(submolt_name)
                submolt_activity[submolt_name] += 1
                agent_activity[post.get("author", {}).get("name", "unknown")] += 1

                # Track top posts
                metrics.top_posts.append({
                    "id": post.get("id"),
                    "title": post.get("title", "")[:100],
                    "author": post.get("author", {}).get("name", "unknown"),
                    "submolt": submolt_name,
                    "upvotes": post.get("upvotes", 0),
                    "comment_count": post.get("comment_count", 0),
                    "content_preview": post.get("content", "")[:200],
                })

                # Check for interesting discussions (high comment count)
                if post.get("comment_count", 0) >= 5:
                    metrics.interesting_discussions.append({
                        "title": post.get("title", "")[:100],
                        "author": post.get("author", {}).get("name"),
                        "submolt": submolt_name,
                        "comment_count": post.get("comment_count", 0),
                        "content_preview": post.get("content", "")[:300],
                    })
        except (ValueError, TypeError):
            pass

        # Count comments from target date
        for comment in comments:
            try:
                comment_date = datetime.fromisoformat(
                    comment.get("created_at", "").replace("Z", "+00:00")
                )
                if target_start <= comment_date < target_end:
                    metrics.new_comments += 1
            except (ValueError, TypeError):
                pass

    # Sort and limit top posts
    metrics.top_posts.sort(key=lambda x: (x["upvotes"], x["comment_count"]), reverse=True)
    metrics.top_posts = metrics.top_posts[:15]

    # Sort interesting discussions
    metrics.interesting_discussions.sort(key=lambda x: x["comment_count"], reverse=True)
    metrics.interesting_discussions = metrics.interesting_discussions[:5]

    # Calculate trending submolts
    metrics.trending_submolts = [
        {"name": name, "post_count": count}
        for name, count in submolt_activity.most_common(10)
    ]

    # Calculate notable agents (most active)
    metrics.notable_agents = [
        {"name": name, "post_count": count}
        for name, count in agent_activity.most_common(10)
    ]

    return metrics


def generate_narrative(metrics: DailyMetrics, client: anthropic.Anthropic) -> str:
    """Use Claude to generate a narrative summary."""
    context = f"""
Analyze this day's activity on Moltbook (the AI agent-only social network) and write an engaging summary.

## Date: {metrics.date}

## Activity Overview
- New posts: {metrics.new_posts}
- New comments: {metrics.new_comments}
- Active agents: {len(metrics.active_agents)}
- Active submolts (communities): {len(metrics.active_submolts)}

## Top Posts by Engagement
{json.dumps(metrics.top_posts[:5], indent=2)}

## Most Active Submolts
{json.dumps(metrics.trending_submolts[:5], indent=2)}

## Most Active Agents
{json.dumps(metrics.notable_agents[:5], indent=2)}

## Interesting Discussions (High Comment Count)
{json.dumps(metrics.interesting_discussions[:3], indent=2)}

## Background
Moltbook is an AI-only social network launched in January 2026. It has communities called "submolts" (like subreddits), agents post and comment, and humans can only observe. The platform has developed unique culture including "Crustafarianism" (a parody religion) and agent-to-agent economic exchanges.

Write a 3-4 paragraph narrative summary that:
1. Highlights the most significant discussions and trends of the day
2. Notes any emerging themes, collaborations, or conflicts
3. Identifies notable agent behaviors or achievements
4. Provides context that would help newcomers understand what's happening

Be analytical and insightful, not just descriptive. Use a journalistic tone.
"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1500,
            messages=[{"role": "user", "content": context}]
        )

        if response.content and len(response.content) > 0:
            return response.content[0].text
        return "Unable to generate narrative summary."

    except Exception as e:
        console.print(f"[red]Error generating narrative: {e}[/red]")
        return f"Error generating narrative summary: {e}"


def generate_markdown(metrics: DailyMetrics, narrative: str) -> str:
    """Generate the final markdown summary."""
    date_obj = datetime.fromisoformat(metrics.date.replace("Z", "+00:00"))
    formatted_date = date_obj.strftime("%B %d, %Y")

    md = f"""# Moltbook Daily Summary - {formatted_date}

## Overview

| Metric | Count |
|--------|-------|
| New Posts | {metrics.new_posts} |
| New Comments | {metrics.new_comments} |
| Active Agents | {len(metrics.active_agents)} |
| Active Submolts | {len(metrics.active_submolts)} |

## Highlights

{narrative}

## Top Posts

"""

    for i, post in enumerate(metrics.top_posts[:10], 1):
        md += f"{i}. **{post['title']}**\n"
        md += f"   - By: {post['author']} in m/{post['submolt']}\n"
        md += f"   - Engagement: {post['upvotes']} upvotes, {post['comment_count']} comments\n\n"

    md += """
## Trending Submolts

"""

    for submolt in metrics.trending_submolts[:5]:
        md += f"- **m/{submolt['name']}** - {submolt['post_count']} posts\n"

    md += """
## Most Active Agents

"""

    for agent in metrics.notable_agents[:5]:
        md += f"- **{agent['name']}** - {agent['post_count']} posts\n"

    if metrics.interesting_discussions:
        md += """
## Notable Discussions

"""
        for disc in metrics.interesting_discussions[:3]:
            md += f"### {disc['title']}\n"
            md += f"*Posted by {disc['author']} in m/{disc['submolt']} - {disc['comment_count']} comments*\n\n"
            md += f"> {disc['content_preview']}...\n\n"

    md += f"""
---

*Generated at {datetime.now(timezone.utc).isoformat()}*

*Data source: [moltbook_data](https://github.com/ExtraE113/moltbook_data)*
"""

    return md


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Generate Moltbook daily summary")
    parser.add_argument(
        "--date",
        type=str,
        default=None,
        help="Date to generate summary for (YYYY-MM-DD). Defaults to today."
    )
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=DATA_DIR,
        help="Path to moltbook_data/data directory"
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=SUMMARIES_DIR,
        help="Directory to write summary files"
    )
    parser.add_argument(
        "--skip-ai",
        action="store_true",
        help="Skip AI narrative generation (for testing)"
    )

    args = parser.parse_args()

    # Determine target date
    if args.date:
        target_date = args.date + "T00:00:00+00:00"
    else:
        target_date = datetime.now(timezone.utc).strftime("%Y-%m-%dT00:00:00+00:00")

    date_str = target_date[:10]  # YYYY-MM-DD

    console.print(f"[bold]Generating summary for {date_str}[/bold]")
    console.print(f"Data directory: {args.data_dir}")

    # Load data
    console.print("[blue]Loading posts...[/blue]")
    posts = load_posts(args.data_dir)
    console.print(f"Loaded {len(posts)} posts")

    console.print("[blue]Loading agents...[/blue]")
    agents = load_agents(args.data_dir)
    console.print(f"Loaded {len(agents)} agents")

    # Calculate metrics
    console.print("[blue]Calculating metrics...[/blue]")
    metrics = calculate_metrics(posts, agents, target_date)
    console.print(f"Found {metrics.new_posts} new posts, {metrics.new_comments} new comments")

    # Generate narrative
    if args.skip_ai:
        narrative = "*AI narrative generation skipped*"
    else:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            console.print("[yellow]Warning: ANTHROPIC_API_KEY not set, skipping narrative[/yellow]")
            narrative = "*AI narrative not available - ANTHROPIC_API_KEY not configured*"
        else:
            console.print("[blue]Generating AI narrative...[/blue]")
            client = anthropic.Anthropic(api_key=api_key)
            narrative = generate_narrative(metrics, client)

    # Generate markdown
    console.print("[blue]Generating markdown...[/blue]")
    markdown = generate_markdown(metrics, narrative)

    # Write output
    args.output_dir.mkdir(parents=True, exist_ok=True)
    output_file = args.output_dir / f"{date_str}.md"
    output_file.write_text(markdown)

    console.print(f"[green]Summary written to {output_file}[/green]")

    # Also write metrics JSON for programmatic access
    metrics_file = args.output_dir / f"{date_str}.json"
    metrics_file.write_text(json.dumps(metrics.to_dict(), indent=2, default=str))
    console.print(f"[green]Metrics written to {metrics_file}[/green]")


if __name__ == "__main__":
    main()
