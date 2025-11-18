import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Send, Sparkles, ImageIcon, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { inferSearchQueries, InferenceResult } from "@/lib/pictogramModel";
import { dedupePictograms, fetchBestPictograms, PictogramResult } from "@/lib/pictogramService";

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
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("es");
  const [pictograms, setPictograms] = useState<PictogramResult[]>([]);
  const [inference, setInference] = useState<InferenceResult[]>([]);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Por favor escribe un mensaje");
      return;
    }

    setIsLoading(true);
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const matches = inferSearchQueries(message, 3);

      if (!matches.length) {
        setInference([]);
        setPictograms([]);
        toast.error("No pude entender la frase, intenta con otra redacción");
        return;
      }

      setInference(matches);

      const queries = buildSearchQueries(matches);

      if (!queries.length) {
        setPictograms([]);
        toast.error("No logramos generar palabras clave útiles para la búsqueda");
        return;
      }

      const aggregated: PictogramResult[] = [];
      const successfulQueries: string[] = [];

      for (const query of queries) {
        try {
          const results = await fetchBestPictograms(language, query, controller.signal);
          if (results.length) {
            aggregated.push(...results);
            successfulQueries.push(query);
          }
        } catch (error) {
          if ((error as Error).name === "AbortError") {
            return;
          }
          console.warn(`No se pudo consultar pictogramas para "${query}"`, error);
        }

        if (aggregated.length >= MAX_PICTOGRAMS) {
          break;
        }
      }

      setQueryHistory(successfulQueries.length ? successfulQueries : queries);

      if (!aggregated.length) {
        setPictograms([]);
        toast.info("Probamos varias combinaciones pero no hubo pictogramas disponibles");
        return;
      }

      setPictograms(dedupePictograms(aggregated, MAX_PICTOGRAMS));
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
    }
  };

  const languageOptions = [
    { value: "es", label: "Español" },
    { value: "en", label: "Inglés" },
  ];

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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Chatbot de Pictogramas
            </h1>
            <p className="text-muted-foreground">
              Escribe una palabra o frase y obtén el pictograma correspondiente
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Idioma de búsqueda</label>
                  <Select value={language} onValueChange={(value) => setLanguage(value)}>
                    <SelectTrigger className="w-full">
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

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tu mensaje
                  </label>
                  <Textarea
                    placeholder="Ejemplo: Quiero comer..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[120px] text-lg"
                    disabled={isLoading}
                  />
                </div>
                
                <Button 
                  onClick={handleSend}
                  disabled={isLoading}
                  size="lg"
                  className="w-full rounded-full"
                >
                  {isLoading ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                      Generando pictograma...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Enviar
                    </>
                  )}
                </Button>

                {inference.length ? (
                  <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground space-y-2">
                    <p className="font-medium text-foreground">Frases similares detectadas</p>
                    <div className="flex flex-wrap gap-2">
                      {inference.map((match) => (
                        <Badge key={`${match.sample.frase}-${match.searchText}`} variant="secondary">
                          {match.sample.frase}
                        </Badge>
                      ))}
                    </div>
                    {queryHistory.length ? (
                      <div className="space-y-1 text-xs">
                        <p className="font-semibold text-foreground">Consultas enviadas</p>
                        <div className="flex flex-wrap gap-2">
                          {queryHistory.map((query) => (
                            <Badge key={query} variant="outline">
                              {query}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <p className="text-xs">Usamos las coincidencias más cercanas y, si es necesario, palabras individuales para maximizar los resultados.</p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {pictograms.length ? (
            <Card className="border-2 border-primary animate-slide-up">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Pictogramas sugeridos</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pictograms.map((item) => (
                      <div key={`${item.id}-${item.searchText}`} className="rounded-xl bg-secondary/30 p-4">
                        <img 
                          src={item.imageUrl}
                          alt={`Pictograma ${item.id}`}
                          className="max-h-64 w-full object-contain mx-auto mb-3 rounded-lg shadow-sm"
                        />
                        <p className="text-sm font-medium text-foreground">#{item.id}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.keywords.length ? item.keywords.join(", ") : "Sin descripción"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Consulta: <span className="font-semibold">{item.searchText}</span>
                        </p>
                        <a
                          href={`https://arasaac.org/pictograms/${language}/${item.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary text-xs font-semibold inline-block mt-2"
                        >
                          Ver en ARASAAC
                        </a>
                      </div>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Pictograma generado para: <span className="font-semibold text-foreground">"{message}"</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-dashed border-border">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    El pictograma aparecerá aquí
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Chatbot;
