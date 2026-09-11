import React, { useEffect, useState } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { formatBytes, formatDate, getFileCategory, getFileIcon } from '../utils/formatters';

export default function PreviewModal({ file, onClose, onDownload, onShare }) {
  const [fileUrl, setFileUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);

  const category = file ? getFileCategory(file.mime_type, file.name) : 'other';

  useEffect(() => {
    if (!file) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setZoom(1);
    setRotation(0);
    setTextContent('');

    const loadContent = async () => {
      try {
        const { data: downloadData, error: downloadError } = await supabase.storage
          .from('cloud_files')
          .download(file.storage_path);

        if (downloadError) throw downloadError;

        const objectUrl = URL.createObjectURL(downloadData);
        if (!isMounted) return;
        setFileUrl(objectUrl);

        if (category === 'code' || category === 'document' || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json') || file.name.endsWith('.csv')) {
          const text = await downloadData.text();
          if (isMounted) setTextContent(text);
        }
      } catch (err) {
        console.error('Preview error:', err);
        if (isMounted) setError(err.message || 'Unable to load preview');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadContent();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [file]);

  if (!file) return null;

  const handleCopyText = () => {
    if (!textContent) return;
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[90vh] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-colors">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 flex-shrink-0">
          
          {/* File Meta */}
          <div className="flex items-center space-x-3 min-w-0 pr-4">
            <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 flex-shrink-0">
              {getFileIcon(file.mime_type, file.name, "w-4 h-4")}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate" title={file.name}>
                {file.name}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {formatBytes(file.size)} • Uploaded {formatDate(file.created_at)}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            {/* Image Controls */}
            {category === 'image' && !loading && !error && (
              <div className="hidden sm:flex items-center space-x-1 pr-2 border-r border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}
                  title="Zoom Out"
                  className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-zinc-400 w-9 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                  title="Zoom In"
                  className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  title="Rotate"
                  className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Code / Text Copy Button */}
            {(category === 'code' || textContent) && (
              <button
                onClick={handleCopyText}
                className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition border border-zinc-200 dark:border-zinc-800"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            )}

            {/* Share Button */}
            <button
              onClick={() => onShare(file)}
              title="Share"
              className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Download Button */}
            <button
              onClick={() => onDownload(file)}
              title="Download"
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold rounded-md transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              title="Close (Esc)"
              className="p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Content Area */}
        <div className="flex-1 bg-zinc-100/60 dark:bg-zinc-950 overflow-auto flex items-center justify-center relative p-4">
          
          {loading && (
            <div className="flex flex-col items-center justify-center space-y-2 text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              <p className="text-xs">Preparing preview...</p>
            </div>
          )}

          {error && (
            <div className="text-center space-y-3 p-6 max-w-sm">
              <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{error}</p>
              <button
                onClick={() => onDownload(file)}
                className="px-3.5 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold rounded-lg"
              >
                Download File Instead
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* 1. Image Preview */}
              {category === 'image' && (
                <div className="w-full h-full flex items-center justify-center overflow-auto select-none">
                  <img
                    src={fileUrl}
                    alt={file.name}
                    className="max-w-full max-h-full object-contain transition-transform duration-200 rounded-md shadow-subtle"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`
                    }}
                  />
                </div>
              )}

              {/* 2. PDF Document Preview */}
              {category === 'pdf' && (
                <iframe
                  src={fileUrl}
                  title={file.name}
                  className="w-full h-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white"
                />
              )}

              {/* 3. Video Player */}
              {category === 'video' && (
                <div className="w-full max-w-3xl max-h-full flex items-center justify-center">
                  <video
                    src={fileUrl}
                    controls
                    autoPlay
                    className="w-full max-h-[75vh] rounded-lg shadow-subtle bg-black"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {/* 4. Audio Player */}
              {category === 'audio' && (
                <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-subtle space-y-4 text-center">
                  <div className="w-16 h-16 rounded-xl bg-pink-50 dark:bg-pink-950/30 text-pink-500 flex items-center justify-center mx-auto">
                    {getFileIcon(file.mime_type, file.name, "w-8 h-8")}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{file.name}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{formatBytes(file.size)}</p>
                  </div>
                  <audio src={fileUrl} controls autoPlay className="w-full pt-2">
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {/* 5. Code / Text / Markdown Viewer */}
              {(category === 'code' || textContent) && (
                <div className="w-full h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-auto p-4 font-mono text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre">
                    {textContent || 'No text content detected.'}
                  </div>
                </div>
              )}

              {/* 6. Unsupported Binary Fallback */}
              {category !== 'image' && category !== 'pdf' && category !== 'video' && category !== 'audio' && !textContent && (
                <div className="text-center space-y-4 p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm shadow-subtle">
                  <div className="w-16 h-16 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center mx-auto">
                    {getFileIcon(file.mime_type, file.name, "w-8 h-8")}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{file.name}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{formatBytes(file.size)}</p>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Direct browser preview is not supported for this format. You can download it to view.
                  </p>
                  <button
                    onClick={() => onDownload(file)}
                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold rounded-lg transition"
                  >
                    Download File
                  </button>
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
}
