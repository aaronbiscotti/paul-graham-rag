"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import EmailSignup from "@/components/EmailSignup";

interface Source {
  title: string;
  url: string;
  text: string;
  category: string;
  similarity: number;
}

interface MessagePart {
  id: string;
  content: string;
  isVisible: boolean;
}

interface Message {
  id: string;
  type: "user" | "paul";
  parts: MessagePart[];
  sources?: Source[];
  timestamp: Date;
  isComplete: boolean;
}

interface ChatResponse {
  response: string;
  sources: Source[];
  success: boolean;
  error?: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "paul",
      parts: [
        {
          id: "1-1",
          content: "Talk to me about startups, programming, essays, or art.",
          isVisible: true,
        },
      ],
      timestamp: new Date(),
      isComplete: true,
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSignupOpen, setEmailSignupOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const splitIntoSentences = (text: string): string[] => {
    const paragraphs = text.split(/\n\n+/);
    const sentences: string[] = [];

    for (const paragraph of paragraphs) {
      if (paragraph.trim()) {
        const paraText = paragraph.trim();
        if (paraText.length < 200) {
          sentences.push(paraText);
        } else {
          const parts = paraText.split(/(?<=[.!?])\s+/);
          let currentChunk = "";

          for (const part of parts) {
            if (currentChunk.length + part.length < 300) {
              currentChunk += (currentChunk ? " " : "") + part;
            } else {
              if (currentChunk) sentences.push(currentChunk);
              currentChunk = part;
            }
          }
          if (currentChunk) sentences.push(currentChunk);
        }
      }
    }

    return sentences.filter((s) => s.trim().length > 0);
  };

  const displayPartsSequentially = async (
    messageId: string,
    parts: string[]
  ) => {
    setTimeout(() => scrollToBottom(), 100);

    for (let i = 0; i < parts.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, i === 0 ? 500 : 1500));

      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg.id === messageId) {
            const updatedParts = [...msg.parts];
            if (updatedParts[i]) {
              updatedParts[i] = { ...updatedParts[i], isVisible: true };
            }
            return { ...msg, parts: updatedParts };
          }
          return msg;
        })
      );
    }

    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, isComplete: true } : msg
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      parts: [
        {
          id: `${Date.now()}-1`,
          content: currentMessage.trim(),
          isVisible: true,
        },
      ],
      timestamp: new Date(),
      isComplete: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.parts[0].content,
        }),
      });

      const data: ChatResponse = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to get response");
        return;
      }

      const responseId = (Date.now() + 1).toString();
      const sentenceParts = splitIntoSentences(data.response);

      const paulMessage: Message = {
        id: responseId,
        type: "paul",
        parts: sentenceParts.map((sentence, index) => ({
          id: `${responseId}-${index}`,
          content: sentence,
          isVisible: false,
        })),
        sources: data.sources,
        timestamp: new Date(),
        isComplete: false,
      };

      setMessages((prev) => [...prev, paulMessage]);
      displayPartsSequentially(responseId, sentenceParts);
    } catch (error) {
      console.error("Chat error:", error);
      setError(
        "Error connecting to server. Please ensure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="chat-container">
      <div className="chat-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          className="header-content"
        >
          <h1>ChatPGT (Paul Graham Transformer)</h1>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={() => setEmailSignupOpen(true)}
              className="send-button"
              style={{ fontSize: "12px", padding: "4px 8px" }}
            >
              Get Updates
            </button>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className="message-group">
            {message.parts.map(
              (part) =>
                part.isVisible && (
                  <div key={part.id} className={`message ${message.type}`}>
                    <div className="message-content">
                      <div className="message-text">
                        <ReactMarkdown>{part.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )
            )}
            {message.sources &&
              message.sources.length > 0 &&
              message.isComplete && (
                <div className="message paul">
                  <div className="sources-container">
                    <div className="sources-header">Sources</div>
                    <div className="sources-list">
                      {message.sources.map((source, index) => (
                        <a
                          key={index}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="source-link"
                        >
                          <span className="source-number">{index + 1}</span>
                          <span className="source-title">{source.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
          </div>
        ))}

        {loading && (
          <div className="message paul">
            <div className="message-content">
              <div className="loading">Thinking</div>
            </div>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input">
        <input
          ref={inputRef}
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Ask Paul anything..."
          className="message-input"
          disabled={loading}
        />
        <button
          type="submit"
          className="send-button"
          disabled={loading || !currentMessage.trim()}
        >
          Send
        </button>
      </form>

      <EmailSignup
        isOpen={emailSignupOpen}
        onClose={() => setEmailSignupOpen(false)}
      />

      <div className="disclaimer">
        Made by{" "}
        <a
          href="https://www.linkedin.com/in/aarontang1/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Aaron Tang
        </a>
        . Not affiliated with Paul Graham.
      </div>
    </main>
  );
}
