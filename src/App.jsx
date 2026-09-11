import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import ShareModal from './components/ShareModal';
import PreviewModal from './components/PreviewModal';
import PublicShareView from './components/PublicShareView';
import ConfigGuide from './components/ConfigGuide';
import { Upload } from 'lucide-react';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sharingFile, setSharingFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [isWindowDragging, setIsWindowDragging] = useState(false);

  const fileUploadRef = useRef(null);

  const urlParams = new URLSearchParams(window.location.search);
  const shareToken = urlParams.get('share');

  // Fetch all user's files
  const fetchFiles = useCallback(async () => {
    if (!user) return;
    setLoadingFiles(true);
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoadingFiles(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user, fetchFiles]);

  // Handle Download
  const handleDownload = async (file) => {
    try {
      const { data, error } = await supabase.storage
        .from('cloud_files')
        .download(file.storage_path);

      if (error) throw error;

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
      } catch (e) {
        await supabase
          .from('files')
          .update({ download_count: (file.download_count || 0) + 1 })
          .eq('id', file.id);
      }

      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, download_count: (f.download_count || 0) + 1 } : f))
      );
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download: ' + err.message);
    }
  };

  // Handle Delete
  const handleDelete = async (file) => {
    try {
      await supabase.storage
        .from('cloud_files')
        .remove([file.storage_path]);

      const { error: dbErr } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (dbErr) throw dbErr;

      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      if (previewFile?.id === file.id) setPreviewFile(null);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete: ' + err.message);
    }
  };

  // Window drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
      setIsWindowDragging(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragLeave = (e) => {
    if (!e.relatedTarget || e.relatedTarget.nodeName === 'HTML') {
      setIsWindowDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsWindowDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      fileUploadRef.current?.handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  // 1. Supabase credentials check
  if (!isSupabaseConfigured) {
    return <ConfigGuide />;
  }

  // 2. Shared link view
  if (shareToken) {
    return <PublicShareView shareToken={shareToken} />;
  }

  // 3. Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 4. Not authenticated
  if (!user) {
    return <Auth />;
  }

  const totalSizeBytes = files.reduce((acc, curr) => acc + Number(curr.size || 0), 0);

  return (
    <div 
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col transition-colors relative"
    >
      {/* Full-Window Drag & Drop Overlay */}
      {isWindowDragging && (
        <div className="fixed inset-0 z-50 bg-zinc-900/60 dark:bg-zinc-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white pointer-events-none transition-all">
          <div className="w-14 h-14 rounded-2xl bg-white text-zinc-900 flex items-center justify-center shadow-xl mb-3">
            <Upload className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold">Drop files anywhere to upload</h2>
          <p className="text-xs text-zinc-300 mt-1">Instant upload to your secure cloud</p>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onUploadClick={() => fileUploadRef.current?.openFileDialog()}
        totalBytes={totalSizeBytes}
      />

      {/* Hidden/Active File Uploader */}
      <FileUpload
        ref={fileUploadRef}
        onUploadComplete={fetchFiles}
        showDropzone={files.length === 0}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        
        {/* Header section with total files & storage */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Files
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {files.length} {files.length === 1 ? 'file' : 'files'} stored in your cloud
            </p>
          </div>
        </div>

        {/* File Browser Table & Grid */}
        <FileList
          files={files}
          loading={loadingFiles}
          searchQuery={searchQuery}
          onShare={(file) => setSharingFile(file)}
          onDelete={handleDelete}
          onDownload={handleDownload}
          onPreview={(file) => setPreviewFile(file)}
          onUploadClick={() => fileUploadRef.current?.openFileDialog()}
        />

      </main>

      {/* Preview Modal Dialog */}
      {previewFile && (
        <PreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onDownload={handleDownload}
          onShare={(file) => {
            setSharingFile(file);
          }}
        />
      )}

      {/* Share Modal Dialog */}
      {sharingFile && (
        <ShareModal
          file={sharingFile}
          onClose={() => setSharingFile(null)}
          onUpdate={(updated) => {
            setSharingFile(updated);
            setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
          }}
        />
      )}
    </div>
  );
}
