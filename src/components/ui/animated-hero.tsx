import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";

const heroImageUrl =
  "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80";

const titleVariants = {
  enter: { opacity: 1, y: 0 },
  exitUp: { opacity: 0, y: -160 },
  exitDown: { opacity: 0, y: 160 },
};

interface HeroProps {
  id?: string;
}

function Hero({ id }: HeroProps = {}) {
  const titles = useMemo(
    () => ["empática", "visual", "inclusiva", "tranquila", "amigable"],
    [],
  );
  const [titleIndex, setTitleIndex] = useState(0);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleIndex((current) => (current === titles.length - 1 ? 0 : current + 1));
    }, 2400);
    return () => clearTimeout(timeoutId);
  }, [titleIndex, titles.length]);

  return (
    <section
      id={id}
      className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/30 to-accent/10 scroll-mt-24"
    >
      <div className="absolute inset-0 opacity-40">
        <img
          src={heroImageUrl}
          alt="Profesional guiando a una niña con tarjetas visuales"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/70 to-background/10" />
      </div>

      <div className="relative container mx-auto px-20 py-24 md:py-32">
        <div className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="flex flex-col items-center gap-8 text-center lg:items-start lg:text-left">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Comunicación
                <span className="relative mt-1 inline-flex h-16 w-full items-center justify-center overflow-hidden text-primary lg:justify-start">
                  {titles.map((title, index) => (
                    <motion.span
                      key={title}
                      className="absolute text-4xl font-bold md:text-5xl lg:text-6xl"
                      initial={{ opacity: 0, y: -160 }}
                      animate={
                        titleIndex === index
                          ? titleVariants.enter
                          : index < titleIndex
                          ? titleVariants.exitUp
                          : titleVariants.exitDown
                      }
                      transition={{ type: "spring", stiffness: 120, damping: 18 }}
                    >
                      {title}
                    </motion.span>
                  ))}
                </span>
                sin barreras
              </h1>

              <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
                LexiPic acompaña a personas con TEA y a sus familias con pictogramas creados por
                inteligencia artificial para que cada mensaje se sienta cercano, claro y cálido.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/chatbot" className="w-full sm:w-auto">
                <ShimmerButton className="w-full sm:w-auto px-8 py-3 text-base sm:text-lg">
                  <>
                    Probar el chatbot
                    <MoveRight className="h-4 w-4" />
                  </>
                </ShimmerButton>
              </Link>
            </div>
          </div>

          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative rounded-3xl border border-border/70 bg-card/90 p-6 shadow-xl backdrop-blur">
              <motion.img
                src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=900&q=80"
                alt="Niño usando tarjetas visuales para comunicarse"
                className="h-72 w-full rounded-2xl object-cover"
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
              <div className="absolute -bottom-6 left-1/2 w-max -translate-x-1/2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg">
                Más de 1,200 pictogramas generados cada semana
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export { Hero };
