import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPersonaById } from "@/lib/api/persona.request";
import ChatBoxComponent from "@/components/persona/ChatBoxComponent";
import { getConversationsByPersonaId } from "@/lib/api/conversation.request";

interface PersonaDetailPageProps {
  params: {
    id: string;
  };
}

export default async function PersonaPage({ params }: PersonaDetailPageProps) {
  const data = await params;
  const persona = await getPersonaById(Number(data.id));
  const conversations = await getConversationsByPersonaId(Number(data.id));

  if (!persona) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">Persona not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="mb-8">
          <Link href="/">
            <Button
              variant="outline"
              className="mb-4 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Personas
            </Button>
          </Link>
          <div>
            <ChatBoxComponent
              persona={persona}
              initialConversations={conversations}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
