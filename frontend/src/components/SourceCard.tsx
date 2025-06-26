import React from 'react';

interface SourceCardProps {
  url: string;
  index: number;
}

export default function SourceCard({ url, index }: SourceCardProps) {
  // Extract the filename from the URL
  const filename = url.split('/').pop()?.replace('.html', '') || url;
  const displayUrl = url.startsWith('http') ? url : `https://paulgraham.com/${url}`;
  
  return (
    <a
      href={displayUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 transition-colors"
    >
      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
        {index}
      </div>
      <span className="text-sm text-gray-700 truncate">{filename}</span>
    </a>
  );
}