import React, { useState } from 'react';
import { LayoutGrid, List, ArrowUpDown, FolderOpen, Loader2 } from 'lucide-react';
import FileCard from './FileCard';
import FileRow from './FileRow';
import { getFileCategory } from '../utils/formatters';

export default function FileList({
  files = [],
  loading = false,
  onShare,
  onDelete,
  onDownload,
  searchQuery = '',
  onUploadClick
}) {
  // Choice 10A: Table view by default
  const [viewMode, setViewMode] = useState('list'); 
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'image', label: 'Images' },
    { id: 'document', label: 'Documents' },
    { id: 'video', label: 'Videos' },
    { id: 'audio', label: 'Audio' },
    { id: 'code', label: 'Code' },
    { id: 'archive', label: 'Archives' },
  ];

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;
    const cat = getFileCategory(file.mime_type, file.name);
    if (selectedCategory === 'document') {
      return cat === 'document' || cat === 'pdf' || cat === 'spreadsheet';
    }
    return cat === selectedCategory;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'date-asc':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'size-desc':
        return b.size - a.size;
      case 'size-asc':
        return a.size - b.size;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4">
      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        
        {/* Category Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-subtle'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* View Mode & Sort options */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          {/* Sort dropdown */}
          <div className="flex items-center space-x-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-2 py-1 text-xs text-zinc-600 dark:text-zinc-400">
            <ArrowUpDown className="w-3 h-3 text-zinc-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="date-desc">Newest</option>
              <option value="date-asc">Oldest</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="size-desc">Largest</option>
              <option value="size-asc">Smallest</option>
            </select>
          </div>

          {/* List / Grid Toggle */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-md p-0.5 border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setViewMode('list')}
              title="List View"
              className={`p-1 rounded transition ${
                viewMode === 'list' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-subtle' : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-1 rounded transition ${
                viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-subtle' : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-16 text-center text-zinc-400 space-y-2">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-zinc-500" />
          <p className="text-xs">Loading files...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && sortedFiles.length === 0 && (
        <div className="bg-white dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {searchQuery ? 'No files match your search' : 'No files stored yet'}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {searchQuery 
                ? `No results found for "${searchQuery}"`
                : 'Upload documents, photos, or archives to get started.'}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={onUploadClick}
              className="px-3.5 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold rounded-lg shadow-subtle hover:bg-zinc-800 dark:hover:bg-zinc-200 transition"
            >
              Upload your first file
            </button>
          )}
        </div>
      )}

      {/* File List Presentation (Table view default) */}
      {!loading && sortedFiles.length > 0 && (
        <>
          {viewMode === 'list' ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-subtle">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-[11px] font-semibold text-zinc-400">
                    <th className="py-2.5 px-4">Name</th>
                    <th className="py-2.5 px-4 hidden sm:table-cell">Size</th>
                    <th className="py-2.5 px-4 hidden md:table-cell">Uploaded</th>
                    <th className="py-2.5 px-4 hidden lg:table-cell">Access</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFiles.map((file) => (
                    <FileRow
                      key={file.id}
                      file={file}
                      onShare={onShare}
                      onDelete={onDelete}
                      onDownload={onDownload}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {sortedFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onShare={onShare}
                  onDelete={onDelete}
                  onDownload={onDownload}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
