import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="mb-4 flex items-center">
              <img src="/assets/logo.png" alt="LexiPic" className="h-10 w-auto" />
            </div>
            <p className="text-muted-foreground text-sm">
              Comunicación visual sin barreras para personas con TEA.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/chatbot" className="text-muted-foreground hover:text-primary transition-colors">
                  Chatbot
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Accesibilidad
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Términos de uso
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Mail className="h-4 w-4" />
              <a href="mailto:contacto@lexipic.com" className="hover:text-primary transition-colors">
                contacto@lexipic.com
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              Síguenos en redes sociales para más información sobre comunicación accesible e inclusiva.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
