export interface MessageDto {
  id: number;
  conversationId: number;
  role: "system" | "user" | "assistant";
  content: string;
  createdAt: Date;
}

// NOTE: Prisma Message model does not have updatedAt; removing from DTO for consistency
