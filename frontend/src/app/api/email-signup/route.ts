import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    console.log("Email signup attempt:", email);
    console.log("Supabase URL configured:", !!supabaseUrl);
    console.log("Supabase key configured:", !!supabaseAnonKey);

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log("Supabase not configured, logging email:", email.trim());
      return NextResponse.json({
        success: true,
        message: "Email signup recorded (logged only)",
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get client info for tracking
    const userAgent = req.headers.get("user-agent") || "";
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ipAddress = forwarded?.split(",")[0]?.trim() || realIp || "unknown";

    console.log("Attempting to insert into Supabase...");

    const { error } = await supabase.from("email_signups").insert({
      email: email.trim().toLowerCase(),
      source: "paul_graham_chat",
      user_agent: userAgent,
      ip_address: ipAddress,
    });

    if (error) {
      console.error("Supabase insert error:", error);

      // Handle duplicate email gracefully
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json({
          success: true,
          message: "Email already registered",
        });
      }

      return NextResponse.json(
        {
          error: `Failed to save email signup: ${error.message}`,
        },
        { status: 500 }
      );
    }

    console.log("Supabase insert successful");

    return NextResponse.json({
      success: true,
      message: "Email signup successful",
    });
  } catch (error) {
    console.error("Email signup error:", error);
    return NextResponse.json(
      {
        error: "Failed to process email signup",
      },
      { status: 500 }
    );
  }
}
