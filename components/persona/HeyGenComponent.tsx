"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";
import StreamingAvatar, {
  StartAvatarRequest,
  TaskType,
} from "@heygen/streaming-avatar";

interface HeyGenComponentProps {
  messages: any[];
  gender: string;
  onSwitchToChat?: () => void;
  selectedConversationId?: number | null;
}

export function HeyGenComponent({
  messages,
  gender,
  onSwitchToChat,
  selectedConversationId,
}: HeyGenComponentProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const avatarApiRef = useRef<StreamingAvatar | null>(null);
  const lastSpokenMessageRef = useRef<string | null>(null);
  const connectionCheckRef = useRef<NodeJS.Timeout | null>(null);

  // HeyGen configuration
  const heygenConfig = {
    apiKey: process.env.NEXT_PUBLIC_HEYGEN_API_KEY!,
    serverUrl:
      process.env.NEXT_PUBLIC_HEYGEN_SERVER_URL || "wss://api.heygen.com",
    avatarId:
      gender === "female"
        ? process.env.NEXT_PUBLIC_HEYGEN_FEMALE_AVATAR!
        : process.env.NEXT_PUBLIC_HEYGEN_MALE_AVATAR!,
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
      const errorMessage = "HeyGen API key not configured in environment";
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

      // Add event listeners for connection status
      avatarApiRef.current.on("avatar_stop_talking", () => {
        setIsSpeaking(false);
      });

      avatarApiRef.current.on("stream_disconnected", () => {
        console.log("Avatar stream disconnected");
        setIsConnected(false);
        // Switch to messages when avatar disconnects
        if (onSwitchToChat) {
          onSwitchToChat();
        }
      });

      avatarApiRef.current.on("stream_ready", () => {
        console.log("Avatar stream ready");
      });

      // Catch DataChannel errors
      avatarApiRef.current.on("error", (error: any) => {
        console.log("Avatar error caught:", error);
        if (
          error &&
          (error.message?.includes("DataChannel") ||
            error.type?.includes("DataChannel"))
        ) {
          console.log("DataChannel error detected, handling gracefully");
          setError("Connection lost due to inactivity");
          setIsConnected(false);
          if (onSwitchToChat) {
            onSwitchToChat();
          }
        }
      });

      // Catch connection state changes (only handle critical failures)
      avatarApiRef.current.on("connection_state_changed", (state: any) => {
        console.log("Avatar connection state changed:", state);
        // Only disconnect on actual failures, not normal idle states
        if (state === "failed") {
          console.log("Connection state indicates failure, switching to chat");
          setIsConnected(false);
          if (onSwitchToChat) {
            onSwitchToChat();
          }
        }
      });

      const startRequest: StartAvatarRequest = {
        avatarName: heygenConfig.avatarId,
        quality: heygenConfig.quality as any,
        language: heygenConfig.language,
        disableIdleTimeout: true,
        useSilencePrompt: false, // Allow silence without prompting
        // Disable knowledge base and conversational AI
        knowledgeId: undefined,
        knowledgeBase: undefined,
        // Additional settings to prevent disconnection
        voice: {
          rate: 1.0,
          emotion: "neutral",
        },
      };

      console.log("Starting avatar with request:", startRequest);
      const response =
        await avatarApiRef.current.createStartAvatar(startRequest);
      console.log("Avatar createStartAvatar response:", response);

      // Wait for media stream to be available
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds with 100ms intervals

      while (attempts < maxAttempts) {
        if (
          avatarApiRef.current &&
          avatarApiRef.current.mediaStream &&
          videoRef.current
        ) {
          videoRef.current.srcObject = avatarApiRef.current.mediaStream;
          console.log("Connected media stream to video element");
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      if (attempts >= maxAttempts) {
        console.warn("Media stream not available after waiting");
      }

      setIsConnected(true);
      console.log("Avatar started successfully", response);

      // Start connection health check (reduced frequency to avoid interference)
      connectionCheckRef.current = setInterval(() => {
        if (avatarApiRef.current && isConnected) {
          try {
            // Only check for critical connection failures, not inactivity
            const connectionState = avatarApiRef.current.connectionState;
            if (connectionState === "failed") {
              console.log(
                "Connection health check failed, state:",
                connectionState
              );
              setIsConnected(false);
              if (onSwitchToChat) {
                onSwitchToChat();
              }
              if (connectionCheckRef.current) {
                clearInterval(connectionCheckRef.current);
              }
            }
          } catch (error) {
            console.log("Connection health check error:", error);
            // Don't automatically disconnect on health check errors
          }
        }
      }, 30000); // Check every 30 seconds (less frequent)
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
      // Clear connection check interval
      if (connectionCheckRef.current) {
        clearInterval(connectionCheckRef.current);
        connectionCheckRef.current = null;
      }

      await avatarApiRef.current.stopAvatar();
      avatarApiRef.current = null;
      setIsConnected(false);
      console.log("Avatar stopped successfully");
    } catch (err) {
      console.error("Failed to stop avatar:", err);
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
          taskType: TaskType.REPEAT, // Force repeat mode to avoid AI generation
        });
        console.log("Avatar speaking (repeat mode):", text);
      } catch (err) {
        console.error("Failed to make avatar speak:", err);
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

  // Disconnect avatar and switch to chat when conversation changes to null (deleted)
  useEffect(() => {
    if (selectedConversationId === null && isConnected) {
      console.log(
        "Conversation deleted, disconnecting avatar and switching to chat"
      );
      stopAvatar();
      if (onSwitchToChat) {
        onSwitchToChat();
      }
    }
  }, [selectedConversationId, isConnected, stopAvatar, onSwitchToChat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectionCheckRef.current) {
        clearInterval(connectionCheckRef.current);
      }
      if (avatarApiRef.current && isConnected) {
        stopAvatar();
      }
    };
  }, [isConnected, stopAvatar]);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Video Avatar Container */}
      <div className="flex-1 relative bg-black rounded-lg overflow-hidden mb-2 md:mb-4">
        {!isConnected && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                AI Avatar
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {error
                  ? "Connection failed"
                  : "Avatar will start automatically..."}
              </p>
              {error && (
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    onClick={startAvatar}
                    className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
                    size="sm"
                  >
                    Reconnect
                  </Button>
                  {onSwitchToChat && (
                    <Button
                      onClick={onSwitchToChat}
                      variant="secondary"
                      className="bg-gray-600 hover:bg-gray-700 w-full sm:w-auto"
                      size="sm"
                    >
                      Switch to Chat
                    </Button>
                  )}
                </div>
              )}
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
          className={`w-full h-full object-cover`}
          autoPlay
          playsInline
          muted={!isAudioEnabled}
        />

        {/* Avatar Controls */}
        {isConnected && (
          <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 flex gap-2">
            {/* Repeat Last Message Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const lastMessage = messages[messages.length - 1];
                if (
                  lastMessage &&
                  lastMessage.role === "assistant" &&
                  lastMessage.content
                ) {
                  speakText(lastMessage.content);
                }
              }}
              disabled={
                !messages.length ||
                messages[messages.length - 1]?.role !== "assistant" ||
                isSpeaking
              }
              className="bg-gray-800/90 hover:bg-gray-700/90 w-10 h-10 md:w-auto md:h-auto p-2 md:p-3 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Repeat last message"
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </Button>

            {/* Mute Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className="bg-gray-800/90 hover:bg-gray-700/90 w-10 h-10 md:w-auto md:h-auto p-2 md:p-3"
              title={isAudioEnabled ? "Mute audio" : "Unmute audio"}
            >
              {isAudioEnabled ? (
                <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
              ) : (
                <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-white" />
              )}
            </Button>
          </div>
        )}

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-green-500/90 text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm flex items-center gap-1 md:gap-2">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
            <span className="hidden sm:inline">Speaking...</span>
            <span className="sm:hidden">🗣️</span>
          </div>
        )}
      </div>

      {/* Avatar Status */}
      <div className="mt-1 md:mt-2 text-xs md:text-sm text-center">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
            isConnected
              ? "text-green-400 bg-green-400/10"
              : "text-gray-500 bg-gray-500/10"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
              isConnected ? "bg-green-400" : "bg-gray-500"
            }`}
          ></div>
          <span className="hidden sm:inline">
            {isConnected ? "Avatar Connected" : "Avatar Disconnected"}
          </span>
          <span className="sm:hidden">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </span>
      </div>
    </div>
  );
}
