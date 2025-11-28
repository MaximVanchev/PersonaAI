"use client";

import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  selectedConversationId: number | null;
  showMessages: boolean;
  setShowMessages: (show: boolean) => void;
  onOpenSidebar: () => void;
}

export function MobileHeader({
  selectedConversationId,
  showMessages,
  setShowMessages,
  onOpenSidebar,
}: MobileHeaderProps) {
  return (
    <div className="md:hidden fixed top-4 left-4 right-4 z-30 bg-gray-900 border border-gray-700 p-3 shadow-lg rounded-lg">
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
          onClick={onOpenSidebar}
          aria-label="Open conversations"
          className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-1"
        >
          💬 Conversations
        </Button>
      </div>
      {selectedConversationId && (
        <div className="text-center mt-2 flex items-center gap-2 justify-center">
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
            Conversation #{selectedConversationId}
          </span>
          {/* Toggle Switch */}
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
    </div>
  );
}
