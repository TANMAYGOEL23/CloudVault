import React, { useState } from 'react';
import { Download, Share2, Trash2, Loader2, Eye } from 'lucide-react';
import { formatBytes, formatDate, getFileIcon, getFileCategory } from '../utils/formatters';
import { supabase } from '../lib/supabaseClient';

export default function FileCard({ file, onShare, onDelete, onDownload, onPreview }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const isImage = getFileCategory(file.mime_type, file.name) === 'image';

  const { data: publicUrlData } = supabase.storage
    .from('cloud_files')
    .getPublicUrl(file.storage_path);

  const handleDownloadClick = async (e) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      await onDownload(file);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${file.name}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(file);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    onShare(file);
  };

  return (
    <div 
      onClick={() => onPreview && onPreview(file)}
      className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-xl p-3.5 transition shadow-subtle flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Top bar: Status dot & Actions */}
        <div className="flex items-center justify-between mb-2.5">
          {file.is_public ? (
            <span className="inline-flex items-center space-x-1.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Public</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              <span>Private</span>
            </span>
          )}

          <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition">
            <button
              onClick={handleShareClick}
              title="Share file"
              className="p-1 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 rounded transition"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              title="Delete file"
              className="p-1 text-zinc-400 hover:text-red-500 rounded transition"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Thumbnail or Icon box */}
        <div className="w-full h-28 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80 flex items-center justify-center overflow-hidden mb-3 relative">
          {isImage ? (
            <img
              src={publicUrlData.publicUrl}
              alt={file.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="p-3 transform group-hover:scale-110 transition duration-200">
              {getFileIcon(file.mime_type, file.name, "w-8 h-8")}
            </div>
          )}
        </div>

        {/* File Name & Metadata */}
        <div>
          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:underline" title={file.name}>
            {file.name}
          </h4>
          <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-400">
            <span>{formatBytes(file.size)}</span>
            <span>{formatDate(file.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
        <span className="text-[10px] text-zinc-400 flex items-center space-x-1">
          <Eye className="w-3 h-3" />
          <span>Click to preview</span>
        </span>
        <button
          onClick={handleDownloadClick}
          disabled={isDownloading}
          className="flex items-center space-x-1 px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md text-[11px] font-medium transition"
        >
          {isDownloading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Download className="w-3 h-3" />
          )}
          <span>Download</span>
        </button>
      </div>
    </div>
  );
}
