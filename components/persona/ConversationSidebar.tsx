"use client";

import { ConversationDto } from "@/types/index.type";
import { Button } from "@/components/ui/button";

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
}: ConversationSidebarProps) {
  const containerClasses = mobile
    ? `fixed inset-y-0 left-0 z-40 w-72 bg-gray-900 border-r border-gray-700 shadow-2xl flex flex-col p-4 transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`
    : "w-64 flex-shrink-0 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-4 flex flex-col";
  return (
    <div className={containerClasses} aria-hidden={!open && mobile}>
      {mobile && (
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-100">Conversations</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 px-2 py-1 text-sm rounded hover:bg-gray-800"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-100">Conversations</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onCreate}
          disabled={creating}
          className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          {creating ? "..." : "+"}
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
            <span className="truncate mr-2 font-medium">{c.title || `Conversation #${c.id}`}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(c.id);
              }}
              className="text-gray-500 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 hover:bg-gray-700"
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
