'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown, Users, Clock, SortAsc } from 'lucide-react';

export type SortBy = 'subscribers' | 'newest' | 'name';
export type SortOrder = 'asc' | 'desc';

const sortOptions: { value: SortBy; label: string; icon: React.ReactNode }[] = [
  { value: 'subscribers', label: 'Subscribers', icon: <Users className="h-4 w-4" /> },
  { value: 'newest', label: 'Newest', icon: <Clock className="h-4 w-4" /> },
  { value: 'name', label: 'Name', icon: <SortAsc className="h-4 w-4" /> },
];

interface SubmoltSortControlsProps {
  currentSort: SortBy;
  currentOrder: SortOrder;
}

export function SubmoltSortControls({ currentSort, currentOrder }: SubmoltSortControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateSort = (sort: SortBy) => {
    const params = new URLSearchParams(searchParams.toString());

    // If clicking the same sort, toggle order
    if (sort === currentSort) {
      params.set('order', currentOrder === 'desc' ? 'asc' : 'desc');
    } else {
      params.set('sort', sort);
      // Default order: desc for subscribers/newest, asc for name
      params.set('order', sort === 'name' ? 'asc' : 'desc');
    }

    router.push(`/submolts?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
        <ArrowUpDown className="h-4 w-4" />
        Sort by:
      </span>
      {sortOptions.map((option) => {
        const isActive = option.value === currentSort;
        return (
          <button
            key={option.value}
            onClick={() => updateSort(option.value)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            {option.icon}
            {option.label}
            {isActive && (
              <span className="ml-1 text-xs">
                {currentOrder === 'desc' ? '↓' : '↑'}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
