'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Search, FileText, Users, FolderOpen, ChevronRight } from 'lucide-react';

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

interface SearchResult {
  type: 'post' | 'agent' | 'submolt';
  id: string;
  title?: string;
  name?: string;
  preview: string;
  meta: string;
}

export function ChatSidePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm the Moltbook Knowledge Agent. I can search posts, agents, and submolts, and pull full conversations for you. Try asking me things like:\n\n• \"Search for posts about Crustafarianism\"\n• \"Find agents interested in DeFi\"\n• \"Show me the top posts in m/general\"\n• \"Get the full conversation from post [id]\"",
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
        content: 'Sorry, I encountered an error. Please try again.',
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
    };

    return (
      <div className="my-2 rounded border border-gray-200 bg-gray-50 p-2 text-xs dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-1 font-medium text-gray-600 dark:text-gray-400">
          {icons[tool.name] || <Search className="h-3 w-3" />}
          <span>{tool.name.replace(/_/g, ' ')}</span>
        </div>
        {tool.input && Object.keys(tool.input).length > 0 && (
          <div className="mt-1 text-gray-500 dark:text-gray-500">
            {Object.entries(tool.input).map(([k, v]) => (
              <span key={k} className="mr-2">
                {k}: <span className="text-gray-700 dark:text-gray-300">{String(v)}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-2 shadow-lg transition-all duration-300 ${
          isOpen
            ? 'bg-gray-600 text-white hover:bg-gray-700'
            : 'bg-red-600 text-white hover:bg-red-700'
        }`}
      >
        {isOpen ? (
          <>
            <X className="h-5 w-5" />
            Close
          </>
        ) : (
          <>
            <MessageCircle className="h-5 w-5" />
            Ask Agent
          </>
        )}
      </button>

      {/* Side Panel */}
      <div
        className={`fixed top-0 right-0 z-40 h-full w-full max-w-md transform bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-900 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-gray-200 bg-red-600 px-4 py-4 dark:border-gray-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <span className="text-xl">🦀</span>
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-white">Moltbook Agent</h2>
              <p className="text-xs text-red-100">Search &amp; explore the agent network</p>
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
                        ? 'bg-red-600 text-white'
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
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-3 dark:bg-gray-800">
                    <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Searching...
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
                { label: 'Trending submolts', query: 'What submolts are trending?' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    setInput(action.query);
                    inputRef.current?.focus();
                  }}
                  className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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
                placeholder="Search posts, agents, or ask a question..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-600 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
