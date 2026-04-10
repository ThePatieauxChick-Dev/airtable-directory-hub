import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DirectoryHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  totalListings: number;
}

const DirectoryHeader = ({ searchQuery, onSearchChange, totalListings }: DirectoryHeaderProps) => {
  return (
    <header className="text-center py-16 px-6 md:py-24">
      <p className="font-editorial text-lg md:text-xl tracking-[0.3em] uppercase text-accent mb-4">
        The Patieaux Chick Presents
      </p>
      <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-foreground leading-tight mb-4">
        Patio Business Directory
      </h1>
      <p className="font-editorial text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 italic">
        A curated collection of businesses we trust, love, and proudly recommend.
      </p>

      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, category, or location..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-4 py-3 h-14 rounded-full border-border bg-card text-foreground placeholder:text-muted-foreground font-sans text-base shadow-sm focus-visible:ring-accent"
        />
      </div>

      {totalListings > 0 && (
        <p className="mt-6 text-sm text-muted-foreground font-sans tracking-wide">
          {totalListings} {totalListings === 1 ? "listing" : "listings"} featured
        </p>
      )}

      <Button asChild className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground font-sans">
        <Link to="/submit">Get Your Business Featured</Link>
      </Button>
    </header>
  );
};

export default DirectoryHeader;
