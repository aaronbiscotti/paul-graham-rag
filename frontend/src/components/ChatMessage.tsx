import React from "react";
import { Message } from "@/types/Message";
import SourceCard from "./SourceCard";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === "user";

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className={`mb-6 ${isUser ? "text-right" : "text-left"}`}>
      <div className={`inline-block max-w-xs md:max-w-md lg:max-w-lg`}>
        <div className="mb-1">
          <span className="text-xs text-gray-600 font-sans font-bold">
            {isUser ? "You" : "Assistant"}
          </span>
          <span className="text-xs text-gray-500 font-sans ml-2">
            {formatTime(message.timestamp)}
          </span>
        </div>

        <div
          className={`
            border-2 px-4 py-3 font-sans text-base leading-relaxed
            ${
              isUser
                ? "bg-blue-100 border-blue-300 text-blue-900"
                : "bg-gray-100 border-gray-300 text-gray-800"
            }
          `}
        >
          {message.content}
        </div>
        
        {message.sources && message.sources.length > 0 && !isUser && (
          <div className="mt-3">
            <div className="text-xs text-gray-600 mb-2">Sources:</div>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source, index) => (
                <SourceCard key={source} url={source} index={index + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
