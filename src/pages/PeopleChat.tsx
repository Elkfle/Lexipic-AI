// src/pages/PeopleChat.tsx
import { useEffect, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  apiCreateConversation,
  apiGetConversations,
  apiGetMessages,
  apiSendMessage,
} from "../api/conversations";

type Participant = {
  _id: string;
  name: string;
  email: string;
};

type Conversation = {
  _id: string;
  participants: Participant[];
  lastMessageAt?: string;
};

type DirectMessage = {
  _id: string;
  senderId: string;
  text: string;
  createdAt: string;
};

export default function PeopleChatPage() {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [otherUserId, setOtherUserId] = useState("");
  const [error, setError] = useState("");

  // Si no hay usuario logueado, pedimos login
  if (!user || !token) {
    return (
      <div className="container mx-auto max-w-2xl py-16 px-4">
        <h1 className="text-2xl font-semibold mb-4">Chat con otras personas</h1>
        <p className="mb-4">
          Para chatear con otras personas, primero necesitas iniciar sesión.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  // Cargar conversaciones del usuario
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoadingConvos(true);
        const data = await apiGetConversations(token);
        if (data.ok) {
          setConversations(data.conversations || []);
        } else {
          console.error("Error cargando conversaciones:", data.error);
        }
      } catch (err) {
        console.error("Error cargando conversaciones:", err);
      } finally {
        setLoadingConvos(false);
      }
    };

    loadConversations();
  }, [token]);

  // Cargar mensajes de la conversación seleccionada
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversationId) return;
      try {
        setLoadingMessages(true);
        const data = await apiGetMessages(token, selectedConversationId);
        if (data.ok) {
          setMessages(data.messages || []);
        } else {
          console.error("Error cargando mensajes:", data.error);
        }
      } catch (err) {
        console.error("Error cargando mensajes:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [token, selectedConversationId]);

  const handleCreateConversation = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otherUserId.trim()) {
      setError("Ingresa el ID del otro usuario (por ahora usamos el ObjectId de Mongo).");
      return;
    }

    const data = await apiCreateConversation(token, otherUserId.trim());
    if (!data.ok) {
      setError(data.error || "No se pudo crear la conversación.");
      return;
    }

    const convo: Conversation = data.conversation;
    // si no estaba en la lista, lo añadimos
    setConversations((prev) => {
      const exists = prev.some((c) => c._id === convo._id);
      return exists ? prev : [convo, ...prev];
    });
    setSelectedConversationId(convo._id);
    setOtherUserId("");
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId) return;

    const data = await apiSendMessage(token, selectedConversationId, {
      text: newMessage.trim(),
    });

    if (!data.ok) {
      console.error("Error enviando mensaje:", data.error);
      return;
    }

    const msg: DirectMessage = data.message;
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  const currentConversation = conversations.find((c) => c._id === selectedConversationId);

  const getOtherParticipant = (conversation: Conversation) => {
    if (!user) return null;
    return conversation.participants.find((p) => p._id !== user.id) || conversation.participants[0];
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold mb-6">Chat con otras personas</h1>

      <div className="grid grid-cols-1 md:grid-cols-[320px,1fr] gap-6">
        {/* Columna izquierda: lista de conversaciones + crear nueva */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold mb-3">Crear nueva conversación</h2>
            <p className="text-xs text-muted-foreground mb-2">
              En esta versión inicial, necesitas pegar el <strong>_id</strong> del otro usuario
              desde MongoDB Atlas.
            </p>
            <form onSubmit={handleCreateConversation} className="space-y-2">
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="ObjectId del otro usuario"
                value={otherUserId}
                onChange={(e) => setOtherUserId(e.target.value)}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                className="w-full rounded bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                Crear / abrir conversación
              </button>
            </form>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Tus conversaciones</h2>
              {loadingConvos && (
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Cargando...
                </span>
              )}
            </div>
            {conversations.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Aún no tienes conversaciones. Crea una arriba usando el ID de otra cuenta.
              </p>
            ) : (
              <ul className="space-y-1 max-h-80 overflow-y-auto text-sm">
                {conversations.map((c) => {
                  const other = getOtherParticipant(c);
                  const isActive = c._id === selectedConversationId;
                  return (
                    <li key={c._id}>
                      <button
                        type="button"
                        onClick={() => setSelectedConversationId(c._id)}
                        className={`w-full text-left rounded px-3 py-2 ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        <div className="font-medium">
                          {other?.name || "Sin nombre"}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {other?.email}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Columna derecha: mensajes */}
        <div className="rounded-lg border bg-card flex flex-col h-[480px]">
          {selectedConversationId && currentConversation ? (
            <>
              <div className="border-b px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">
                    {getOtherParticipant(currentConversation)?.name || "Conversación"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {getOtherParticipant(currentConversation)?.email}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 text-sm">
                {loadingMessages ? (
                  <p className="text-xs text-muted-foreground">Cargando mensajes...</p>
                ) : messages.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Todavía no hay mensajes en esta conversación.
                  </p>
                ) : (
                  messages.map((m) => {
                    const isMine = m.senderId === user.id;
                    return (
                      <div
                        key={m._id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`inline-block rounded-2xl px-3 py-2 max-w-[75%] ${
                            isMine
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <div className="text-xs whitespace-pre-wrap break-words">
                            {m.text || "(sin texto)"}
                          </div>
                          <div className="mt-1 text-[10px] opacity-70">
                            {new Date(m.createdAt).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="border-t px-3 py-2 flex items-center gap-2"
              >
                <input
                  className="flex-1 rounded border px-3 py-2 text-sm"
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  className="rounded bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
                  disabled={!newMessage.trim()}
                >
                  Enviar
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground px-4 text-center">
              Selecciona una conversación en la columna izquierda o crea una nueva.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
