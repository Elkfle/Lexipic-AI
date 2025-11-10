import { Link } from "react-router-dom";
import { Hero } from "@/components/ui/animated-hero";
import { FeatureSteps } from "@/components/ui/feature-section";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Sparkles, Heart, Users, Zap, Shield, BookOpen } from "lucide-react";

const howItWorksFeatures = [
  {
    step: "Paso 1",
    title: "Describe tu mensaje",
    content:
      "Escribe la palabra o frase que quieres transformar en un pictograma claro y fácil de comprender.",
    image:
      "https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=1600&q=80",
  },
  {
    step: "Paso 2",
    title: "La IA interpreta",
    content:
      "Nuestro modelo analiza el contexto lingüístico para proponer símbolos visuales coherentes con tu intención.",
    image:
      "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1032",
  },
  {
    step: "Paso 3",
    title: "Recibe pictogramas",
    content:
      "Selecciona el pictograma sugerido y compártelo con tu comunidad educativa o terapéutica al instante.",
    image:
      "https://images.unsplash.com/photo-1640592911568-38fa7bc21ef3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=871",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <Hero id="inicio" />

      <section id="como-funciona" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30 scroll-mt-24">
        <div className="container mx-auto">
          <FeatureSteps
            features={howItWorksFeatures}
            title="¿Cómo funciona LexiPic?"
            autoPlayInterval={4200}
            imageHeight="h-[220px] md:h-[320px] lg:h-[420px]"
            className="bg-card/40 backdrop-blur rounded-3xl shadow-lg"
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl text-center mb-4">
            Beneficios de LexiPic
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Una herramienta diseñada para crear conexiones y facilitar la expresión
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-card hover:bg-secondary/30 transition-colors">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Accesible</h3>
              <p className="text-sm text-muted-foreground">
                Diseñado siguiendo estándares de accesibilidad WCAG
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-card hover:bg-secondary/30 transition-colors">
              <Users className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Inclusivo</h3>
              <p className="text-sm text-muted-foreground">
                Fomenta la comunicación para todas las personas
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-card hover:bg-secondary/30 transition-colors">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Rápido</h3>
              <p className="text-sm text-muted-foreground">
                Resultados instantáneos con inteligencia artificial
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-card hover:bg-secondary/30 transition-colors">
              <BookOpen className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Educativo</h3>
              <p className="text-sm text-muted-foreground">
                Ideal para el aprendizaje y la terapia del lenguaje
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="comenzar"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/10 scroll-mt-24"
      >
        <div className="container mx-auto text-center max-w-3xl">
          <Heart className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl mb-6">
            Comienza a comunicarte hoy
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Facilita la expresión y comprensión con pictogramas generados por inteligencia artificial
          </p>
          <Link to="/chatbot" className="inline-flex">
            <ShimmerButton className="px-12 py-4 text-lg">
              <>
                Ir al Chatbot
                <Sparkles className="h-5 w-5" />
              </>
            </ShimmerButton>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
