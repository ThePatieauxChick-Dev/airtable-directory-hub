import { ChevronDown, MapPin, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface DirectorySidebarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  locations: string[];
  selectedCategory: string | null;
  selectedLocation: string | null;
  onCategoryChange: (cat: string | null) => void;
  onLocationChange: (loc: string | null) => void;
  totalListings: number;
}

const DirectorySidebar = ({
  searchQuery,
  onSearchChange,
  categories,
  locations,
  selectedCategory,
  selectedLocation,
  onCategoryChange,
  onLocationChange,
  totalListings,
}: DirectorySidebarProps) => {
  const hasFilters = !!selectedCategory || !!selectedLocation || !!searchQuery.trim();
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [locationOpen, setLocationOpen] = useState(true);
  const [locationSearch, setLocationSearch] = useState("");

  const filteredLocations = useMemo(() => {
    const q = locationSearch.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((loc) => loc.toLowerCase().includes(q));
  }, [locationSearch, locations]);

  return (
    <aside className="w-80 shrink-0 bg-sidebar/95 border-r border-sidebar-border h-screen sticky top-0 flex flex-col backdrop-blur-xl">
      <div className="px-6 pt-8 pb-5">
        <p className="font-editorial text-xs tracking-[0.35em] uppercase text-sidebar-primary mb-2">
          The Patieaux Chick
        </p>
        <h2 className="font-display text-2xl font-semibold text-sidebar-foreground leading-tight">
          Curated Directory
        </h2>
        <p className="font-editorial text-sm text-sidebar-foreground/60 italic mt-2">
          {totalListings} refined {totalListings === 1 ? "listing" : "listings"}
        </p>
      </div>

      <Separator className="bg-sidebar-border" />

      <div className="px-5 py-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-foreground/40" />
          <Input
            type="text"
            placeholder="Search by brand, service, vibe..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-3 h-11 bg-sidebar-accent/70 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/40 text-sm rounded-xl focus-visible:ring-sidebar-primary"
          />
        </div>

        {hasFilters && (
          <button
            onClick={() => {
              onCategoryChange(null);
              onLocationChange(null);
              onSearchChange("");
              setLocationSearch("");
            }}
            className="flex items-center gap-1.5 text-xs text-sidebar-primary hover:text-sidebar-primary/80 transition-colors font-sans"
          >
            <X className="h-3 w-3" />
            Clear all filters
          </button>
        )}
      </div>

      <ScrollArea className="flex-1 px-5">
        <div className="space-y-4 pb-6">
          <Collapsible open={categoryOpen} onOpenChange={setCategoryOpen}>
            <CollapsibleTrigger className="w-full flex items-center justify-between rounded-lg px-3 py-2 hover:bg-sidebar-accent/60 transition-colors">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-sidebar-foreground/60" />
                <p className="text-[11px] font-sans uppercase tracking-[0.2em] text-sidebar-foreground/60 font-medium">
                  Categories
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 text-sidebar-foreground/50 transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-1">
              <SidebarFilterItem
                label="All Categories"
                active={selectedCategory === null}
                onClick={() => onCategoryChange(null)}
              />
              {categories.map((cat) => (
                <SidebarFilterItem
                  key={cat}
                  label={cat}
                  active={selectedCategory === cat}
                  onClick={() => onCategoryChange(selectedCategory === cat ? null : cat)}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* <Collapsible open={locationOpen} onOpenChange={setLocationOpen}>
            <CollapsibleTrigger className="w-full flex items-center justify-between rounded-lg px-3 py-2 hover:bg-sidebar-accent/60 transition-colors">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-sidebar-foreground/60" />
                <p className="text-[11px] font-sans uppercase tracking-[0.2em] text-sidebar-foreground/60 font-medium">
                  Location
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 text-sidebar-foreground/50 transition-transform ${locationOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sidebar-foreground/40" />
                <Input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Type city, state, or area"
                  className="pl-8 h-9 text-xs rounded-lg bg-sidebar-accent/60 border-sidebar-border"
                />
              </div>

              <SidebarFilterItem
                label="All Locations"
                active={selectedLocation === null}
                onClick={() => onLocationChange(null)}
              />

              {filteredLocations.slice(0, 20).map((loc) => (
                <SidebarFilterItem
                  key={loc}
                  label={loc}
                  active={selectedLocation === loc}
                  onClick={() => onLocationChange(selectedLocation === loc ? null : loc)}
                />
              ))}

              {locationSearch.trim() && filteredLocations.length === 0 && (
                <p className="px-3 py-2 text-xs text-sidebar-foreground/50">No location matches</p>
              )}
            </CollapsibleContent>
          </Collapsible> */}
        </div>
      </ScrollArea>

      {(selectedCategory || selectedLocation) && (
        <div className="px-5 py-3 border-t border-sidebar-border">
          <p className="text-[10px] font-sans uppercase tracking-wider text-sidebar-foreground/40 mb-2">Active Filters</p>
          <div className="flex flex-wrap gap-1.5">
            {selectedCategory && (
              <Badge
                className="bg-sidebar-primary/20 text-sidebar-primary border-0 text-xs cursor-pointer hover:bg-sidebar-primary/30"
                onClick={() => onCategoryChange(null)}
              >
                {selectedCategory} ×
              </Badge>
            )}
            {selectedLocation && (
              <Badge
                className="bg-sidebar-primary/20 text-sidebar-primary border-0 text-xs cursor-pointer hover:bg-sidebar-primary/30"
                onClick={() => onLocationChange(null)}
              >
                {selectedLocation} ×
              </Badge>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

const SidebarFilterItem = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-sans transition-all ${
      active
        ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow"
        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
    }`}
  >
    {label}
  </button>
);

export default DirectorySidebar;
