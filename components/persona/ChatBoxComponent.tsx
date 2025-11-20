"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ConversationDto,
  MessageDto,
  PersonaChatDto,
} from "@/types/index.type";
import {
  createConversation,
  deleteConversation,
  getConversationsByPersonaId,
} from "@/lib/api/conversation.request";
import { getMessagesByConversationId } from "@/lib/api/message.request";
import { sendChatMessage } from "@/lib/api/chat.request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConversationSidebar } from "@/components/persona/ConversationSidebar";

interface ChatBoxComponentProps {
  persona: PersonaChatDto;
  initialConversations: ConversationDto[] | null;
}

export default function ChatBoxComponent({
  persona,
  initialConversations,
}: ChatBoxComponentProps) {
  const [conversations, setConversations] = useState<ConversationDto[]>(
    initialConversations || []
  );
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(conversations[0]?.id || null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [input, setInput] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!selectedConversationId) return;
    setLoadingMessages(true);
    try {
      const data = await getMessagesByConversationId(selectedConversationId);
      setMessages(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMessages(false);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const refreshConversations = useCallback(async () => {
    try {
      const data = await getConversationsByPersonaId(persona.id);
      setConversations(data || []);
    } catch (e) {
      console.error(e);
    }
  }, [persona.id]);

  async function handleCreateConversation() {
    setCreatingConversation(true);
    try {
      const conv = await createConversation(persona.id, "New Conversation");
      if (conv) {
        setConversations((prev) => [conv, ...prev]);
        setSelectedConversationId(conv.id);
        setMessages([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingConversation(false);
    }
  }

  async function handleDeleteConversation(id: number) {
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (selectedConversationId === id) {
        const next = conversations.filter((c) => c.id !== id)[0];
        setSelectedConversationId(next ? next.id : null);
        setMessages([]);
        if (next) loadMessages();
      }
    } catch (e) {
      console.error(e);
    }
  }

  function handleSelectConversation(id: number) {
    if (id === selectedConversationId) return;
    setSelectedConversationId(id);
    setMessages([]);
    setInput("");
  }

  async function handleSendMessage() {
    if (!input.trim() || !selectedConversationId) return;
    setSending(true);
    try {
      const newMsgs = await sendChatMessage(
        persona.id,
        selectedConversationId,
        input.trim()
      );
      if (newMsgs) {
        setMessages((prev) => [...prev, ...newMsgs]);
        setInput("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-4 md:mt-6">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg p-3 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open conversations"
          className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          💬 Conversations
        </Button>
        {selectedConversationId && (
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
            #{selectedConversationId}
          </span>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <ConversationSidebar
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelect={handleSelectConversation}
          onCreate={handleCreateConversation}
          onDelete={handleDeleteConversation}
          creating={creatingConversation}
        />
      </div>

      {/* Mobile drawer sidebar */}
      <ConversationSidebar
        mobile
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelect={(id) => {
          handleSelectConversation(id);
          setSidebarOpen(false);
        }}
        onCreate={handleCreateConversation}
        onDelete={handleDeleteConversation}
        creating={creatingConversation}
      />

      <div className="flex-1 flex flex-col bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-4 min-h-[60vh]">
        <div className="border-b border-gray-700 pb-3 mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-100">
              {persona.name}
            </h3>
            <p className="text-xs text-gray-400">
              {persona.role} • {persona.tone || "Neutral"}
            </p>
          </div>
          {selectedConversationId && (
            <span className="text-xs text-gray-500">
              #{selectedConversationId}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
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
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
              <div className="text-[10px] mt-2 opacity-70 text-right">
                {new Date(m.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>

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
            {sending ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                Sending
              </div>
            ) : (
              "Send"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
