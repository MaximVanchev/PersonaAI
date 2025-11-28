"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from "lucide-react";

interface HeyGenComponentProps {
  persona: {
    name: string;
    role: string;
    tone?: string;
  };
  selectedConversationId: number | null;
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  sending: boolean;
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

export function HeyGenComponent({
  persona,
  selectedConversationId,
  input,
  setInput,
  onSendMessage,
  sending,
}: HeyGenComponentProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const avatarApiRef = useRef<StreamingAvatarApi | null>(null);

  // HeyGen configuration
  const heygenConfig = {
    apiKey: process.env.NEXT_PUBLIC_HEYGEN_API_KEY || "your-heygen-api-key",
    serverUrl:
      process.env.NEXT_PUBLIC_HEYGEN_SERVER_URL || "wss://api.heygen.com",
    avatarId: "default-avatar-id", // You can make this configurable per persona
    quality: "high",
    language: "en",
  };

  // Initialize HeyGen SDK
  useEffect(() => {
    const loadHeyGenSDK = async () => {
      try {
        // Load HeyGen SDK script if not already loaded
        if (!window.StreamingAvatarApi) {
          const script = document.createElement("script");
          script.src = "https://sdk.heygen.com/streaming-avatar.js";
          script.async = true;
          script.onload = () => {
            console.log("HeyGen SDK loaded successfully");
          };
          document.head.appendChild(script);
        }
      } catch (err) {
        console.error("Failed to load HeyGen SDK:", err);
        setError("Failed to load HeyGen SDK");
      }
    };

    loadHeyGenSDK();
  }, []);

  // Start avatar session
  const startAvatar = useCallback(async () => {
    if (!window.StreamingAvatarApi) {
      setError("HeyGen SDK not loaded");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      avatarApiRef.current = new window.StreamingAvatarApi({
        token: heygenConfig.apiKey,
        serverUrl: heygenConfig.serverUrl,
      });

      await avatarApiRef.current.createStartAvatar({
        avatarName: heygenConfig.avatarId,
        quality: heygenConfig.quality,
        language: heygenConfig.language,
        videoElement: videoRef.current,
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

  // Handle message sending with avatar speech
  const handleSendMessage = useCallback(() => {
    onSendMessage();
    // You can integrate this with your chat system to make the avatar speak responses
    // For example: speakText(responseText);
  }, [onSendMessage]);

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
                {persona.name} Avatar
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Start video chat with your AI persona
              </p>
              <Button
                onClick={startAvatar}
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading ? "Connecting..." : "Start Video Chat"}
              </Button>
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

      {/* Chat Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-3 pt-4 border-t border-gray-700"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isConnected
              ? "Type your message to the avatar..."
              : selectedConversationId
                ? "Connect avatar first to start video chat"
                : "Create/select a conversation first"
          }
          disabled={sending || !selectedConversationId || !isConnected}
          className="flex-1 text-sm md:text-base bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
        />
        <Button
          type="submit"
          disabled={
            sending || !selectedConversationId || !input.trim() || !isConnected
          }
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-400 px-6"
        >
          {sending ? "Sending..." : "Send"}
        </Button>
      </form>

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
