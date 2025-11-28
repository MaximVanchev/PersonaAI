"use client";

import { MessageDto, PersonaChatDto } from "@/types/index.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ChatUIComponentProps {
  persona: PersonaChatDto;
  selectedConversationId: number | null;
  messages: MessageDto[];
  input: string;
  setInput: (value: string) => void;
  loadingMessages: boolean;
  sending: boolean;
  onSendMessage: () => void;
}

export function ChatUIComponent({
  persona,
  selectedConversationId,
  messages,
  input,
  setInput,
  loadingMessages,
  sending,
  onSendMessage,
}: ChatUIComponentProps) {
  const [showMessages, setShowMessages] = useState(true);
  return (
    <div className="flex-1 flex flex-col bg-gray-900 border border-gray-700 p-5 rounded-lg shadow-2xl overflow-hidden">
      {/* Desktop header */}
      <div className="hidden md:flex border-b border-gray-700 pb-3 mb-4 mx-4 mt-4 items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-100">
            {persona.name}
          </h3>
          <p className="text-xs text-gray-400">
            {persona.role} • {persona.tone || "Neutral"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Toggle Switch */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Messages</span>
            <button
              onClick={() => setShowMessages(!showMessages)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showMessages ? "bg-gray-600" : "bg-indigo-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showMessages ? "translate-x-1" : "translate-x-6"
                }`}
              />
            </button>
            <span className="text-xs text-gray-400">Video Avatar</span>
          </div>
          {selectedConversationId && (
            <span className="text-xs text-gray-500">
              #{selectedConversationId}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 p-4 md:p-0">
        {showMessages ? (
          <>
            {loadingMessages && (
              <div className="text-sm text-gray-400 animate-pulse flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                Loading messages...
              </div>
            )}
            {!loadingMessages && messages.length === 0 && (
              <div className="text-sm text-gray-400 text-center py-8">
                {selectedConversationId
                  ? "No messages yet. Start the conversation below! 💬"
                  : "Select or create a conversation to begin chatting."}
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] md:max-w-[75%] rounded-lg px-4 py-3 text-sm shadow-lg ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white self-end ml-auto"
                    : m.role === "assistant"
                      ? "bg-gradient-to-br from-gray-700 to-gray-800 text-gray-100 border border-gray-600"
                      : "bg-gradient-to-br from-yellow-600 to-yellow-700 text-yellow-50"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {m.content}
                </p>
                <div className="text-[10px] mt-2 opacity-70 text-right">
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
            {sending && (
              <div className="max-w-[85%] md:max-w-[75%] rounded-lg px-4 py-3 text-sm shadow-lg bg-gradient-to-br from-gray-700 to-gray-800 text-gray-100 border border-gray-600">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                  <span className="text-gray-400 text-xs">typing...</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-2xl font-bold text-gray-100 mb-2">
                Heygen Mode
              </h3>
              <p className="text-gray-400 text-sm">
                Heygen integration will be displayed here
              </p>
              <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
                <p className="text-gray-300 text-sm">
                  Video avatar feature coming soon...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSendMessage();
        }}
        className="flex gap-3 pt-4 border-t border-gray-700 px-4 pb-4 md:px-0 md:pb-0"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            selectedConversationId
              ? "Type your message..."
              : "Create/select a conversation first"
          }
          disabled={sending || !selectedConversationId}
          className="flex-1 text-sm md:text-base bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
        />
        <Button
          type="submit"
          disabled={sending || !selectedConversationId || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-400 px-6"
        >
          Send
        </Button>
      </form>
    </div>
  );
}
