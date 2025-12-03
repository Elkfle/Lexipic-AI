// src/api/conversations.ts
import { API_URL } from "../config";

export async function apiGetConversations(token: string) {
  const res = await fetch(`${API_URL}/api/conversations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function apiCreateConversation(token: string, otherUserId: string) {
  const res = await fetch(`${API_URL}/api/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ otherUserId }),
  });
  return res.json();
}

export async function apiGetMessages(token: string, conversationId: string) {
  const res = await fetch(`${API_URL}/api/conversations/${conversationId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function apiSendMessage(
  token: string,
  conversationId: string,
  data: { text: string; pictograms?: any[]; language?: string },
) {
  const res = await fetch(`${API_URL}/api/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}
