import { ArrowUpRight, ExternalLink, Instagram, MapPin, Star } from "lucide-react";
import type { Listing } from "@/lib/airtable";
import { useCardView, useTrackClick } from "@/hooks/use-listing-analytics";

interface ListingCardProps {
  listing: Listing;
  index: number;
  onClick: () => void;
}

const ListingCard = ({ listing, index, onClick }: ListingCardProps) => {
  const cardRef = useCardView(listing.id, listing.businessName);
  const trackWebsite = useTrackClick(listing.id, listing.businessName, "website_click");
  const trackInstagram = useTrackClick(listing.id, listing.businessName, "instagram_click");

  const instagramUrl = listing.instagram
    ? listing.instagram.startsWith("http")
      ? listing.instagram
      : `https://instagram.com/${listing.instagram.replace("@", "")}`
    : null;

  return (
    <article
      ref={cardRef as React.RefObject<HTMLElement>}
      className="group bg-card/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-border/60 shadow-luxury hover:shadow-luxury-lg hover:-translate-y-1.5 transition-all duration-500 opacity-0 animate-fade-in cursor-pointer"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {listing.businessPhoto ? (
          <img
            src={listing.businessPhoto}
            alt={listing.businessName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-luxury flex items-center justify-center">
            <span className="font-display text-4xl text-primary-foreground/30">
              {listing.businessName.charAt(0)}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span className="bg-primary/90 text-primary-foreground text-[10px] font-sans uppercase tracking-[0.15em] px-3 py-1 rounded-full backdrop-blur-sm">
            {listing.category}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-black/35 text-white text-[10px] px-2.5 py-1 backdrop-blur-sm">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </span>
        </div>

        {listing.ownerHeadshot && (
          <div className="absolute bottom-3 right-3 w-11 h-11 rounded-full border-2 border-card overflow-hidden shadow-luxury">
            <img
              src={listing.ownerHeadshot}
              alt={`Owner of ${listing.businessName}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>

      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground leading-tight group-hover:text-accent transition-colors">
            {listing.businessName}
          </h3>
          {listing.ownerName && (
            <p className="text-xs font-sans uppercase tracking-[0.12em] text-muted-foreground mt-1">
              Owned by {listing.ownerName}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-2">
            <MapPin className="h-3 w-3 text-accent" />
            <span className="text-xs text-muted-foreground font-sans">{listing.location}</span>
          </div>
        </div>

        {listing.description && (
          <p className="text-sm text-muted-foreground font-editorial leading-relaxed line-clamp-2 italic">
            {listing.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          {listing.priceRange ? (
            <p className="text-xs font-sans text-accent font-semibold tracking-wide">
              {listing.priceRange}
            </p>
          ) : <span />}
          <span className="inline-flex items-center gap-1 text-xs font-sans text-foreground/70 group-hover:text-accent transition-colors">
            Full details
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-border">
          {listing.website && (
            <a
              href={listing.website.startsWith("http") ? listing.website : `https://${listing.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-sans text-foreground/70 hover:text-accent transition-colors"
              onClick={(e) => { e.stopPropagation(); trackWebsite(); }}
            >
              <ExternalLink className="h-3 w-3" />
              Website
            </a>
          )}
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-sans text-foreground/70 hover:text-accent transition-colors"
              onClick={(e) => { e.stopPropagation(); trackInstagram(); }}
            >
              <Instagram className="h-3 w-3" />
              Instagram
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

export default ListingCard;
