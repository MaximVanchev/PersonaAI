import { NextResponse } from "next/server";

export async function POST() {
  try {
    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server HEYGEN_API_KEY is not set" },
        { status: 500 }
      );
    }

    // Per HeyGen Streaming Avatar SDK docs, create a streaming access token
    const resp = await fetch(
      "https://api.heygen.com/v1/streaming.create_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": apiKey,
        },
      }
    );

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("HeyGen API error:", errorText);
      return NextResponse.json(
        { error: `HeyGen API error: ${errorText}` },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    console.log("HeyGen token response:", data);

    // The response should contain a token for SDK initialization
    if (!data.data?.token) {
      console.error("No token in response data:", data);
      return NextResponse.json(
        { error: "No token received from HeyGen API" },
        { status: 500 }
      );
    }

    const result = {
      token: data.data.token,
      expires_at: data.data.expires_at,
    };
    console.log("Returning token result:", result);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Session creation error:", err);
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
