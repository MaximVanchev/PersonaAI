export async function createHeyGenSession(): Promise<{
  token: string;
  expires_at?: string;
}> {
  const resp = await fetch("/api/heygen/session", {
    method: "POST",
  });

  const json = await resp.json();

  if (!resp.ok) {
    throw new Error(json.error || "Failed to create HeyGen session");
  }

  const token = json.token;
  if (!token) {
    console.warn("HeyGen session response did not include token:", json);
    throw new Error("No token received from HeyGen session");
  }

  return {
    token,
    expires_at: json.expires_at,
  };
}
