import { useCallback, useEffect, useState } from "react";
import type { MouseEvent } from "react";

import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";
import { ShimmerButton } from "@/components/ui/shimmer-button";

const navigationLinks = [
  { label: "Inicio", hash: "#inicio" },
  { label: "Cómo funciona", hash: "#como-funciona" },
  { label: "Beneficios", hash: "#beneficios" },
  { label: "Comenzar", hash: "#comenzar" },
];

const Navigation = () => {
  const [activeSection, setActiveSection] = useState<string>(navigationLinks[0].hash);

  const handleSmoothScroll = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, hash: string) => {
      event.preventDefault();

      const targetId = hash.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveSection(hash);
        window.history.replaceState(null, "", hash);
      }
    },
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.location.hash) {
      setActiveSection(window.location.hash);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const anchorOffset = 120;
    let ticking = false;

    const updateActiveSection = () => {
      const sections = navigationLinks
        .map((link) => document.getElementById(link.hash.replace("#", "")))
        .filter((section): section is HTMLElement => section !== null);

      if (sections.length === 0) {
        return;
      }

      let nextActive = navigationLinks[0].hash;
      let closestDistance = Number.POSITIVE_INFINITY;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top - anchorOffset);

        if (rect.top <= anchorOffset && rect.bottom >= anchorOffset) {
          nextActive = `#${section.id}`;
          closestDistance = -1;
        } else if (closestDistance >= 0 && distance < closestDistance) {
          nextActive = `#${section.id}`;
          closestDistance = distance;
        }
      });

      setActiveSection((prev) => (prev === nextActive ? prev : nextActive));
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    };

    updateActiveSection();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="group flex items-center gap-3">
            <img
              src="/assets/logo.png"
              alt="LexiPic"
              className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          <div className="flex items-center gap-6">
            {navigationLinks.map((link) => {
              const isActive = activeSection === link.hash;
              return (
                <a
                  key={link.hash}
                  href={link.hash}
                  onClick={(event) => handleSmoothScroll(event, link.hash)}
                  className={cn(
                    "relative text-sm font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-primary",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                  <span
                    className={cn(
                      "pointer-events-none absolute left-0 right-0 -bottom-1 h-0.5 origin-left rounded-full bg-primary transition-transform duration-300",
                      isActive ? "scale-x-100" : "scale-x-0",
                    )}
                    aria-hidden="true"
                  />
                </a>
              );
            })}

            <Link to="/chatbot" className="flex-shrink-0">
              <ShimmerButton className="px-6 py-2 text-sm">
                Probar Chatbot
              </ShimmerButton>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
