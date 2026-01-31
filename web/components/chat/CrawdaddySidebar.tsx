'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, X, Send, Loader2, Search, FileText, Users, FolderOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  result?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

// Parse markdown links and render as Next.js Links
function renderMessageContent(content: string) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    const [, text, url] = match;
    // Check if it's an internal link
    if (url.startsWith('/')) {
      parts.push(
        <Link
          key={match.index}
          href={url}
          className="text-orange-600 hover:text-orange-700 underline dark:text-orange-400"
        >
          {text}
        </Link>
      );
    } else {
      parts.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-600 hover:text-orange-700 underline dark:text-orange-400"
        >
          {text}
        </a>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : content;
}

export function CrawdaddySidebar() {
  const [isOpen, setIsOpen] = useState(true); // Open by default on desktop
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Howdy! I'm Crawdaddy, your friendly guide to Moltbook Wiki! I know my way around these waters pretty well - I can search posts, find agents, explore submolts, and fetch full conversations for ya.\n\nTry asking me things like:\n\n- \"Search for posts about Crustafarianism\"\n- \"Find agents interested in DeFi\"\n- \"Show me the top posts in m/general\"\n- \"Who are the most active agents?\"\n\nWhat can I help you discover today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      // On desktop (>=1024px), keep sidebar open
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        toolCalls: data.toolCalls,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Aw shucks, I ran into a snag there. Mind trying again? Sometimes these things happen in the digital bayou!",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderToolCall = (tool: ToolCall) => {
    const icons: Record<string, React.ReactNode> = {
      search_posts: <FileText className="h-3 w-3" />,
      search_agents: <Users className="h-3 w-3" />,
      search_submolts: <FolderOpen className="h-3 w-3" />,
      get_post: <FileText className="h-3 w-3" />,
      get_agent: <Users className="h-3 w-3" />,
      get_top_posts: <FileText className="h-3 w-3" />,
    };

    return (
      <div className="my-2 rounded border border-orange-200 bg-orange-50 p-2 text-xs dark:border-orange-900 dark:bg-orange-950">
        <div className="flex items-center gap-1 font-medium text-orange-700 dark:text-orange-400">
          {icons[tool.name] || <Search className="h-3 w-3" />}
          <span>{tool.name.replace(/_/g, ' ')}</span>
        </div>
        {tool.input && Object.keys(tool.input).length > 0 && (
          <div className="mt-1 text-orange-600 dark:text-orange-500">
            {Object.entries(tool.input).map(([k, v]) => (
              <span key={k} className="mr-2">
                {k}: <span className="text-orange-800 dark:text-orange-300">{String(v)}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Toggle Button - only visible on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-2 text-white shadow-lg transition-all duration-300 hover:bg-orange-700 lg:hidden"
        aria-label={isOpen ? 'Close Crawdaddy' : 'Open Crawdaddy'}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-80 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-900 lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200 lg:dark:border-gray-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-4 dark:border-gray-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-2xl">
              <span role="img" aria-label="crawdad">🦞</span>
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-white text-lg">Crawdaddy</h2>
              <p className="text-xs text-orange-100">Your guide to Moltbook</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                    }`}
                  >
                    {message.toolCalls && message.toolCalls.length > 0 && (
                      <div className="mb-2">
                        {message.toolCalls.map((tool, i) => (
                          <div key={i}>{renderToolCall(tool)}</div>
                        ))}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm">
                      {renderMessageContent(message.content)}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-3 dark:bg-gray-800">
                    <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Searchin' the waters...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-200 px-4 py-2 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Top posts', query: 'Show me the top posts today' },
                { label: 'Active agents', query: 'Who are the most active agents?' },
                { label: 'Trending', query: 'What submolts are trending?' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    setInput(action.query);
                    inputRef.current?.focus();
                  }}
                  className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700 hover:bg-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:hover:bg-orange-900"
                >
                  {action.label}
                  <ChevronRight className="h-3 w-3" />
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-200 p-4 dark:border-gray-700"
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Crawdaddy anything..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-600 text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
