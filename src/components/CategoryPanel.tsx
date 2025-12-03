import { useState } from 'react';
import { quickCategories } from '@/data/categories';
import { ChevronLeft, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategoryPanelProps {
  onSelectPhrase: (phrase: string) => void;
}

export const CategoryPanel = ({ onSelectPhrase }: CategoryPanelProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const activeCategory = quickCategories.find(c => c.id === selectedCategory);

  return (
    <div className="w-full bg-card border-t border-border p-4 animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        {selectedCategory ? (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedCategory(null)}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium px-2">
            <Grid className="h-4 w-4" />
            <span>Categorías Rápidas</span>
          </div>
        )}
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-2">
          {!selectedCategory ? (
            // Vista de Categorías
            quickCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex flex-col items-center justify-center gap-2 
                    min-w-[100px] h-[100px] rounded-xl border-2 transition-all
                    ${category.color}
                  `}
                >
                  <Icon className="h-8 w-8" />
                  <span className="text-sm font-bold">{category.label}</span>
                </button>
              );
            })
          ) : (
            // Vista de Frases (Pictogramas)
            activeCategory?.phrases.map((phrase, index) => (
              <button
                key={index}
                onClick={() => onSelectPhrase(phrase)}
                className="
                  flex items-center justify-center text-center px-4
                  min-w-[120px] h-[100px] rounded-xl border-2 
                  bg-background hover:bg-accent transition-all border-primary/20
                "
              >
                <span className="text-sm font-medium text-foreground whitespace-normal">
                  {phrase}
                </span>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};