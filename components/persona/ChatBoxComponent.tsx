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
import { ConversationSidebar } from "@/components/persona/ConversationSidebar";
import { ChatUIComponent } from "@/components/persona/ChatUIComponent";
import { toast } from "react-hot-toast";

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
      toast.error("Failed to load messages");
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
        toast.success("Conversation created");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to create conversation");
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
      toast.success("Conversation deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete conversation");
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
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-4 md:mt-6">
      {/* Mobile sticky header */}
      <div className="md:hidden sticky top-0 z-30 bg-gray-900 border border-gray-700 rounded-lg p-3 mb-4 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            aria-label="Back to personas"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-1"
          >
            ← Personas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open conversations"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-1"
          >
            💬 Chats
          </Button>
        </div>
        {selectedConversationId && (
          <div className="text-center mt-2">
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
              Conversation #{selectedConversationId}
            </span>
          </div>
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

      <ChatUIComponent
        persona={persona}
        selectedConversationId={selectedConversationId}
        messages={messages}
        input={input}
        setInput={setInput}
        loadingMessages={loadingMessages}
        sending={sending}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
