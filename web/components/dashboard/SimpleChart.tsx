'use client';

import { useMemo } from 'react';
import type { TimeSeriesData } from '@/lib/data/analytics';

interface SimpleChartProps {
  data: TimeSeriesData[];
  title: string;
  color?: string;
  height?: number;
}

export function SimpleChart({ data, title, color = '#f97316', height = 200 }: SimpleChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return { bars: [], maxValue: 0 };

    const maxValue = Math.max(...data.map(d => d.value));
    const bars = data.map((d, idx) => ({
      ...d,
      height: maxValue > 0 ? (d.value / maxValue) * 100 : 0,
      index: idx,
    }));

    return { bars, maxValue };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex h-[200px] items-center justify-center text-gray-500 dark:text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">{title}</h3>

      <div className="relative" style={{ height }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-400">
          <span>{chartData.maxValue.toLocaleString()}</span>
          <span>{Math.round(chartData.maxValue / 2).toLocaleString()}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="ml-12 flex h-full items-end gap-1 pb-6">
          {chartData.bars.map((bar) => (
            <div
              key={bar.date}
              className="group relative flex-1 flex flex-col items-center"
            >
              {/* Bar */}
              <div
                className="w-full rounded-t transition-all hover:opacity-80"
                style={{
                  height: `${bar.height}%`,
                  backgroundColor: color,
                  minHeight: bar.height > 0 ? '4px' : '0',
                }}
              />

              {/* X-axis label */}
              <span className="absolute -bottom-5 text-[10px] text-gray-400 whitespace-nowrap">
                {bar.label}
              </span>

              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                <div className="rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg dark:bg-gray-700">
                  <div className="font-medium">{bar.value.toLocaleString()}</div>
                  <div className="text-gray-300">{bar.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
