import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { Upload, Check, AlertCircle, X, File, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { formatBytes } from '../utils/formatters';

const FileUpload = forwardRef(({ onUploadComplete, showDropzone = false }, ref) => {
  const { user } = useAuth();
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    openFileDialog: () => {
      fileInputRef.current?.click();
    },
    handleFiles: (files) => {
      handleFiles(files);
    }
  }));

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files) => {
    const newItems = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      name: file.name,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      status: 'pending',
      progress: 0,
      error: null
    }));

    setUploadQueue((prev) => [...prev, ...newItems]);
    processUploadQueue(newItems);
  };

  const processUploadQueue = async (items) => {
    if (!user) return;
    setIsUploading(true);

    for (const item of items) {
      setUploadQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading', progress: 30 } : q))
      );

      try {
        const timestamp = Date.now();
        const safeName = item.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `${user.id}/${timestamp}_${safeName}`;

        // 1. Upload to Supabase Storage
        const { error: storageError } = await supabase.storage
          .from('cloud_files')
          .upload(storagePath, item.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (storageError) throw storageError;

        setUploadQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, progress: 80 } : q))
        );

        // 2. Insert metadata into public.files
        const { error: dbError } = await supabase
          .from('files')
          .insert({
            user_id: user.id,
            name: item.name,
            storage_path: storagePath,
            size: item.size,
            mime_type: item.mimeType,
            is_public: false
          });

        if (dbError) throw dbError;

        setUploadQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: 'success', progress: 100 } : q))
        );

        if (onUploadComplete) {
          onUploadComplete();
        }
      } catch (err) {
        console.error('Upload failed:', err);
        setUploadQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: 'error', error: err.message || 'Upload failed' }
              : q
          )
        );
      }
    }

    setIsUploading(false);
  };

  const removeQueueItem = (id) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCompleted = () => {
    setUploadQueue((prev) => prev.filter((item) => item.status === 'uploading' || item.status === 'pending'));
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Optional Clean Dropzone when empty or requested */}
      {showDropzone && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/30 rounded-xl p-8 text-center cursor-pointer transition"
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
              Drag and drop files here, or <span className="underline">browse</span>
            </p>
            <p className="text-[11px] text-zinc-400">
              Any file type up to 50MB
            </p>
          </div>
        </div>
      )}

      {/* Upload Status Card (Float or Bottom Right) */}
      {uploadQueue.length > 0 && (
        <div className="fixed bottom-5 right-5 z-40 w-80 max-w-[calc(100vw-2.5rem)] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg p-3.5 space-y-2.5 transition">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <span>Uploads ({uploadQueue.filter((q) => q.status === 'success').length}/{uploadQueue.length})</span>
            <button
              onClick={clearCompleted}
              className="text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              Clear
            </button>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {uploadQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-950 rounded-lg text-xs"
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1 pr-2">
                  <File className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-zinc-800 dark:text-zinc-200 font-medium truncate">{item.name}</p>
                    <p className="text-[10px] text-zinc-400">{formatBytes(item.size)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  {item.status === 'uploading' && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
                  )}
                  {item.status === 'success' && (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {item.status === 'error' && (
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" title={item.error} />
                  )}
                  <button
                    onClick={() => removeQueueItem(item.id)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default FileUpload;
