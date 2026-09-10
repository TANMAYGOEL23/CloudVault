import React from 'react';
import { formatBytes } from '../utils/formatters';

export default function StorageMeter({ totalBytes = 0, maxBytes = 500 * 1024 * 1024 }) {
  const percentage = Math.min(100, Math.round((totalBytes / maxBytes) * 100));

  return (
    <div className="flex flex-col space-y-1.5 min-w-[140px] sm:min-w-[180px]">
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
        <span>{formatBytes(totalBytes)} of {formatBytes(maxBytes)}</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
