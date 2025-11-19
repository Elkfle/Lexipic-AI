import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Send, Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { inferSearchQueries, InferenceResult } from "@/lib/pictogramModel";
import { dedupePictograms, fetchBestPictograms, PictogramResult } from "@/lib/pictogramService";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "lexipic_chat_history";

const MAX_PICTOGRAMS = 6;

const buildSearchQueries = (matches: InferenceResult[]): string[] => {
  const querySet = new Set<string>();

  matches.forEach((match) => {
    const baseQuery = match.searchText.trim();
    if (baseQuery) querySet.add(baseQuery);

    const matchedTokens = match.matchedTokens.length ? match.matchedTokens : match.sample.tokens;
    matchedTokens
      .map((token) => token.trim())
      .filter(Boolean)
      .slice(0, 3)
      .forEach((token) => querySet.add(token));
  });

  return Array.from(querySet);
};

const Chatbot = () => {
  type ConversationMessage = {
    id: string;
    role: "user" | "assistant";
    content?: string;
    pictograms?: PictogramResult[];
    language?: string;
  };

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("es");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [lastInference, setLastInference] = useState<InferenceResult[]>([]);
  const [lastQueries, setLastQueries] = useState<string[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const createMessageId = () =>
    globalThis.crypto?.randomUUID?.() ?? `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  useEffect(() => () => controllerRef.current?.abort(), []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping, isLoading]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return;

      const sanitized: ConversationMessage[] = parsed
        .filter((entry) => entry && (entry.role === "user" || entry.role === "assistant"))
        .map((entry) => ({
          id: typeof entry.id === "string" ? entry.id : createMessageId(),
          role: entry.role === "assistant" ? "assistant" : "user",
          content: typeof entry.content === "string" ? entry.content : undefined,
          pictograms: Array.isArray(entry.pictograms) ? entry.pictograms : undefined,
          language: typeof entry.language === "string" ? entry.language : undefined,
        }));

      if (sanitized.length) {
        setMessages(sanitized);
      }
    } catch (error) {
      console.warn("No se pudo restaurar el historial del chat", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!messages.length) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Por favor escribe un mensaje");
      return;
    }

    const prompt = message.trim();
    const selectedLanguage = language;
    setMessage("");

    setIsLoading(true);
    setIsBotTyping(true);
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      // 1) Pictogramas directos para el mensaje del usuario
      let userPictograms: PictogramResult[] = [];

      try {
        // Intentar frase completa (casi siempre 404 en ARASAAC)
        userPictograms = await fetchBestPictograms(selectedLanguage, prompt, controller.signal);

        // Si no hay resultados → fallback por palabras individuales
        if (!userPictograms.length) {
          const tokens = prompt.split(/\s+/).filter(Boolean);

          for (const token of tokens) {
            const result = await fetchBestPictograms(selectedLanguage, token, controller.signal);
            if (result.length) {
              userPictograms = [result[0]]; // solo un pictograma
              break;
            }
          }
        }

        // GARANTIZAMOS solo uno
        if (userPictograms.length > 1) {
          userPictograms = [userPictograms[0]];
        }

        console.log("🎯 USER PICTOGRAMS (FINAL):", userPictograms);

      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.warn("No se pudieron obtener pictogramas directos para el usuario", error);
        }
      }

      const userEntry: ConversationMessage = {
        id: createMessageId(),
        role: "user",
        content: prompt,
        pictograms: userPictograms.length ? userPictograms : undefined,
        language: selectedLanguage,
      };

      setMessages((prev) => [...prev, userEntry]);

      // 2) Mantener tu flujo actual de inferencia + ARASAAC
      const matches = inferSearchQueries(prompt, 3);

      if (!matches.length) {
        setLastInference([]);
        setLastQueries([]);
        toast.error("No pude entender la frase, intenta con otra redacción");
        return;
      }

      setLastInference(matches);

      const queries = buildSearchQueries(matches);

      if (!queries.length) {
        setLastQueries([]);
        toast.error("No logramos generar palabras clave útiles para la búsqueda");
        return;
      }

      const aggregated: PictogramResult[] = [];
      const successfulQueries: string[] = [];

      for (const query of queries) {
        try {
          const results = await fetchBestPictograms(selectedLanguage, query, controller.signal);
          if (results.length) {
            aggregated.push(...results);
            successfulQueries.push(query);
          }
        } catch (error) {
          if ((error as Error).name === "AbortError") {
            return;
          }
          console.error(error);
        }
      }

      setLastQueries(successfulQueries.length ? successfulQueries : queries);

      if (!aggregated.length) {
        toast.info("Probamos varias combinaciones pero no hubo pictogramas disponibles");
        return;
      }

      const deduped = dedupePictograms(aggregated, MAX_PICTOGRAMS);

      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          role: "assistant",
          pictograms: deduped,
          language: selectedLanguage,
        },
      ]);

      toast.success("¡Pictogramas generados!");
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error(error);
        toast.error("Ocurrió un problema al generar el pictograma");
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
      setIsLoading(false);
      setIsBotTyping(false);
    }
  };
  const languageOptions = [
    { value: "es", label: "Español" },
    { value: "en", label: "Inglés" },
  ];

  const showInfoPanel = lastInference.length > 0 || lastQueries.length > 0;

  const renderMessage = (entry: ConversationMessage) => {
    const isUser = entry.role === "user";
    const bubbleClasses = cn(
      "max-w-[80%] rounded-3xl shadow-md px-5 py-3",
      isUser
        ? "bg-primary text-primary-foreground rounded-br-md"
        : "bg-muted/30 border border-border text-foreground rounded-bl-md"
    );

    if (isUser) {
      return (
        <div key={entry.id} className="flex w-full justify-end">
          <div className={bubbleClasses}>
            <p className="text-base leading-relaxed whitespace-pre-line">{entry.content}</p>

            {entry.pictograms?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {entry.pictograms.map((item) => (
                  <a
                    key={`${entry.id}-${item.id}-${item.searchText}`}
                    href={`https://arasaac.org/pictograms/${entry.language ?? language}/${item.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl bg-white shadow-sm overflow-hidden"
                  >
                    <img
                      src={item.imageUrl}
                      alt={`Pictograma ${item.id}`}
                      className="w-full h-48 object-contain bg-muted"
                    />
                    <span className="sr-only">Pictograma {item.id}</span>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    if (!entry.pictograms?.length) {
      return null;
    }

    const linkLanguage = entry.language ?? language;

    return (
      <div key={entry.id} className="flex w-full justify-start">
        <div className={bubbleClasses}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {entry.pictograms.map((item) => (
              <a
                key={`${entry.id}-${item.id}-${item.searchText}`}
                href={`https://arasaac.org/pictograms/${linkLanguage}/${item.id}`}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl bg-white shadow-sm overflow-hidden"
              >
                <img
                  src={item.imageUrl}
                  alt={`Pictograma ${item.id}`}
                  className="w-full h-48 object-contain bg-muted"
                />
                <span className="sr-only">Pictograma {item.id}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Chatbot de Pictogramas</h1>
            <p className="text-muted-foreground">
              Conversa con Lexi para obtener pictogramas guiados por PLN y la API oficial de ARASAAC.
            </p>
          </div>
          <Card className="mb-8">
            <CardContent className="pt-6 flex flex-col h-[82vh]">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">Idioma de búsqueda</p>
                    <p className="text-xs text-muted-foreground">
                      Ajusta cómo consultamos los pictogramas oficiales.
                    </p>
                  </div>
                  <Select value={language} onValueChange={(value) => setLanguage(value)}>
                    <SelectTrigger className="sm:w-48">
                      <SelectValue placeholder="Selecciona un idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 flex-1 overflow-y-auto space-y-4 pr-1">
                {messages.map((entry) => renderMessage(entry))}
                {isBotTyping ? (
                  <div className="flex w-full justify-start">
                    <div className="max-w-[60%] rounded-3xl bg-muted/30 border border-border px-5 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        {[0, 1, 2].map((dot) => (
                          <span
                            key={dot}
                            className="inline-block h-2 w-2 rounded-full bg-muted-foreground/70 animate-bounce"
                            style={{ animationDelay: `${dot * 150}ms` }}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground">Lexi está buscando pictogramas...</span>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div ref={scrollRef} />
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-end gap-3 rounded-full border bg-muted/30 px-5 py-4 shadow-inner">
                  <Textarea
                    placeholder="Escribe tu mensaje como si chatearas con Lexi..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        !isLoading && handleSend();
                      }
                    }}
                    className="min-h-[72px] flex-1 resize-none border-none bg-transparent p-1 text-base shadow-none placeholder:px-1 placeholder:text-muted-foreground/80 focus-visible:ring-0 focus-visible:ring-offset-0"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading}
                    size="icon"
                    className="rounded-full h-12 w-12 shadow-md"
                  >
                    {isLoading ? (
                      <Sparkles className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                    <span className="sr-only">Enviar mensaje</span>
                  </Button>
                </div>

                {showInfoPanel ? (
                  <Accordion type="single" collapsible className="rounded-2xl border bg-muted/20">
                    <AccordionItem value="pln-info">
                      <AccordionTrigger className="text-sm font-semibold px-4">
                        Ver análisis de PLN de este turno
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 text-sm text-muted-foreground px-4">
                        {lastInference.length ? (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Frases similares detectadas
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {lastInference.map((match) => (
                                <Badge key={`${match.sample.frase}-${match.searchText}`} variant="secondary">
                                  {match.sample.frase}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {lastQueries.length ? (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Consultas enviadas a ARASAAC
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {lastQueries.map((query) => (
                                <Badge key={query} variant="outline">
                                  {query}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : null}
              </div>
            </CardContent>
          </Card>
          <Card className="border-dashed">
            <CardContent className="pt-6 space-y-3 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">¿Cómo funciona?</p>
              <p>
                Convertimos tu frase en palabras clave mediante PLN (frases similares, lematización y detección de
                conceptos). Luego consultamos la API de ARASAAC y te mostramos los pictogramas mejor posicionados.
              </p>
              <p>
                Si no aparece lo que necesitas, prueba describir la acción con más contexto o envía frases cortas en pasos
                separados para mantener un historial conversacional.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Chatbot;
