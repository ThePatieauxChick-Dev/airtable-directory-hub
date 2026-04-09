import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchListings } from "@/lib/airtable";
import DirectoryHeader from "@/components/DirectoryHeader";
import FilterBar from "@/components/FilterBar";
import ListingCard from "@/components/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

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
    <div className="min-h-screen bg-background">
      <DirectoryHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalListings={filtered.length}
      />

      {!isLoading && listings.length > 0 && (
        <FilterBar
          categories={categories}
          locations={locations}
          selectedCategory={selectedCategory}
          selectedLocation={selectedLocation}
          onCategoryChange={setSelectedCategory}
          onLocationChange={setSelectedLocation}
        />
      )}

      <main className="px-6 pb-20 max-w-7xl mx-auto">
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] rounded-lg" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-10 text-center">
        <p className="font-editorial text-sm text-muted-foreground italic">
          Curated with care by The Patieaux Chick · See you on the Patieaux.
        </p>
      </footer>
    </div>
  );
};

export default Index;
