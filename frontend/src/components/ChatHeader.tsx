import React from "react";

interface ChatHeaderProps {
  title?: string;
  userName?: string;
}

export default function ChatHeader({
  title = "Chat Interface",
  userName = "Guest",
}: ChatHeaderProps) {
  return (
    <div className="border-b border-gray-300 bg-gray-50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-bold text-gray-800 font-sans">{title}</h1>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 border border-gray-400 flex items-center justify-center text-sm font-bold text-gray-600">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-700 font-sans">{userName}</span>
        </div>
      </div>
    </div>
  );
}
