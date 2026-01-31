import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  description?: string;
}

export function MetricCard({ title, value, change, icon, description }: MetricCardProps) {
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{formattedValue}</p>
          {description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-orange-100 p-3 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
            {icon}
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="mt-4 flex items-center gap-1">
          {change > 0 ? (
            <>
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                +{change.toFixed(1)}%
              </span>
            </>
          ) : change < 0 ? (
            <>
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {change.toFixed(1)}%
              </span>
            </>
          ) : (
            <>
              <Minus className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                0%
              </span>
            </>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">vs yesterday</span>
        </div>
      )}
    </div>
  );
}
