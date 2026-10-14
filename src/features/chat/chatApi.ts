// --- Utils
import api from "@utils/api";

export interface SuggestedProduct {
  id: string;
  title: string;
  image: string;
  price: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  suggestedProducts?: SuggestedProduct[];
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
  suggestedProducts?: SuggestedProduct[];
}

export const sendChatMessage = async (message: string, sessionId?: string): Promise<ChatResponse> => {
  const response = await api.post<ChatResponse>("/chat", { message, sessionId });
  return response.data;
};
