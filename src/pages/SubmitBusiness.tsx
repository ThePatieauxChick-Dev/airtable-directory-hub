import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    phone: "",
    businessName: "",
    category: "",
    location: "",
    description: "",
    priceRange: "",
    website: "",
    instagram: "",
    reason: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.ownerName.trim() || !form.email.trim() || !form.businessName.trim() || !form.category || !form.location.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("business_submissions").insert({
      owner_name: form.ownerName.trim().slice(0, 200),
      email: form.email.trim().slice(0, 255),
      phone: form.phone.trim().slice(0, 30) || null,
      business_name: form.businessName.trim().slice(0, 200),
      category: form.category.slice(0, 100),
      location: form.location.trim().slice(0, 200),
      description: form.description.trim().slice(0, 2000),
      price_range: form.priceRange.trim().slice(0, 50) || null,
      website: form.website.trim().slice(0, 500) || null,
      instagram: form.instagram.trim().slice(0, 100) || null,
      reason: form.reason.trim().slice(0, 2000) || null,
    });

    setIsSubmitting(false);

    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-lg text-center space-y-6">
          <h1 className="font-display text-4xl font-semibold text-foreground">
            Application Received!
          </h1>
          <p className="font-editorial text-lg text-muted-foreground italic leading-relaxed">
            Thank you for your interest in being featured in the Patio Guide Directory.
            We'll review your submission and be in touch soon.
          </p>
          <p className="text-sm text-muted-foreground font-sans">
            To complete your listing, please submit your payment below.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
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
      {/* Header */}
      <header className="py-10 px-6 text-center border-b border-border">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-sans mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Link>
        <p className="font-editorial text-base tracking-[0.3em] uppercase text-accent mb-3">
          The Patieaux Chick
        </p>
        <h1 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-3">
          Get Your Business Featured
        </h1>
        <p className="font-editorial text-lg text-muted-foreground italic max-w-xl mx-auto">
          Join our curated directory and get in front of 200,000+ women who are ready to discover and support businesses like yours.
        </p>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Owner Info */}
          <section className="space-y-5">
            <h2 className="font-display text-xl font-semibold text-foreground border-b border-border pb-2">
              Your Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="ownerName" className="font-sans text-sm">Full Name *</Label>
                <Input
                  id="ownerName"
                  value={form.ownerName}
                  onChange={(e) => update("ownerName", e.target.value)}
                  placeholder="Your full name"
                  maxLength={200}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-sans text-sm">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@email.com"
                  maxLength={255}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="font-sans text-sm">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="(555) 123-4567"
                maxLength={30}
              />
            </div>
          </section>

          {/* Business Info */}
          <section className="space-y-5">
            <h2 className="font-display text-xl font-semibold text-foreground border-b border-border pb-2">
              Business Details
            </h2>
            <div className="space-y-2">
              <Label htmlFor="businessName" className="font-sans text-sm">Business Name *</Label>
              <Input
                id="businessName"
                value={form.businessName}
                onChange={(e) => update("businessName", e.target.value)}
                placeholder="Your business name"
                maxLength={200}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="category" className="font-sans text-sm">Category *</Label>
                <Select value={form.category} onValueChange={(v) => update("category", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="font-sans text-sm">Location *</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="City, State"
                  maxLength={200}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="font-sans text-sm">Business Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Tell us about your business, what you offer, and what makes you special..."
                rows={4}
                maxLength={2000}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceRange" className="font-sans text-sm">Price Range</Label>
              <Input
                id="priceRange"
                value={form.priceRange}
                onChange={(e) => update("priceRange", e.target.value)}
                placeholder="e.g. $$ or $50–$150"
                maxLength={50}
              />
            </div>
          </section>

          {/* Online Presence */}
          <section className="space-y-5">
            <h2 className="font-display text-xl font-semibold text-foreground border-b border-border pb-2">
              Online Presence
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="website" className="font-sans text-sm">Website</Label>
                <Input
                  id="website"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  placeholder="https://yourbusiness.com"
                  maxLength={500}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram" className="font-sans text-sm">Instagram Handle</Label>
                <Input
                  id="instagram"
                  value={form.instagram}
                  onChange={(e) => update("instagram", e.target.value)}
                  placeholder="@yourbusiness"
                  maxLength={100}
                />
              </div>
            </div>
          </section>

          {/* Why */}
          <section className="space-y-5">
            <h2 className="font-display text-xl font-semibold text-foreground border-b border-border pb-2">
              Why The Patio Guide?
            </h2>
            <div className="space-y-2">
              <Label htmlFor="reason" className="font-sans text-sm">
                Why do you want to be featured in The Patio Guide Directory?
              </Label>
              <Textarea
                id="reason"
                value={form.reason}
                onChange={(e) => update("reason", e.target.value)}
                placeholder="Tell us why your business is a perfect fit for our audience..."
                rows={3}
                maxLength={2000}
              />
            </div>
          </section>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 text-base font-sans bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Application
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground font-sans">
            After submitting, you'll be directed to complete payment to finalize your listing.
          </p>
        </form>
      </main>

      <footer className="border-t border-border py-10 text-center">
        <p className="font-editorial text-sm text-muted-foreground italic">
          Curated with care by The Patieaux Chick · See you on the Patieaux.
        </p>
      </footer>
    </div>
  );
};

export default SubmitBusiness;
