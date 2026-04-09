import { ExternalLink, Instagram, MapPin } from "lucide-react";
import type { Listing } from "@/lib/airtable";

interface ListingCardProps {
  listing: Listing;
  index: number;
}

const ListingCard = ({ listing, index }: ListingCardProps) => {
  const instagramUrl = listing.instagram
    ? listing.instagram.startsWith("http")
      ? listing.instagram
      : `https://instagram.com/${listing.instagram.replace("@", "")}`
    : null;

  return (
    <article
      className="group bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300 opacity-0 animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Business Photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {listing.businessPhoto ? (
          <img
            src={listing.businessPhoto}
            alt={listing.businessName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-3xl text-muted-foreground/30">
              {listing.businessName.charAt(0)}
            </span>
          </div>
        )}

        {/* Category badge */}
        <span className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs font-sans uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-sm">
          {listing.category}
        </span>

        {/* Owner headshot */}
        {listing.ownerHeadshot && (
          <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full border-2 border-card overflow-hidden shadow-md">
            <img
              src={listing.ownerHeadshot}
              alt={`Owner of ${listing.businessName}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground leading-tight">
            {listing.businessName}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5">
            <MapPin className="h-3.5 w-3.5 text-accent" />
            <span className="text-sm text-muted-foreground font-sans">{listing.location}</span>
          </div>
        </div>

        {listing.description && (
          <p className="text-sm text-muted-foreground font-editorial leading-relaxed line-clamp-3">
            {listing.description}
          </p>
        )}

        {listing.priceRange && (
          <p className="text-sm font-sans text-accent font-medium tracking-wide">
            {listing.priceRange}
          </p>
        )}

        {/* Links */}
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          {listing.website && (
            <a
              href={listing.website.startsWith("http") ? listing.website : `https://${listing.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-sans text-foreground hover:text-accent transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Website
            </a>
          )}
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-sans text-foreground hover:text-accent transition-colors"
            >
              <Instagram className="h-3.5 w-3.5" />
              Instagram
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

export default ListingCard;
