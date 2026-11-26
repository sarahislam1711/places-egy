import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CornerSlideMagnet } from "@/components/magnets/CornerSlideMagnet";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "wouter";
import { GLOSSARY_TERMS, GlossaryTerm } from "@/lib/glossary-data";
import { Badge } from "@/components/ui/badge";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema, glossarySchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { STATIC_PAGE_META } from "@/lib/page-meta";
import { trackEvent } from "@/lib/analytics";

export default function GlossaryPage() {
  useDocumentMeta(STATIC_PAGE_META["/glossary"]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  // Track glossary search after 800ms of idle — see which real-estate terms
  // people are actually looking up. Great signal for future content.
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timer = setTimeout(() => {
      trackEvent("glossary_search", {
        search_term: searchQuery.trim().toLowerCase(),
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Track letter filter clicks
  useEffect(() => {
    if (selectedLetter) {
      trackEvent("glossary_letter_click", { letter: selectedLetter });
    }
  }, [selectedLetter]);

  const alphabet = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const filteredTerms = useMemo(() => {
    let terms = GLOSSARY_TERMS;

    if (searchQuery) {
      terms = terms.filter(
        (t) =>
          t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.definition.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedLetter && selectedLetter !== "#") {
      terms = terms.filter((t) => t.category === selectedLetter);
    } else if (selectedLetter === "#") {
      // For this example, we don't have number categories, but logic would go here
      // Or we can reset
    }

    // Group by category for display
    const grouped: Record<string, GlossaryTerm[]> = {};
    terms.forEach((t) => {
      const cat = t.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(t);
    });
    
    // Sort categories alphabetically
    const sortedCategories = Object.keys(grouped).sort();
    
    return { grouped, sortedCategories };
  }, [searchQuery, selectedLetter]);

  return (
    <div className="min-h-screen font-sans flex flex-col bg-white">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Glossary", url: "/glossary" },
        ])}
      />
      <SchemaMarkup schema={glossarySchema(GLOSSARY_TERMS)} />
      <Navbar />

      {/* Hero Header */}
      <div className="bg-primary pt-32 pb-20 px-4 text-center relative overflow-hidden">
        {/* Abstract shape for visual interest */}
        <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[200%] bg-white/5 rotate-12 rounded-[100px]" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight font-serif">
            Real Estate Glossary
          </h1>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-12">
            <Input 
              className="h-14 pl-6 pr-14 rounded-full bg-white border-0 shadow-xl text-lg placeholder:text-gray-400 text-foreground"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-2 top-2 h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white">
              <Search className="w-5 h-5" />
            </div>
          </div>

          {/* Alphabet Navigation */}
          <div className="flex flex-wrap justify-center gap-4 text-white/80 font-mono text-sm md:text-base">
            {alphabet.map((char) => (
              <button
                key={char}
                onClick={() => setSelectedLetter(selectedLetter === char ? null : char)}
                className={`hover:text-white transition-colors uppercase ${selectedLetter === char ? "text-accent font-bold scale-125" : ""}`}
              >
                {char}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-16 max-w-6xl">
        {filteredTerms.sortedCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16">
            {filteredTerms.sortedCategories.map((letter) => (
              <div key={letter} className="relative">
                {/* Letter Header */}
                <div className="flex items-start gap-2 mb-8 border-b border-gray-100 pb-4">
                  <h2 className="text-4xl md:text-6xl font-serif text-primary leading-none">{letter}</h2>
                  <Badge className="bg-accent text-primary hover:bg-accent rounded-full h-6 min-w-6 flex items-center justify-center text-xs font-bold border-0">
                    {filteredTerms.grouped[letter].length}
                  </Badge>
                </div>

                {/* Terms List */}
                <div className="space-y-8">
                  {filteredTerms.grouped[letter].map((item) => (
                    <div key={item.term} className="group">
                      <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors cursor-pointer">
                        {item.term}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.definition}
                      </p>
                      {item.link && (
                        <Link
                          href={item.link.href}
                          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                        >
                          {item.link.label} <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">No terms found matching your search.</p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedLetter(null); }}
              className="text-primary mt-4 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>

      <Footer />

      <CornerSlideMagnet />
    </div>
  );
}
