export interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  type: "text";
  sources?: string[];
}

export type MessageSender = "user" | "ai";
