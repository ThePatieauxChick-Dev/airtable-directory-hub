import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SubmitBusiness = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="relative py-14 px-6 text-center border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-luxury opacity-[0.04]" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-sans mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Link>
          <p className="font-editorial text-sm tracking-[0.35em] uppercase text-accent mb-3">
            The Patieaux Chick
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-3">
            Apply to Be Featured
          </h1>
          <p className="font-editorial text-lg text-muted-foreground italic max-w-2xl mx-auto">
            Because your Patieaux deserves more than just furniture. Share your business details below and let
            us spotlight what makes your brand beautiful.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <section className="space-y-5 rounded-2xl border border-border/70 bg-card p-6">
          <h2 className="font-display text-xl font-semibold text-foreground border-b border-border pb-3">
            Get Featured
          </h2>
          <iframe
            className="airtable-embed w-full rounded-xl"
            src="https://airtable.com/embed/appnyHwteIfAl2Mwh/pagEaaBwPFjOUJw4O/form"
            frameBorder="0"
            width="100%"
            height="533"
            style={{ background: "transparent", border: "1px solid #ccc" }}
            title="Get Featured Form"
          />
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center bg-secondary">
        <p className="font-editorial text-sm text-secondary-foreground/70 italic">Curated with care by The Patieaux Chick · See you on the Patieaux.</p>
      </footer>
    </div>
  );
};

export default SubmitBusiness;
