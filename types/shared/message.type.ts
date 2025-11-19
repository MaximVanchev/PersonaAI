export interface MessageDto {
  id: number;
  conversationId: number;
  sender: "user" | "persona";
  message: string;
  createdAt: Date;
  updatedAt: Date;
}
