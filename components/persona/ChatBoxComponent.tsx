"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { MobileHeader } from "@/components/persona/MobileHeader";
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
  const [showMessages, setShowMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        const newMsgs = await sendChatMessage(persona.id, conv.id, "Hello!");
        if (newMsgs) {
          setMessages((prev) => [...prev, ...newMsgs.filter((m) => m != null)]);
          setInput("");
        }
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
      <MobileHeader
        selectedConversationId={selectedConversationId}
        showMessages={showMessages}
        setShowMessages={setShowMessages}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <ConversationSidebar
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelect={handleSelectConversation}
          onCreate={handleCreateConversation}
          onDelete={handleDeleteConversation}
          creating={creatingConversation}
          setShowMessages={setShowMessages}
          showMessages={showMessages}
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
        showMessages={showMessages}
        setShowMessages={setShowMessages}
        messagesEndRef={messagesEndRef}
      />
    </div>
  );
}
