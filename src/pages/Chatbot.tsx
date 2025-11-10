import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Send, Sparkles, ImageIcon, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pictogram, setPictogram] = useState<string | null>(null);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Por favor escribe un mensaje");
      return;
    }

    setIsLoading(true);
    // Simulate API call - In real implementation, this would call an AI service
    setTimeout(() => {
      setPictogram("https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400");
      setIsLoading(false);
      toast.success("¡Pictograma generado!");
    }, 2000);
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
              </div>
            </CardContent>
          </Card>

          {pictogram ? (
            <Card className="border-2 border-primary animate-slide-up">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Tu pictograma</h2>
                  </div>
                  <div className="bg-secondary/30 rounded-xl p-8 mb-4">
                    <img 
                      src={pictogram} 
                      alt="Pictograma generado" 
                      className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                    />
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
