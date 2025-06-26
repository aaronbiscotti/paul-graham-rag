import React from 'react';

interface StreamingMessageProps {
  content: string;
  isComplete: boolean;
}

export default function StreamingMessage({ content, isComplete }: StreamingMessageProps) {
  return (
    <div className="flex items-start space-x-2">
      <div className="flex-1">
        <div className="prose prose-gray max-w-none">
          {content}
          {!isComplete && (
            <span className="inline-block w-2 h-4 bg-gray-600 animate-pulse ml-1" />
          )}
        </div>
      </div>
    </div>
  );
}