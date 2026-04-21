import { ArrowUpRight, ExternalLink, Instagram, MapPin } from "lucide-react";
import type { Listing } from "@/lib/airtable";

interface ListingCardProps {
  listing: Listing;
  index: number;
  onClick: () => void;
}

const ListingCard = ({ listing, index, onClick }: ListingCardProps) => {
  const instagramUrl = listing.instagram
    ? listing.instagram.startsWith("http")
      ? listing.instagram
      : `https://instagram.com/${listing.instagram.replace("@", "")}`
    : null;

  return (
    <article
      className="group bg-card/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-border/60 shadow-luxury hover:shadow-luxury-lg hover:-translate-y-1.5 transition-all duration-500 opacity-0 animate-fade-in cursor-pointer"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {listing.businessPhoto ? (
          <img
            src={listing.businessPhoto}
            alt={listing.businessName}
            className="w-fit h-fit object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-luxury flex items-center justify-center">
            <span className="font-display text-4xl text-primary-foreground/30">
              {listing.businessName.charAt(0)}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/5 to-black/5" />

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span className="bg-primary/60 text-primary-foreground text-[10px] font-sans uppercase tracking-[0.15em] px-3 py-1 rounded-full backdrop-blur-sm">
            {listing.category}
          </span>
        </div>

        {listing.ownerHeadshot && (
          <div className="absolute bottom-3 right-3 w-16 h-16 rounded-full border-2 border-card overflow-hidden shadow-luxury">
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
          {listing.fullName && (
            <p className="text-xs font-sans uppercase tracking-[0.12em] text-muted-foreground mt-1">
              By {listing.fullName}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-2">
            <MapPin className="h-3 w-3 text-accent" />
            <span className="text-xs text-muted-foreground font-sans">
              {listing.cityAndState}{listing.country ? `, ${listing.country}` : ""}
            </span>
          </div>
        </div>

        {listing.description && (
          <p className="text-sm text-muted-foreground font-editorial leading-relaxed line-clamp-2 italic">
            {listing.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span />
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
              onClick={(e) => e.stopPropagation()}
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
              onClick={(e) => e.stopPropagation()}
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
