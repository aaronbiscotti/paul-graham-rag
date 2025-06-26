"use client";

import React, { useState, useRef, KeyboardEvent } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({
  onSendMessage,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="bg-gray-50 border-t border-gray-300 px-6 py-4">
      <div className="flex space-x-3">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            disabled={disabled}
            rows={1}
            className={`
              w-full px-3 py-2 border-2 border-gray-400 bg-white text-gray-800 
              font-sans text-base resize-none min-h-[2.5rem] max-h-32
              focus:outline-none focus:border-blue-500
              ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
            `}
            style={{
              fontFamily: "Arial, sans-serif",
              lineHeight: "1.4",
            }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={`
            px-6 py-2 border-2 font-sans text-base font-bold
            transition-colors duration-150
            ${
              disabled || !message.trim()
                ? "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-blue-200 border-blue-400 text-blue-800 hover:bg-blue-300 active:bg-blue-400 cursor-pointer"
            }
          `}
        >
          Send
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-500 font-sans">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}
