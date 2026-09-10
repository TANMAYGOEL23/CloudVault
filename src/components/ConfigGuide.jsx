import React from 'react';
import { Cloud, ExternalLink, Copy } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function ConfigGuide() {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const sampleEnv = `VITE_SUPABASE_URL=https://your-project-ref.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-900 dark:text-zinc-100 relative transition-colors">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-xl w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-subtle space-y-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold">
            <Cloud className="w-4 h-4" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">CloudVault Setup</h1>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          To connect your free storage and database, add your Supabase project credentials to the <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono text-zinc-800 dark:text-zinc-200">.env</code> file.
        </p>

        <div className="space-y-3">
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">1. Create a Supabase Project</span>
              <a 
                href="https://database.new" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center space-x-1"
              >
                <span>database.new</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-zinc-400">Create a free project in your nearest region.</p>
          </div>

          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs font-semibold">2. Run SQL Schema</span>
            <p className="text-xs text-zinc-400">Execute the SQL commands in <code className="font-mono text-zinc-700 dark:text-zinc-300">supabase/schema.sql</code>.</p>
          </div>

          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="text-xs font-semibold">3. Add API Keys to .env</span>
            <div className="relative">
              <pre className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded-lg text-xs font-mono text-zinc-800 dark:text-zinc-200 overflow-x-auto border border-zinc-200 dark:border-zinc-800">
                {sampleEnv}
              </pre>
              <button 
                onClick={() => copyToClipboard(sampleEnv)}
                className="absolute top-2 right-2 p-1 bg-white dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded border border-zinc-200 dark:border-zinc-700"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
