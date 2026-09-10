import React, { useEffect, useState } from 'react';
import { Cloud, Download, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { formatBytes, formatDate, getFileIcon, getFileCategory } from '../utils/formatters';
import ThemeToggle from './ThemeToggle';

export default function PublicShareView({ shareToken }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedFile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('files')
          .select('*')
          .eq('share_token', shareToken)
          .eq('is_public', true)
          .single();

        if (error || !data) {
          throw new Error('This shared file is either private or unavailable.');
        }

        setFile(data);
      } catch (err) {
        console.error('Fetch shared file error:', err);
        setError(err.message || 'File not found');
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      fetchSharedFile();
    }
  }, [shareToken]);

  const handleDownload = async () => {
    if (!file) return;
    setDownloading(true);

    try {
      const { data, error: downloadError } = await supabase.storage
        .from('cloud_files')
        .download(file.storage_path);

      if (downloadError) throw downloadError;

      const blobUrl = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      try {
        await supabase.rpc('increment_download_count', { file_id: file.id });
      } catch (rpcErr) {
        await supabase
          .from('files')
          .update({ download_count: (file.download_count || 0) + 1 })
          .eq('id', file.id);
      }

      setFile((prev) => prev ? { ...prev, download_count: (prev.download_count || 0) + 1 } : null);
    } catch (err) {
      console.error('Download error:', err);
      alert('Download error: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 transition-colors relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-subtle space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold">
              <Cloud className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-xs tracking-tight text-zinc-900 dark:text-zinc-100">
              CloudVault
            </span>
          </div>

          <a
            href="/"
            className="flex items-center space-x-1 text-xs text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </a>
        </div>

        {/* Content */}
        {loading && (
          <div className="py-12 text-center space-y-2">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-400 mx-auto" />
            <p className="text-xs text-zinc-400">Loading file details...</p>
          </div>
        )}

        {error && (
          <div className="py-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">File Unavailable</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">{error}</p>
            </div>
          </div>
        )}

        {file && !loading && !error && (
          <div className="space-y-5">
            {/* File Showcase */}
            <div className="flex flex-col items-center text-center space-y-3 py-2">
              <div className="w-16 h-16 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                {getFileIcon(file.mime_type, file.name, "w-8 h-8")}
              </div>

              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 break-words" title={file.name}>
                  {file.name}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {formatBytes(file.size)} • {formatDate(file.created_at)}
                </p>
              </div>
            </div>

            {/* Download Button (Choice 7A - Monochrome) */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold rounded-lg shadow-subtle flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-zinc-400">
              Downloaded {file.download_count || 0} times
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
