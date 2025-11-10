import { Hero } from "@/components/ui/animated-hero";
import { FeatureSteps } from "@/components/ui/feature-section";
import { ShimmerButton } from "@/components/ui/shimmer-button";

function HeroDemo() {
  return (
    <div className="block">
      <Hero />
    </div>
  );
}

const featureStepsDemoData = [
  {
    step: "Paso 1",
    title: "Escribe tu idea",
    content:
      "Describe la frase o concepto que necesitas transformar en un pictograma comprensible.",
    image:
      "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1600&q=80",
  },
  {
    step: "Paso 2",
    title: "La IA interpreta",
    content:
      "Nuestro motor analiza el contexto para seleccionar símbolos visuales acordes a tu mensaje.",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80",
  },
  {
    step: "Paso 3",
    title: "Comparte con claridad",
    content:
      "Recibe alternativas de pictogramas listos para compartir en entornos educativos o terapéuticos.",
    image:
      "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80",
  },
];

function FeatureStepsDemo() {
  return (
    <FeatureSteps
      features={featureStepsDemoData}
      title="Integra LexiPic en tu flujo"
      autoPlayInterval={4000}
      imageHeight="h-[260px] md:h-[320px] lg:h-[380px]"
      className="bg-secondary/40 rounded-3xl"
    />
  );
}

function ShimmerButtonDemo() {
  return (
  <div className="flex min-h-[16rem] items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/10 p-6">
      <ShimmerButton className="px-8 py-3 text-base" shimmerColor="rgba(255,255,255,0.85)">
        <>Explorar chatbot</>
      </ShimmerButton>
    </div>
  );
}

export { HeroDemo, FeatureStepsDemo, ShimmerButtonDemo };
