import React, { useState } from 'react';
import { X, Copy, Check, Share2, Globe, Lock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { formatBytes, formatDate } from '../utils/formatters';

export default function ShareModal({ file, onClose, onUpdate }) {
  const [isPublic, setIsPublic] = useState(file?.is_public || false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!file) return null;

  const shareUrl = `${window.location.origin}?share=${file.share_token}`;

  const togglePublic = async () => {
    setIsUpdating(true);
    const newStatus = !isPublic;
    try {
      const { error } = await supabase
        .from('files')
        .update({ is_public: newStatus, updated_at: new Date().toISOString() })
        .eq('id', file.id);

      if (error) throw error;
      setIsPublic(newStatus);
      if (onUpdate) onUpdate({ ...file, is_public: newStatus });
    } catch (err) {
      console.error('Failed to update share status:', err);
      alert('Failed to update: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xl space-y-5 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Share File</h3>
            <p className="text-xs text-zinc-400 truncate max-w-[280px]">
              {file.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* File Quick Info */}
        <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <div>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{formatBytes(file.size)}</span>
            <span className="ml-1 text-[11px] text-zinc-400">• {formatDate(file.created_at)}</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">{file.download_count || 0} downloads</span>
        </div>

        {/* Sharing Toggle Box */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            {isPublic ? (
              <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Lock className="w-4 h-4 text-zinc-400" />
            )}
            <div>
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                {isPublic ? 'Public link enabled' : 'Public link disabled'}
              </p>
              <p className="text-[11px] text-zinc-400">
                {isPublic ? 'Anyone with the link can view & download' : 'Only you can access this file'}
              </p>
            </div>
          </div>

          <button
            onClick={togglePublic}
            disabled={isUpdating}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              isPublic
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'
            }`}
          >
            {isUpdating ? '...' : isPublic ? 'Disable' : 'Enable'}
          </button>
        </div>

        {/* Link Field (when public) */}
        {isPublic && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Shareable URL
            </label>
            <div className="flex items-center space-x-1.5">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-mono focus:outline-none select-all"
              />
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition flex-shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
