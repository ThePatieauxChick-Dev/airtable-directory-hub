import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchListings, type Listing } from "@/lib/airtable";
import DirectorySidebar from "@/components/DirectorySidebar";
import ListingCard from "@/components/ListingCard";
import ListingDetailDialog from "@/components/ListingDetailDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

const normalizeLocation = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

  const {
    data: listings = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["listings"],
    queryFn: fetchListings,
  });

  const categories = useMemo(
    () => [...new Set(listings.map((l) => l.category))].sort(),
    [listings]
  );
  const locations = useMemo(
    () => [...new Set(listings.map((l) => l.cityAndState))].sort(),
    [listings]
  );

  const filtered = useMemo(() => {
    let result = listings;
    if (selectedCategory)
      result = result.filter((l) => l.category === selectedCategory);
    if (selectedLocation) {
      const selected = normalizeLocation(selectedLocation);
      result = result.filter((l) =>
        normalizeLocation(l.cityAndState).includes(selected)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.businessName.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.cityAndState.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [listings, selectedCategory, selectedLocation, searchQuery]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--secondary))_0%,_hsl(var(--background))_1%)] flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <div
        className={`fixed lg:relative z-50 lg:z-auto transition-all duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${desktopSidebarCollapsed ? "lg:w-0 lg:overflow-hidden" : "lg:w-auto"}`}
      >
        <DirectorySidebar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          locations={locations}
          selectedCategory={selectedCategory}
          selectedLocation={selectedLocation}
          onCategoryChange={(v) => {
            setSelectedCategory(v);
            setSidebarOpen(false);
          }}
          onLocationChange={(v) => {
            setSelectedLocation(v);
            setSidebarOpen(false);
          }}
          totalListings={filtered.length}
        />
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header – redesigned for mobile */}
        <header className="sticky top-0 z-30 bg-background/70 backdrop-blur-xl border-b border-border px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors shrink-0"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <button
              onClick={() => setDesktopSidebarCollapsed((prev) => !prev)}
              className="hidden lg:inline-flex p-2 rounded-md hover:bg-muted transition-colors shrink-0"
              aria-label={
                desktopSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
            >
              {desktopSidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>

            {/* Logo – fixed filename */}
            <div className="h-8 w-8 sm:h-11 sm:w-11 md:h-12 md:w-12 shrink-0 overflow-hidden">
              <img
                src="/brand-logo.png" // ← fixed double extension
                alt="The Patieaux Chick logo"
                className="h-full w-full object-contain"
              />
            </div>

            {/* Title block – responsive text */}
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-lg sm:text-2xl md:text-3xl font-semibold text-foreground leading-tight text-center">
                <span className="text-gradient-brand whitespace-nowrap">
                  The Patieaux 
                </span>{" "}
                <span className="whitespace-nowrap">Business Guide</span>
              </h1>
              <p className="font-editorial text-xs sm:text-sm text-muted-foreground italic hidden xs:block truncate">
                Elevated vendors, curated for style, quality, and trust.
              </p>
            </div>
          </div>

          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans text-xs sm:text-sm shadow-luxury rounded-full px-3 sm:px-6 py-2 h-auto shrink-0"
          >
            <Link to="https://bit.ly/thepatieauxbusinessguide">Get Featured</Link>
          </Button>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-[1500px] mx-auto w-full space-y-6 sm:space-y-8">
          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-16 sm:py-20">
              <p className="font-editorial text-base sm:text-lg text-muted-foreground italic">
                We couldn&apos;t load the directory right now. Please try again
                shortly.
              </p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && filtered.length === 0 && (
            <div className="text-center py-16 sm:py-20">
              <p className="font-display text-xl sm:text-2xl text-foreground mb-2">
                No listings found
              </p>
              <p className="font-editorial text-sm sm:text-base text-muted-foreground italic">
                Try adjusting your search or filters.
              </p>
            </div>
          )}

          {/* Listing grid */}
          {!isLoading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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

        <footer className="border-t border-border py-6 sm:py-8 text-center bg-secondary/80 backdrop-blur-sm px-4">
          <p className="font-editorial text-xs sm:text-sm text-secondary-foreground/70 italic">
            Curated with care by The Patieaux Chick · See you on the Patieaux.
          </p>
        </footer>
      </div>

      <ListingDetailDialog
        listing={selectedListing}
        open={!!selectedListing}
        onOpenChange={(open) => !open && setSelectedListing(null)}
      />
    </div>
  );
};

export default Index;