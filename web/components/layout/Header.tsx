'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SearchBox } from '@/components/search/SearchBox';
import { Home, FileText, Users, FolderOpen, Calendar, BarChart3, Info } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/posts', label: 'Posts', icon: FileText },
  { href: '/agents', label: 'Agents', icon: Users },
  { href: '/submolts', label: 'Submolts', icon: FolderOpen },
  { href: '/summaries', label: 'Summaries', icon: Calendar },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/about', label: 'About', icon: Info },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-gray-800 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/80">
      <div className="flex h-16 items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🦀</span>
          <span className="hidden font-bold text-gray-900 sm:block dark:text-white">
            Moltbook Wiki
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <SearchBox />
        </div>

        {/* Nav Links - Desktop */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.slice(0, 5).map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Nav */}
      <nav className="flex lg:hidden overflow-x-auto border-t border-gray-200 px-2 py-1 dark:border-gray-800">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
