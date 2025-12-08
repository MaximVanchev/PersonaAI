"use client";

import { ConversationDto } from "@/types/index.type";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ConversationSidebarProps {
  conversations: ConversationDto[];
  selectedConversationId: number | null;
  onSelect: (id: number) => void;
  onCreate: () => void;
  onDelete: (id: number) => void;
  creating: boolean;
  mobile?: boolean; // render as drawer-style overlay on mobile
  open?: boolean; // mobile open state
  onClose?: () => void; // mobile close handler
  setShowMessages?: (show: boolean) => void;
  showMessages?: boolean;
}

export function ConversationSidebar({
  conversations,
  selectedConversationId,
  onSelect,
  onCreate,
  onDelete,
  creating,
  mobile = false,
  open = true,
  onClose,
  setShowMessages,
  showMessages,
}: ConversationSidebarProps) {
  const containerClasses = mobile
    ? `fixed inset-y-0 left-0 z-40 w-72 bg-gray-900 border-r border-gray-700 shadow-2xl flex flex-col p-4 transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`
    : "w-64 flex-shrink-0 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-4 flex flex-col sticky top-10 self-start";
  return (
    <div className={containerClasses} aria-hidden={!open && mobile}>
      <Link href="/">
        <Button
          variant="outline"
          className="mb-4 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Personas
        </Button>
      </Link>
      {mobile && (
        <div className="flex items-center justify-end mb-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 px-2 py-1 text-sm rounded hover:bg-gray-800"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
      )}
      {/* Toggle Switch */}
      {setShowMessages &&
        showMessages !== undefined &&
        conversations.length > 0 && (
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
        )}
      <div className="flex items-center justify-between mb-4 mt-5">
        <h2 className="font-semibold text-gray-100">Conversations</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onCreate}
          disabled={creating}
          className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-1"
        >
          {creating ? (
            <>
              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Creating...</span>
            </>
          ) : (
            "+"
          )}
        </Button>
      </div>
      <div className="space-y-2 overflow-y-auto">
        {conversations.length === 0 && (
          <p className="text-sm text-gray-400">No conversations yet.</p>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`group border rounded-md px-3 py-2 text-gray-200 cursor-pointer flex items-center justify-between text-sm transition-all duration-200 ${
              selectedConversationId === c.id
                ? "bg-indigo-900/50 border-indigo-600 shadow-md"
                : "border-gray-700 hover:bg-gray-800 hover:border-gray-600"
            }`}
            onClick={() => onSelect(c.id)}
          >
            <span className="truncate mr-2 font-medium">
              {`Conversation #${c.id}`}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(c.id);
              }}
              className="text-red-500 text-md transition-opacity rounded p-1 "
              aria-label="Delete conversation"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
