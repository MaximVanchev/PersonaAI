import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPersonaById } from "@/lib/api/persona.request";
import ChatBoxComponent from "@/components/persona/ChatBoxComponent";

interface PersonaDetailPageProps {
  params: {
    id: string;
  };
}

export default async function PersonaDetailPage({
  params,
}: PersonaDetailPageProps) {
  const data = await params;
  const persona = await getPersonaById(Number(data.id));
  //const conversations = await getConversationsByPersonaId(Number(data.id));

  if (!persona) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">Persona not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Personas
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Persona {persona.name} Chat
          </h1>
          <div>
            <ChatBoxComponent persona={persona} />
          </div>
        </div>
      </div>
    </div>
  );
}
