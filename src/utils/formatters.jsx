import React from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Film, 
  Music, 
  Archive, 
  FileSpreadsheet,
  File,
  FileCode2
} from 'lucide-react';

/**
 * Format bytes to human readable format (KB, MB, GB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format timestamp to clean readable date string
 */
export function formatDate(timestamp) {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Return file category: image, video, audio, document, archive, code, other
 */
export function getFileCategory(mimeType = '', filename = '') {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)) {
    return 'image';
  }
  if (mimeType.startsWith('video/') || ['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext)) {
    return 'video';
  }
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) {
    return 'audio';
  }
  if (mimeType.includes('pdf') || ['pdf'].includes(ext)) {
    return 'pdf';
  }
  if (
    mimeType.includes('spreadsheet') || 
    mimeType.includes('excel') || 
    mimeType.includes('csv') || 
    ['xlsx', 'xls', 'csv'].includes(ext)
  ) {
    return 'spreadsheet';
  }
  if (
    mimeType.includes('document') || 
    mimeType.includes('word') || 
    mimeType.includes('text') || 
    ['doc', 'docx', 'txt', 'md', 'rtf'].includes(ext)
  ) {
    return 'document';
  }
  if (
    mimeType.includes('zip') || 
    mimeType.includes('compressed') || 
    mimeType.includes('tar') || 
    ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)
  ) {
    return 'archive';
  }
  if (
    mimeType.includes('javascript') || 
    mimeType.includes('json') || 
    mimeType.includes('html') || 
    ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'html', 'css', 'json', 'sql', 'sh'].includes(ext)
  ) {
    return 'code';
  }
  return 'other';
}

/**
 * Get icon component for a file based on mime type or filename
 */
export function getFileIcon(mimeType = '', filename = '', className = "w-4 h-4") {
  const category = getFileCategory(mimeType, filename);

  switch (category) {
    case 'image':
      return <ImageIcon className={`${className} text-blue-600 dark:text-blue-400`} />;
    case 'video':
      return <Film className={`${className} text-purple-600 dark:text-purple-400`} />;
    case 'audio':
      return <Music className={`${className} text-pink-600 dark:text-pink-400`} />;
    case 'pdf':
      return <FileText className={`${className} text-rose-600 dark:text-rose-400`} />;
    case 'spreadsheet':
      return <FileSpreadsheet className={`${className} text-emerald-600 dark:text-emerald-400`} />;
    case 'document':
      return <FileText className={`${className} text-zinc-600 dark:text-zinc-400`} />;
    case 'archive':
      return <Archive className={`${className} text-amber-600 dark:text-amber-400`} />;
    case 'code':
      return <FileCode2 className={`${className} text-cyan-600 dark:text-cyan-400`} />;
    default:
      return <File className={`${className} text-zinc-500 dark:text-zinc-400`} />;
  }
}
