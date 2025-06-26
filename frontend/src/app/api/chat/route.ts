import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Forward to Python backend
    const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: message.trim() }),
    });

    if (!backendResponse.ok) {
      throw new Error("Backend request failed");
    }

    const data = await backendResponse.json();

    // Save chat message to database (if Supabase is configured)
    if (supabaseUrl && supabaseAnonKey && data.success) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Get client info
        const userAgent = req.headers.get("user-agent") || "";
        const forwarded = req.headers.get("x-forwarded-for");
        const realIp = req.headers.get("x-real-ip");
        const ipAddress =
          forwarded?.split(",")[0]?.trim() || realIp || "unknown";

        // Insert chat message (no .select() to avoid RLS policy conflict)
        await supabase.from("chat_messages").insert({
          user_message: message.trim(),
          ai_response: data.response || "",
          sources: data.sources || null,
          user_agent: userAgent,
          ip_address: ipAddress,
        });

        console.log("Chat message saved to database");
      } catch (dbError) {
        console.error("Failed to save chat message:", dbError);
        // Don't fail the request if database save fails
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
