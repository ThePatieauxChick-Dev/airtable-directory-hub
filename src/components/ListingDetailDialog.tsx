import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, Instagram, MapPin, X } from "lucide-react";
import type { Listing } from "@/lib/airtable";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ListingDetailDialogProps {
  listing: Listing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ListingDetailDialog = ({ listing, open, onOpenChange }: ListingDetailDialogProps) => {
  if (!listing) return null;

  const instagramUrl = listing.instagram
    ? listing.instagram.startsWith("http")
      ? listing.instagram
      : `https://instagram.com/${listing.instagram.replace("@", "")}`
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-0 shadow-luxury-lg rounded-xl bg-card">
        <VisuallyHidden>
          <DialogTitle>{listing.businessName}</DialogTitle>
        </VisuallyHidden>

        {/* Hero image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {listing.businessPhoto ? (
            <img
              src={listing.businessPhoto}
              alt={listing.businessName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-luxury flex items-center justify-center">
              <span className="font-display text-6xl text-primary-foreground/30">
                {listing.businessName.charAt(0)}
              </span>
            </div>
          )}

          {/* Category badge */}
          <span className="absolute top-4 left-4 bg-primary/90 text-primary-foreground text-xs font-sans uppercase tracking-wider px-4 py-1.5 rounded-full backdrop-blur-sm">
            {listing.category}
          </span>

          {/* Owner headshot */}
          {listing.ownerHeadshot && (
            <div className="absolute bottom-4 right-4 w-16 h-16 rounded-full border-[3px] border-card overflow-hidden shadow-luxury">
              <img
                src={listing.ownerHeadshot}
                alt={`Owner of ${listing.businessName}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8 space-y-5">
          <div>
            <h2 className="font-display text-3xl font-semibold text-foreground leading-tight">
              {listing.businessName}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="h-4 w-4 text-accent" />
              <span className="text-sm text-muted-foreground font-sans">{listing.location}</span>
            </div>
          </div>

          {listing.description && (
            <p className="text-base text-muted-foreground font-editorial leading-relaxed italic">
              {listing.description}
            </p>
          )}

          {listing.priceRange && (
            <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
              <span className="text-sm font-sans text-accent font-semibold tracking-wide">
                {listing.priceRange}
              </span>
            </div>
          )}

          {/* Links */}
          <div className="flex items-center gap-4 pt-4 border-t border-border">
            {listing.website && (
              <a
                href={listing.website.startsWith("http") ? listing.website : `https://${listing.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-sans font-medium hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Visit Website
              </a>
            )}
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-foreground text-sm font-sans font-medium hover:border-accent hover:text-accent transition-colors"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListingDetailDialog;
