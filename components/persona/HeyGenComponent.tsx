"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from "lucide-react";

interface HeyGenComponentProps {
  messages: any[];
}

interface StreamingAvatarApi {
  createStartAvatar: (config: any) => Promise<void>;
  speak: (text: string) => Promise<void>;
  closeAvatar: () => Promise<void>;
}

declare global {
  interface Window {
    StreamingAvatarApi: new (config: any) => StreamingAvatarApi;
  }
}

export function HeyGenComponent({ messages }: HeyGenComponentProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const avatarApiRef = useRef<StreamingAvatarApi | null>(null);

  // HeyGen configuration
  const heygenConfig = {
    apiKey: process.env.NEXT_PUBLIC_HEYGEN_API_KEY!,
    serverUrl:
      process.env.NEXT_PUBLIC_HEYGEN_SERVER_URL || "wss://api.heygen.com",
    avatarId:
      process.env.NEXT_PUBLIC_HEYGEN_FEMALE_AVATAR ||
      process.env.NEXT_PUBLIC_HEYGEN_MALE_AVATAR!,
    quality: "high",
    language: "en",
  };

  // Initialize HeyGen SDK with retries/fallback URLs
  useEffect(() => {
    const loadHeyGenSDK = async () => {
      try {
        if (window.StreamingAvatarApi) {
          setSdkReady(true);
          return;
        }

        const candidateUrls = [
          "https://resource.heygen.ai/streaming-avatar/streaming_avatar.js",
          // Fallback CDN candidates
          "https://cdn.heygen.com/streaming-avatar/streaming_avatar.js",
          "https://static.heygen.com/streaming-avatar/streaming_avatar.js",
        ];

        let loaded = false;
        for (const url of candidateUrls) {
          await new Promise<void>((resolve) => {
            const script = document.createElement("script");
            script.src = url;
            script.async = true;
            script.onload = () => {
              console.log("HeyGen SDK loaded successfully from:", url);
              loaded = true;
              setSdkReady(true);
              resolve();
            };
            script.onerror = () => {
              console.warn("Failed to load HeyGen SDK from:", url);
              resolve();
            };
            document.head.appendChild(script);
          });
          if (loaded) break;
        }

        if (!loaded) {
          setError(
            "Unable to load HeyGen SDK. Check network/DNS and allowlist the SDK URL."
          );
        }
      } catch (err) {
        console.error("Failed to load HeyGen SDK:", err);
        setError("Failed to load HeyGen SDK");
      }
    };

    loadHeyGenSDK();
  }, []);

  // Fetch server-side session token per HeyGen Quick Start
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const resp = await fetch("/api/heygen/session");
        const json = await resp.json();
        if (resp.ok) {
          // Common patterns: json.token or json.data.token
          const token =
            json.token ||
            json.data?.token ||
            json.session_token ||
            json.access_token;
          if (!token) {
            console.warn(
              "HeyGen session response did not include token:",
              json
            );
          }
          setSessionToken(token || null);
        } else {
          setError(json.error || "Failed to create HeyGen session");
        }
      } catch (e: any) {
        setError(e?.message || "Failed to call HeyGen session endpoint");
      }
    };
    fetchSession();
  }, []);

  // Start avatar session
  const startAvatar = useCallback(async () => {
    if (!window.StreamingAvatarApi) {
      setError("HeyGen SDK not loaded");
      return;
    }
    if (!sessionToken) {
      setError("HeyGen session token not available");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Per Quick Start, constructor typically accepts token / signaling config
      avatarApiRef.current = new window.StreamingAvatarApi({
        token: sessionToken,
        serverUrl: heygenConfig.serverUrl,
      });

      await avatarApiRef.current.createStartAvatar({
        avatar_id: heygenConfig.avatarId,
        quality: heygenConfig.quality,
        language: heygenConfig.language,
        video_element: videoRef.current,
      });

      setIsConnected(true);
      console.log("Avatar started successfully");
    } catch (err) {
      console.error("Failed to start avatar:", err);
      setError("Failed to connect to avatar");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Stop avatar session
  const stopAvatar = useCallback(async () => {
    if (!avatarApiRef.current) return;

    try {
      await avatarApiRef.current.closeAvatar();
      avatarApiRef.current = null;
      setIsConnected(false);
      console.log("Avatar stopped successfully");
    } catch (err) {
      console.error("Failed to stop avatar:", err);
      setError("Failed to disconnect avatar");
    }
  }, []);

  // Make avatar speak
  const speakText = useCallback(
    async (text: string) => {
      if (!avatarApiRef.current || !isConnected) {
        console.warn("Avatar not connected");
        return;
      }

      setIsSpeaking(true);
      try {
        await avatarApiRef.current.speak(text);
        console.log("Avatar speaking:", text);
      } catch (err) {
        console.error("Failed to make avatar speak:", err);
        setError("Failed to make avatar speak");
      } finally {
        setIsSpeaking(false);
      }
    },
    [isConnected]
  );

  // Auto-start avatar after SDK and session are ready
  useEffect(() => {
    if (sdkReady && sessionToken && !isConnected && !isLoading) {
      startAvatar();
    }
  }, [sdkReady, sessionToken, isConnected, isLoading, startAvatar]);

  // Log when video element receives a stream (if SDK attaches MediaStream)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handler = () => {
      console.log("Video element readyState:", video.readyState);
    };
    video.addEventListener("loadeddata", handler);
    return () => video.removeEventListener("loadeddata", handler);
  }, []);

  // Auto-speak last message when messages change or when avatar connects
  useEffect(() => {
    if (!isConnected || !messages.length || isSpeaking) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.content) {
      speakText(lastMessage.content);
    }
  }, [messages, isConnected, isSpeaking, speakText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (avatarApiRef.current && isConnected) {
        stopAvatar();
      }
    };
  }, [isConnected, stopAvatar]);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Video Avatar Container */}
      <div className="flex-1 relative bg-black rounded-lg overflow-hidden mb-4">
        {!isConnected && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                AI Avatar
              </h3>
              <p className="text-gray-400 text-sm">
                Avatar will start automatically...
              </p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-white">Connecting to avatar...</p>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${!isVideoEnabled ? "hidden" : ""}`}
          autoPlay
          playsInline
          muted={!isAudioEnabled}
        />

        {/* Video Controls Overlay */}
        {isConnected && (
          <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className="bg-gray-800/80 hover:bg-gray-700/80"
            >
              {isVideoEnabled ? (
                <Video className="w-4 h-4" />
              ) : (
                <VideoOff className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className="bg-gray-800/80 hover:bg-gray-700/80"
            >
              {isAudioEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsMicEnabled(!isMicEnabled)}
              className="bg-gray-800/80 hover:bg-gray-700/80"
            >
              {isMicEnabled ? (
                <Mic className="w-4 h-4" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={stopAvatar}
              className="bg-red-600/80 hover:bg-red-700/80"
            >
              Disconnect
            </Button>
          </div>
        )}

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="absolute top-4 left-4 bg-green-500/80 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Speaking...
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="absolute top-4 right-4 bg-red-500/80 text-white px-3 py-1 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Avatar Status */}
      <div className="mt-2 text-xs text-center">
        <span
          className={`inline-flex items-center gap-1 ${
            isConnected ? "text-green-400" : "text-gray-500"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-400" : "bg-gray-500"
            }`}
          ></div>
          {isConnected ? "Avatar Connected" : "Avatar Disconnected"}
        </span>
      </div>
    </div>
  );
}
