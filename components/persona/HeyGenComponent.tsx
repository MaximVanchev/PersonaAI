"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from "lucide-react";
import StreamingAvatar, { StartAvatarRequest } from "@heygen/streaming-avatar";

interface HeyGenComponentProps {
  messages: any[];
}

export function HeyGenComponent({ messages }: HeyGenComponentProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const avatarApiRef = useRef<StreamingAvatar | null>(null);
  const lastSpokenMessageRef = useRef<string | null>(null);

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

  // Set API key directly - SDK handles session creation internally
  useEffect(() => {
    // SDK will use this API key to create sessions internally
    const apiKey = process.env.NEXT_PUBLIC_HEYGEN_API_KEY;
    if (apiKey) {
      setSessionToken(apiKey);
    } else {
      setError("HeyGen API key not configured in environment");
    }
  }, []);

  // Start avatar session
  const startAvatar = useCallback(async () => {
    if (!sessionToken) {
      setError("HeyGen session token not available");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Initialize StreamingAvatar with API key - SDK handles session creation
      avatarApiRef.current = new StreamingAvatar({
        token: sessionToken, // This should be the API key
      });

      const startRequest: StartAvatarRequest = {
        avatarName: heygenConfig.avatarId,
        quality: heygenConfig.quality as any,
        language: heygenConfig.language,
        disableIdleTimeout: true,
        useSilencePrompt: true,
        // Disable knowledge base and conversational AI
        knowledgeId: undefined,
        knowledgeBase: undefined,
      };

      console.log("Starting avatar with request:", startRequest);
      const response =
        await avatarApiRef.current.createStartAvatar(startRequest);
      console.log("Avatar createStartAvatar response:", response);

      // Connect the video element to the media stream
      if (avatarApiRef.current.mediaStream && videoRef.current) {
        videoRef.current.srcObject = avatarApiRef.current.mediaStream;
        console.log("Connected media stream to video element");
      } else {
        console.warn("No media stream available or video ref missing");
      }

      setIsConnected(true);
      console.log("Avatar started successfully", response);
    } catch (err: any) {
      console.error("Failed to start avatar:", err);
      console.error("Error details:", err.message, err.status, err.body);
      setError(
        `Failed to connect to avatar: ${err.message || "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [sessionToken, heygenConfig]);

  // Stop avatar session
  const stopAvatar = useCallback(async () => {
    if (!avatarApiRef.current) return;

    try {
      await avatarApiRef.current.stopAvatar();
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
        await avatarApiRef.current.speak({
          text,
          taskType: "repeat", // Force repeat mode to avoid AI generation
        });
        console.log("Avatar speaking (repeat mode):", text);
      } catch (err) {
        console.error("Failed to make avatar speak:", err);
        setError("Failed to make avatar speak");
      } finally {
        setIsSpeaking(false);
      }
    },
    [isConnected]
  );

  // Auto-start avatar when session token is ready
  useEffect(() => {
    if (sessionToken && !isConnected && !isLoading) {
      startAvatar();
    }
  }, [sessionToken, isConnected, isLoading, startAvatar]);

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

  // Auto-speak assistant messages when avatar connects or new messages arrive
  useEffect(() => {
    if (!isConnected || !messages.length || isSpeaking) return;

    const lastMessage = messages[messages.length - 1];

    // Only speak if it's an assistant message and we haven't spoken it before
    if (
      lastMessage &&
      lastMessage.content &&
      lastMessage.role === "assistant" &&
      lastSpokenMessageRef.current !== lastMessage.content
    ) {
      console.log("Auto-speaking assistant message:", lastMessage.content);
      lastSpokenMessageRef.current = lastMessage.content;

      // Add a small delay to ensure avatar is fully ready
      setTimeout(() => {
        speakText(lastMessage.content);
      }, 500);
    }
  }, [messages, isConnected, isSpeaking]);

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
