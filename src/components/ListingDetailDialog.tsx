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
      <DialogContent className="max-w-xl p-0 overflow-hidden border border-border/70 shadow-luxury-lg rounded-3xl bg-card/95 backdrop-blur-xl h-[95%]">
        <VisuallyHidden>
          <DialogTitle>{listing.businessName}</DialogTitle>
        </VisuallyHidden>

        {/* Hero Image Section */}
        <div className="relative h-72 w-fit overflow-hidden bg-muted">
          {listing.businessPhoto ? (
            <img
              src={listing.businessPhoto}
              alt={listing.businessName}
              className="mb-20 w-fit h-fit object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-luxury flex items-center justify-center">
              <span className="font-display text-6xl text-primary-foreground/30">
                {listing.businessName.charAt(0)}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/10" />

          <span className="absolute top-4 left-4 bg-primary/90 text-primary-foreground text-xs font-sans uppercase tracking-wider px-4 py-1.5 rounded-full backdrop-blur-sm">
            {listing.category}
          </span>

          {listing.ownerHeadshot && (
            <div className="absolute bottom-4 right-4 w-28 h-28 rounded-full border-[3px] border-card overflow-hidden shadow-luxury">
              <img
                src={listing.ownerHeadshot}
                alt={`Owner of ${listing.businessName}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="max-h-[calc(85vh-16rem)] overflow-y-auto">
          <div className="px-6 space-y-5">
            {/* Header Section */}
            <div className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-foreground leading-tight">
                {listing.businessName}
              </h2>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground font-sans">
                  <MapPin className="h-4 w-4 text-accent" />
                  {listing.cityAndState}{listing.country ? `, ${listing.country}` : ''}
                </span>
                {listing.fullName && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground font-sans">
                    <User className="h-4 w-4 text-accent" />
                    {listing.fullName}
                  </span>
                )}
              </div>
            </div>

            {/* Bio */}
            {listing.description && (
              <div className="bg-secondary/30 rounded-2xl p-4 border border-border/40">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-sans mb-2">About</p>
                <p className="text-base font-editorial leading-relaxed font-bold italic">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Services Offered */}
            {listing.servicesOffered && (
              <div className="bg-secondary/30 rounded-2xl p-4 border border-border/40">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-sans mb-2">What We Offer</p>
                <p className="text-sm text-foreground font-sans leading-relaxed">
                  {listing.servicesOffered}
                </p>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {listing.phone && (
                <InfoBlock title="Phone" value={listing.phone} icon={<Phone className="h-3.5 w-3.5" />} />
              )}
              {listing.email && (
                <InfoBlock title="Email" value={listing.email} icon={<Mail className="h-3.5 w-3.5" />} />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {listing.website && (
                <ActionButton
                  href={listing.website.startsWith("http") ? listing.website : `https://${listing.website}`}
                  variant="primary"
                  icon={<ExternalLink className="h-4 w-4" />}
                >
                  Website
                </ActionButton>
              )}
              
              {instagramUrl && (
                <ActionButton
                  href={instagramUrl}
                  variant="secondary"
                  icon={<Instagram className="h-4 w-4" />}
                >
                  Instagram
                </ActionButton>
              )}
              
              {listing.otherSocialMedia && (
                <ActionButton
                  href={listing.otherSocialMedia.startsWith("http") ? listing.otherSocialMedia : `https://${listing.otherSocialMedia}`}
                  variant="secondary"
                  icon={<ExternalLink className="h-4 w-4" />}
                >
                  Social
                </ActionButton>
              )}
              
              {listing.email && (
                <ActionButton
                  href={`mailto:${listing.email}`}
                  variant="secondary"
                  icon={<Mail className="h-4 w-4" />}
                >
                  Email
                </ActionButton>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Extracted ActionButton component for cleaner code
const ActionButton = ({
  href,
  variant,
  icon,
  children,
}: {
  href: string;
  variant: "primary" | "secondary";
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`
      inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-sans font-medium transition-all
      ${variant === "primary" 
        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow" 
        : "border border-border text-foreground hover:border-accent hover:text-accent bg-background/50"
      }
    `}
  >
    {icon}
    {children}
  </a>
);

const InfoBlock = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon?: React.ReactNode;
}) => (
  <div className="rounded-xl border border-border/50 bg-secondary/30 px-4 py-3 hover:border-border/80 transition-colors">
    <p className="text-xs uppercase tracking-wider text-muted-foreground font-sans mb-1.5">
      {title}
    </p>
    <p className="text-sm text-foreground font-sans leading-relaxed inline-flex items-start gap-2">
      {icon && <span className="text-accent shrink-0 mt-0.5">{icon}</span>}
      <span>{value}</span>
    </p>
  </div>
);

export default ListingDetailDialog;