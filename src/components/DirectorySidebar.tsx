import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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

  return (
    <aside className="w-72 lg:w-80 shrink-0 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 flex flex-col">
      {/* Brand header */}
      <div className="px-6 pt-8 pb-4">
        <p className="font-editorial text-xs tracking-[0.35em] uppercase text-sidebar-primary mb-1">
          The Patieaux Chick
        </p>
        <h2 className="font-display text-xl font-semibold text-sidebar-foreground leading-tight">
          Patio Guide
        </h2>
        <p className="font-editorial text-sm text-sidebar-foreground/60 italic mt-1">
          {totalListings} curated {totalListings === 1 ? "listing" : "listings"}
        </p>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Search */}
      <div className="px-5 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-foreground/40" />
          <Input
            type="text"
            placeholder="Search directory..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-3 h-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/40 text-sm rounded-lg focus-visible:ring-sidebar-primary"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-5">
        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={() => {
              onCategoryChange(null);
              onLocationChange(null);
              onSearchChange("");
            }}
            className="flex items-center gap-1.5 text-xs text-sidebar-primary hover:text-sidebar-primary/80 transition-colors font-sans mb-4"
          >
            <X className="h-3 w-3" />
            Clear all filters
          </button>
        )}

        {/* Categories */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="h-3.5 w-3.5 text-sidebar-foreground/50" />
            <p className="text-[11px] font-sans uppercase tracking-[0.2em] text-sidebar-foreground/50 font-medium">
              Category
            </p>
          </div>
          <div className="space-y-1">
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
          </div>
        </div>

        {/* Locations */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="h-3.5 w-3.5 text-sidebar-foreground/50" />
            <p className="text-[11px] font-sans uppercase tracking-[0.2em] text-sidebar-foreground/50 font-medium">
              Location
            </p>
          </div>
          <div className="space-y-1">
            <SidebarFilterItem
              label="All Locations"
              active={selectedLocation === null}
              onClick={() => onLocationChange(null)}
            />
            {locations.map((loc) => (
              <SidebarFilterItem
                key={loc}
                label={loc}
                active={selectedLocation === loc}
                onClick={() => onLocationChange(selectedLocation === loc ? null : loc)}
              />
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Active filters summary */}
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
    className={`w-full text-left px-3 py-2 rounded-md text-sm font-sans transition-all ${
      active
        ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
    }`}
  >
    {label}
  </button>
);

export default DirectorySidebar;
