import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, Instagram, Mail, MapPin, MessageCircle, Phone, User } from "lucide-react";
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
      <DialogContent className="max-w-4xl p-0 overflow-hidden border border-border/70 shadow-luxury-lg rounded-3xl bg-card/95 backdrop-blur-xl">
        <VisuallyHidden>
          <DialogTitle>{listing.businessName}</DialogTitle>
        </VisuallyHidden>

        <div className="relative aspect-[16/7] overflow-hidden bg-muted">
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

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/25" />

          <span className="absolute top-4 left-4 bg-primary/90 text-primary-foreground text-xs font-sans uppercase tracking-wider px-4 py-1.5 rounded-full backdrop-blur-sm">
            {listing.category}
          </span>

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

        <div className="p-8 space-y-6">
          <div>
            <h2 className="font-display text-3xl font-semibold text-foreground leading-tight">
              {listing.businessName}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground font-sans">
                <MapPin className="h-4 w-4 text-accent" />
                {listing.location}
              </span>
              {listing.ownerName && (
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground font-sans">
                  <User className="h-4 w-4 text-accent" />
                  {listing.ownerName}
                </span>
              )}
            </div>
          </div>

          {listing.description && (
            <p className="text-base text-muted-foreground font-editorial leading-relaxed italic">
              {listing.description}
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {listing.servicesOffered && (
              <InfoBlock title="Services Offered" value={listing.servicesOffered} />
            )}
            {listing.priceRange && (
              <InfoBlock title="Price Range" value={listing.priceRange} />
            )}
            {listing.howToContact && (
              <InfoBlock title="How to Contact" value={listing.howToContact} icon={<MessageCircle className="h-4 w-4" />} />
            )}
            {listing.contactDetails && (
              <InfoBlock title="Contact Details" value={listing.contactDetails} icon={<Phone className="h-4 w-4" />} />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
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
            {listing.otherSocialMedia && (
              <a
                href={listing.otherSocialMedia.startsWith("http") ? listing.otherSocialMedia : `https://${listing.otherSocialMedia}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-foreground text-sm font-sans font-medium hover:border-accent hover:text-accent transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Other Social
              </a>
            )}
            {listing.emailSelected && listing.contactDetails && (
              <a
                href={`mailto:${listing.contactDetails}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-foreground text-sm font-sans font-medium hover:border-accent hover:text-accent transition-colors"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const InfoBlock = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon?: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-border/70 bg-secondary/40 px-4 py-3">
    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-sans mb-1">{title}</p>
    <p className="text-sm text-foreground font-sans leading-relaxed inline-flex items-start gap-2">
      {icon ? <span className="text-accent mt-0.5">{icon}</span> : null}
      <span>{value}</span>
    </p>
  </div>
);

export default ListingDetailDialog;
