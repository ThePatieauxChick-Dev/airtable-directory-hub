import { Badge } from "@/components/ui/badge";

interface FilterBarProps {
  categories: string[];
  locations: string[];
  selectedCategory: string | null;
  selectedLocation: string | null;
  onCategoryChange: (cat: string | null) => void;
  onLocationChange: (loc: string | null) => void;
}

const FilterBar = ({
  categories,
  locations,
  selectedCategory,
  selectedLocation,
  onCategoryChange,
  onLocationChange,
}: FilterBarProps) => {
  return (
    <div className="px-6 pb-10 max-w-7xl mx-auto space-y-6">
      {/* Categories */}
      <div>
        <p className="text-xs font-sans uppercase tracking-[0.2em] text-muted-foreground mb-3">
          Category
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className={`cursor-pointer transition-all font-sans text-sm px-4 py-1.5 rounded-full ${
              selectedCategory === null
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border text-muted-foreground hover:border-accent hover:text-accent"
            }`}
            onClick={() => onCategoryChange(null)}
          >
            All
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className={`cursor-pointer transition-all font-sans text-sm px-4 py-1.5 rounded-full ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border text-muted-foreground hover:border-accent hover:text-accent"
              }`}
              onClick={() => onCategoryChange(selectedCategory === cat ? null : cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Locations */}
      <div>
        <p className="text-xs font-sans uppercase tracking-[0.2em] text-muted-foreground mb-3">
          Location
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedLocation === null ? "default" : "outline"}
            className={`cursor-pointer transition-all font-sans text-sm px-4 py-1.5 rounded-full ${
              selectedLocation === null
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border text-muted-foreground hover:border-accent hover:text-accent"
            }`}
            onClick={() => onLocationChange(null)}
          >
            All
          </Badge>
          {locations.map((loc) => (
            <Badge
              key={loc}
              variant={selectedLocation === loc ? "default" : "outline"}
              className={`cursor-pointer transition-all font-sans text-sm px-4 py-1.5 rounded-full ${
                selectedLocation === loc
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border text-muted-foreground hover:border-accent hover:text-accent"
              }`}
              onClick={() => onLocationChange(selectedLocation === loc ? null : loc)}
            >
              {loc}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
