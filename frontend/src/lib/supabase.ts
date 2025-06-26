import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://placeholder.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "placeholder-key";

if (!supabaseUrl.includes("supabase.co") || supabaseKey === "placeholder-key") {
  console.warn("Supabase environment variables not configured properly");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface User {
  id: string;
  username: string;
  email?: string;
  is_verified: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title?: string;
  messages: Array<{
    id: string;
    type: "user" | "paul";
    parts: Array<{
      id: string;
      content: string;
      isVisible: boolean;
    }>;
    timestamp: Date;
    isComplete: boolean;
    sources?: Array<{
      title: string;
      url: string;
      text: string;
      category: string;
      similarity: number;
    }>;
  }>;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface RateLimit {
  id: string;
  user_id?: string;
  ip_address?: string;
  message_count: number;
  last_message_at: string;
  reset_at: string;
}
