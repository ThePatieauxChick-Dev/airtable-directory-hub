import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchListings, type Listing } from "@/lib/airtable";
import DirectorySidebar from "@/components/DirectorySidebar";
import ListingCard from "@/components/ListingCard";
import ListingDetailDialog from "@/components/ListingDetailDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: listings = [], isLoading, error } = useQuery({
    queryKey: ["listings"],
    queryFn: fetchListings,
  });

  const categories = useMemo(
    () => [...new Set(listings.map((l) => l.category))].sort(),
    [listings]
  );

  const locations = useMemo(
    () => [...new Set(listings.map((l) => l.location))].sort(),
    [listings]
  );

  const filtered = useMemo(() => {
    let result = listings;
    if (selectedCategory) result = result.filter((l) => l.category === selectedCategory);
    if (selectedLocation) result = result.filter((l) => l.location === selectedLocation);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.businessName.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [listings, selectedCategory, selectedLocation, searchQuery]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative z-50 lg:z-auto transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <DirectorySidebar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          locations={locations}
          selectedCategory={selectedCategory}
          selectedLocation={selectedLocation}
          onCategoryChange={(v) => { setSelectedCategory(v); setSidebarOpen(false); }}
          onLocationChange={(v) => { setSelectedLocation(v); setSidebarOpen(false); }}
          totalListings={filtered.length}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top header bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                <span className="text-gradient-brand">Patio Business</span> Directory
              </h1>
              <p className="font-editorial text-sm text-muted-foreground italic hidden sm:block">
                Curated businesses we trust, love, and proudly recommend.
              </p>
            </div>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans text-sm shadow-luxury">
            <Link to="/submit">Get Featured</Link>
          </Button>
        </header>

        {/* Grid content */}
        <main className="flex-1 px-6 py-8 max-w-[1400px] mx-auto w-full">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="font-editorial text-lg text-muted-foreground italic">
                We couldn't load the directory right now. Please try again shortly.
              </p>
            </div>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-foreground mb-2">No listings found</p>
              <p className="font-editorial text-muted-foreground italic">
                Try adjusting your search or filters.
              </p>
            </div>
          )}

          {!isLoading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((listing, i) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  index={i}
                  onClick={() => setSelectedListing(listing)}
                />
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-8 text-center bg-secondary">
          <p className="font-editorial text-sm text-secondary-foreground/70 italic">
            Curated with care by The Patieaux Chick · See you on the Patieaux.
          </p>
        </footer>
      </div>

      {/* Listing detail overlay */}
      <ListingDetailDialog
        listing={selectedListing}
        open={!!selectedListing}
        onOpenChange={(open) => !open && setSelectedListing(null)}
      />
    </div>
  );
};

export default Index;
