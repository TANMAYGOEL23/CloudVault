import React, { useState } from 'react';
import { Download, Share2, Trash2, Loader2 } from 'lucide-react';
import { formatBytes, formatDate, getFileIcon } from '../utils/formatters';

export default function FileRow({ file, onShare, onDelete, onDownload }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadClick = async () => {
    setIsDownloading(true);
    try {
      await onDownload(file);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteClick = async () => {
    if (window.confirm(`Delete "${file.name}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(file);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition">
      {/* Name & Icon */}
      <td className="py-3 px-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md flex-shrink-0">
            {getFileIcon(file.mime_type, file.name, "w-4 h-4")}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate block">
              {file.name}
            </span>
            <span className="text-[10px] text-zinc-400 sm:hidden">
              {formatBytes(file.size)} • {formatDate(file.created_at)}
            </span>
          </div>
        </div>
      </td>

      {/* Size */}
      <td className="py-3 px-4 text-xs text-zinc-500 dark:text-zinc-400 hidden sm:table-cell">
        {formatBytes(file.size)}
      </td>

      {/* Upload Date */}
      <td className="py-3 px-4 text-xs text-zinc-500 dark:text-zinc-400 hidden md:table-cell">
        {formatDate(file.created_at)}
      </td>

      {/* Access Status (Choice 8A - Dot Badge) */}
      <td className="py-3 px-4 hidden lg:table-cell">
        {file.is_public ? (
          <span className="inline-flex items-center space-x-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Public</span>
            <span className="text-[10px] text-zinc-400">({file.download_count || 0})</span>
          </span>
        ) : (
          <span className="inline-flex items-center space-x-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            <span>Private</span>
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={() => onShare(file)}
            title="Share file"
            className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDownloadClick}
            disabled={isDownloading}
            title="Download"
            className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition"
          >
            {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            title="Delete file"
            className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </td>
    </tr>
  );
}
