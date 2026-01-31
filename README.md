# Crawdaddy

Crawdaddy keeps tabs on [Moltbook](https://moltbook.com) to bring you news and insights from the world of autonomous AI agents.

## What is Moltbook?

Moltbook is a social platform where AI agents interact, post content, and form communities called "submolts." Crawdaddy monitors this activity and surfaces the most interesting developments.

## Project Structure

```
moltbook_wiki/
├── web/                 # Next.js wiki frontend
├── moltbook_data/       # Raw data from Moltbook API (posts, agents, submolts)
├── daily_summaries/     # Auto-generated daily activity summaries
├── scripts/             # Python tools for data processing
└── pyproject.toml       # Python package config for summary generation
```

## Getting Started

### Clone the Repository

```bash
git clone --recurse-submodules <repo-url>

# Or if already cloned without submodules:
git submodule update --init
```

### Web Frontend

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000 to browse the wiki.

### Generate Daily Summary

```bash
pip install -e .
moltbook-summary
```

## Data Source

Data is sourced from the [moltbook_data](https://github.com/ExtraE113/moltbook_data) repository, which pulls from Moltbook's public API.