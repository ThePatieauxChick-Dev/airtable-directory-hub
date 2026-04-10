import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PAYMENT_LINK = "https://example.com/pay"; // TODO: Replace with actual payment link

const CATEGORIES = [
  "Beauty & Wellness",
  "Fashion & Accessories",
  "Food & Beverage",
  "Health & Fitness",
  "Home & Living",
  "Professional Services",
  "Events & Entertainment",
  "Other",
];

const SubmitBusiness = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    ownerName: "",
    email: "",
    businessName: "",
    headshot: "",
    businessPhoto: "",
    category: "",
    location: "",
    description: "",
    servicesOffered: "",
    priceRange: "",
    website: "",
    instagram: "",
    otherSocialMedia: "",
    howToContact: "",
    contactDetails: "",
    emailSelected: false,
  });

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.ownerName.trim() || !form.email.trim() || !form.businessName.trim() || !form.category || !form.location.trim()) {
      toast.error("Please complete all required fields.");
      return;
    }

    if (!form.contactDetails.trim()) {
      toast.error("Please add contact details so members can reach you.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    const { error: dbError } = await supabase.from("business_submissions").insert({
      owner_name: form.ownerName.trim().slice(0, 200),
      email: form.email.trim().slice(0, 255),
      business_name: form.businessName.trim().slice(0, 200),
      category: form.category.slice(0, 100),
      location: form.location.trim().slice(0, 200),
      description: form.description.trim().slice(0, 2000),
      price_range: form.priceRange.trim().slice(0, 50) || null,
      website: form.website.trim().slice(0, 500) || null,
      instagram: form.instagram.trim().slice(0, 100) || null,
      owner_headshot: form.headshot.trim().slice(0, 1000) || null,
      business_photo: form.businessPhoto.trim().slice(0, 1000) || null,
      services_offered: form.servicesOffered.trim().slice(0, 2000) || null,
      other_social_media: form.otherSocialMedia.trim().slice(0, 500) || null,
      how_to_contact: form.howToContact.trim().slice(0, 100) || null,
      contact_details: form.contactDetails.trim().slice(0, 500),
      email_selected: form.emailSelected,
    });

    try {
      await supabase.functions.invoke("submit-to-airtable", {
        body: {
          ownerName: form.ownerName.trim(),
          email: form.email.trim(),
          businessName: form.businessName.trim(),
          headshot: form.headshot.trim() || null,
          businessPhoto: form.businessPhoto.trim() || null,
          category: form.category,
          location: form.location.trim(),
          description: form.description.trim(),
          servicesOffered: form.servicesOffered.trim() || null,
          priceRange: form.priceRange.trim() || null,
          website: form.website.trim() || null,
          instagram: form.instagram.trim() || null,
          otherSocialMedia: form.otherSocialMedia.trim() || null,
          howToContact: form.howToContact.trim() || null,
          contactDetails: form.contactDetails.trim(),
          emailSelected: form.emailSelected,
        },
      });
    } catch (airtableErr) {
      console.error("Airtable sync error:", airtableErr);
    }

    setIsSubmitting(false);

    if (dbError) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-lg text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Send className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-4xl font-semibold text-foreground">
            You&apos;re in, Suga!
          </h1>
          <p className="font-editorial text-lg text-muted-foreground italic leading-relaxed">
            Thank you for sharing your business with The Patieaux Chick community. Our team will review
            your details and follow up with care.
          </p>
          <p className="text-sm text-muted-foreground font-sans">
            To complete your listing, please submit payment below.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-luxury">
              <a href={PAYMENT_LINK} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Complete Payment
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Back to Directory</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="relative py-14 px-6 text-center border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-luxury opacity-[0.04]" />
        <div className="relative">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-sans mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Link>
          <p className="font-editorial text-sm tracking-[0.35em] uppercase text-accent mb-3">
            The Patieaux Chick
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-3">
            Apply to Be Featured
          </h1>
          <p className="font-editorial text-lg text-muted-foreground italic max-w-2xl mx-auto">
            Because your Patieaux deserves more than just furniture. Share your business details below and let
            us spotlight what makes your brand beautiful.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          <FormSection title="Business Owner">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Owner Name *" id="ownerName">
                <Input id="ownerName" value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} placeholder="Your full name" maxLength={200} required />
              </FormField>
              <FormField label="Email *" id="email">
                <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@email.com" maxLength={255} required />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Headshot URL" id="headshot">
                <Input id="headshot" value={form.headshot} onChange={(e) => update("headshot", e.target.value)} placeholder="https://..." maxLength={1000} />
              </FormField>
              <FormField label="Business Photo URL" id="businessPhoto">
                <Input id="businessPhoto" value={form.businessPhoto} onChange={(e) => update("businessPhoto", e.target.value)} placeholder="https://..." maxLength={1000} />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Business Profile">
            <FormField label="Business Name *" id="businessName">
              <Input id="businessName" value={form.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder="Your business name" maxLength={200} required />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Category *" id="category">
                <Select value={form.category} onValueChange={(v) => update("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Location *" id="location">
                <Input id="location" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="City, State" maxLength={200} required />
              </FormField>
            </div>

            <FormField label="Business Description" id="description">
              <Textarea id="description" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Tell us about your business and the experience you create..." rows={4} maxLength={2000} />
            </FormField>

            <FormField label="Services Offered" id="servicesOffered">
              <Textarea id="servicesOffered" value={form.servicesOffered} onChange={(e) => update("servicesOffered", e.target.value)} placeholder="List your primary services, packages, or specialties." rows={3} maxLength={2000} />
            </FormField>

            <FormField label="Price Range" id="priceRange">
              <Input id="priceRange" value={form.priceRange} onChange={(e) => update("priceRange", e.target.value)} placeholder="e.g. $$ or $150–$500" maxLength={50} />
            </FormField>
          </FormSection>

          <FormSection title="Online + Contact Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Website" id="website">
                <Input id="website" value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://yourbusiness.com" maxLength={500} />
              </FormField>
              <FormField label="Instagram Handle" id="instagram">
                <Input id="instagram" value={form.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="@yourbusiness" maxLength={100} />
              </FormField>
            </div>

            <FormField label="Other Social Media" id="otherSocialMedia">
              <Input id="otherSocialMedia" value={form.otherSocialMedia} onChange={(e) => update("otherSocialMedia", e.target.value)} placeholder="https://facebook.com/... or another profile" maxLength={500} />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="How to Contact" id="howToContact">
                <Input id="howToContact" value={form.howToContact} onChange={(e) => update("howToContact", e.target.value)} placeholder="Email, DM, Phone, Website form" maxLength={100} />
              </FormField>
              <FormField label="Contact Details *" id="contactDetails">
                <Input id="contactDetails" value={form.contactDetails} onChange={(e) => update("contactDetails", e.target.value)} placeholder="Email, phone number, or contact link" maxLength={500} required />
              </FormField>
            </div>

            <div className="rounded-xl border border-border bg-secondary/40 p-4 flex items-start gap-3">
              <Checkbox
                id="emailSelected"
                checked={form.emailSelected}
                onCheckedChange={(checked) => update("emailSelected", Boolean(checked))}
              />
              <div className="space-y-1">
                <Label htmlFor="emailSelected" className="font-sans text-sm font-medium cursor-pointer">
                  Email selected
                </Label>
                <p className="text-xs text-muted-foreground font-sans">
                  Enable this if your preferred public contact method is email.
                </p>
              </div>
            </div>
          </FormSection>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 text-base font-sans bg-primary hover:bg-primary/90 text-primary-foreground shadow-luxury"
          >
            {isSubmitting ? "Submitting..." : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Application
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground font-sans">
            One application, one clear spotlight. After submission, payment completes your listing workflow.
          </p>
        </form>
      </main>

      <footer className="border-t border-border py-8 text-center bg-secondary">
        <p className="font-editorial text-sm text-secondary-foreground/70 italic">
          Curated with care by The Patieaux Chick · See you on the Patieaux.
        </p>
      </footer>
    </div>
  );
};

const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-5 rounded-2xl border border-border/70 bg-card p-6">
    <h2 className="font-display text-xl font-semibold text-foreground border-b border-border pb-3">
      {title}
    </h2>
    {children}
  </section>
);

const FormField = ({ label, id, children }: { label: string; id: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="font-sans text-sm">{label}</Label>
    {children}
  </div>
);

export default SubmitBusiness;
