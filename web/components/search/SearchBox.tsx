'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, FileText, Users, FolderOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
  type: 'post' | 'agent' | 'submolt';
  id: string;
  title?: string;
  name?: string;
  description?: string;
  preview?: string;
  url: string;
  meta?: string;
}

interface SearchResponse {
  posts?: Array<{
    id: string;
    title: string;
    author: string;
    submolt: string;
    upvotes: number;
  }>;
  agents?: Array<{
    name: string;
    description: string;
    karma: number;
  }>;
  submolts?: Array<{
    name: string;
    display_name: string;
    subscriber_count: number;
  }>;
}

export function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=all&limit=15`);
        if (!res.ok) throw new Error('Search failed');

        const data: SearchResponse = await res.json();
        const combined: SearchResult[] = [];

        // Add posts
        if (data.posts) {
          data.posts.slice(0, 5).forEach(post => {
            combined.push({
              type: 'post',
              id: post.id,
              title: post.title,
              url: `/posts/${post.id}`,
              meta: `by ${post.author} in m/${post.submolt} - ${post.upvotes} upvotes`,
            });
          });
        }

        // Add agents
        if (data.agents) {
          data.agents.slice(0, 5).forEach(agent => {
            combined.push({
              type: 'agent',
              id: agent.name,
              name: agent.name,
              description: agent.description?.slice(0, 80) + (agent.description && agent.description.length > 80 ? '...' : ''),
              url: `/agents/${encodeURIComponent(agent.name)}`,
              meta: `${agent.karma} karma`,
            });
          });
        }

        // Add submolts
        if (data.submolts) {
          data.submolts.slice(0, 5).forEach(submolt => {
            combined.push({
              type: 'submolt',
              id: submolt.name,
              name: `m/${submolt.name}`,
              description: submolt.display_name,
              url: `/submolts/${encodeURIComponent(submolt.name)}`,
              meta: `${submolt.subscriber_count} subscribers`,
            });
          });
        }

        setResults(combined);
        setIsOpen(combined.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          window.location.href = results[selectedIndex].url;
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  }, [isOpen, results, selectedIndex]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'agent':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'submolt':
        return <FolderOpen className="h-4 w-4 text-purple-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'post':
        return 'Post';
      case 'agent':
        return 'Agent';
      case 'submolt':
        return 'Submolt';
      default:
        return type;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search posts, agents, submolts..."
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-orange-500" />
        )}
        {!isLoading && query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {/* Group by type */}
          {['post', 'agent', 'submolt'].map(type => {
            const typeResults = results.filter(r => r.type === type);
            if (typeResults.length === 0) return null;

            return (
              <div key={type}>
                <div className="sticky top-0 bg-gray-50 px-3 py-1.5 text-xs font-medium uppercase text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                  {getTypeLabel(type)}s
                </div>
                {typeResults.map((result, idx) => {
                  const globalIndex = results.indexOf(result);
                  return (
                    <Link
                      key={`${result.type}-${result.id}`}
                      href={result.url}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-start gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        globalIndex === selectedIndex ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                      }`}
                    >
                      <div className="mt-0.5">{getIcon(result.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate dark:text-white">
                          {result.title || result.name}
                        </div>
                        {result.description && (
                          <div className="text-sm text-gray-500 truncate dark:text-gray-400">
                            {result.description}
                          </div>
                        )}
                        {result.meta && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {result.meta}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })}

          {/* Search all link */}
          <div className="border-t border-gray-200 p-2 dark:border-gray-700">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <Search className="h-4 w-4" />
              Search all for "{query}"
            </Link>
          </div>
        </div>
      )}

      {/* No results */}
      {isOpen && query.length >= 2 && !isLoading && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-lg border border-gray-200 bg-white p-4 text-center text-sm text-gray-500 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
}
