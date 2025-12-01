import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server HEYGEN_API_KEY is not set" },
        { status: 500 }
      );
    }

    // Per HeyGen Quick Start, request a streaming avatar session
    const resp = await fetch("https://api.heygen.com/v1/streaming.new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        // You can pass avatar_id here or in client start depending on SDK
        avatar_id:
          process.env.NEXT_PUBLIC_HEYGEN_FEMALE_AVATAR ||
          process.env.NEXT_PUBLIC_HEYGEN_MALE_AVATAR,
        // Optionally configure voice, language, quality
        quality: "high",
        language: "en",
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return NextResponse.json(
        { error: `HeyGen API error: ${txt}` },
        { status: 500 }
      );
    }

    const data = await resp.json();
    // Expect data to include session token or client config for SDK
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
