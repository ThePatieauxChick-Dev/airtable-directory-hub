import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, CheckCircle } from "lucide-react";

const FALLBACK_BUSINESS_CATEGORIES = [
  "Food & Beverage (Curated Brands Only)",
  "Outdoor Living & Patio Design",
  "Wellness, Beauty & Self-Care",
  "Other (Subject to Approval)",
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Nigeria",
  "Ghana", "South Africa", "Jamaica", "Trinidad and Tobago", "Barbados",
  "Bahamas", "Antigua and Barbuda", "Saint Lucia", "Grenada",
  "Saint Kitts and Nevis", "Dominica", "Saint Vincent and the Grenadines",
  "Guyana", "Suriname", "Belize", "Panama", "Brazil", "Colombia",
  "France", "Germany", "Netherlands", "Italy", "Spain", "Portugal",
  "New Zealand", "Ireland", "Scotland", "Wales", "Other",
];

const inputClass =
  "w-full border border-[#c8a882] rounded px-3 py-2 bg-white/90 text-[#3a2a1a] placeholder-[#b09070] text-sm focus:outline-none focus:ring-2 focus:ring-[#c8a882] focus:border-transparent";

const labelClass = "block text-sm font-semibold text-[#3a2a1a] mb-1";

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  cityAndState: string;
  country: string;
  photo: File | null;
  headshot: File | null;
  shortBio: string;
  businessCategory: string;
  businessName: string;
  whatOffer: string;
  website: string;
  socialMedia: string;
  personalCategory: string;
  ack1: boolean;
  ack2: boolean;
  ack3: boolean;
  ack4: boolean;
}

const initialFormState: FormState = {
  fullName: "",
  phone: "",
  email: "",
  cityAndState: "",
  country: "",
  photo: null,
  headshot: null,
  shortBio: "",
  businessCategory: "",
  businessName: "",
  whatOffer: "",
  website: "",
  socialMedia: "",
  personalCategory: "",
  ack1: false,
  ack2: false,
  ack3: false,
  ack4: false,
};

const MAX_FILE_SIZE_MB = 4;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const SubmitBusiness = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headshotInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [headshotPreview, setHeadshotPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [businessCategories, setBusinessCategories] = useState<string[]>(FALLBACK_BUSINESS_CATEGORIES);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [form, setForm] = useState<FormState>(initialFormState);

  useEffect(() => {
    fetch("/api/get-categories")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      })
      .then((data: { categories: string[] }) => {
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setBusinessCategories(data.categories);
        }
      })
      .catch(() => {
        // Silently fall back to the static list
      })
      .finally(() => {
        setCategoriesLoading(false);
      });
  }, []);

  function set(field: keyof FormState, value: string | boolean | File | null) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_FILE_SIZE_BYTES) {
      setError(`Photo must be less than ${MAX_FILE_SIZE_MB} MB.`);
      e.target.value = ''; // Clear the input so user can try again
      return;
    }
    setError(null);
    set("photo", file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  }

  function handleHeadshotChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_FILE_SIZE_BYTES) {
      setError(`Headshot must be less than ${MAX_FILE_SIZE_MB} MB.`);
      e.target.value = '';
      return;
    }
    setError(null);
    set("headshot", file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setHeadshotPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setHeadshotPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!form.cityAndState.trim()) {
      setError("Please enter your city and state.");
      return;
    }
    if (!form.country) {
      setError("Please select your country.");
      return;
    }
    if (!form.shortBio.trim()) {
      setError("Please provide your short bio.");
      return;
    }
    if (!form.businessCategory) {
      setError("Please select the category that best fits your business.");
      return;
    }
    if (!form.businessName.trim()) {
      setError("Please enter your business name.");
      return;
    }
    if (!form.whatOffer.trim()) {
      setError("Please describe what you offer.");
      return;
    }
    if (!form.ack1 || !form.ack2 || !form.ack3 || !form.ack4) {
      setError("Please check all four acknowledgement boxes to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName.trim());
      formData.append("email", form.email.trim());
      formData.append("cityAndState", form.cityAndState.trim());
      formData.append("country", form.country);
      formData.append("businessName", form.businessName.trim());
      formData.append("category", form.businessCategory);
      formData.append("personalCategory", form.personalCategory);
      if (form.phone) formData.append("phone", form.phone);
      if (form.shortBio) formData.append("shortBio", form.shortBio.trim());
      if (form.whatOffer) formData.append("whatOffer", form.whatOffer.trim());
      if (form.website) formData.append("website", form.website);
      if (form.socialMedia) formData.append("socialMedia", form.socialMedia);
      if (form.photo) formData.append("photo", form.photo, form.photo.name);
      if (form.headshot) formData.append("headshot", form.headshot, form.headshot.name);

      const res = await fetch("/api/submit-listing", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setSuccess(true);
      setSubmitting(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-luxury-lg p-8 text-center border border-border">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
            Application Received!
          </h2>
          <p className="font-editorial text-muted-foreground italic mb-6">
            Thank you for your submission. Please chech your email inbox for a mail with futher communication.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-primary text-primary-foreground font-sans text-sm hover:bg-primary/90 transition-colors"
            >
              Return to Directory
            </Link>
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
            We support who we know. Share your business details below, and let us introduce your brand to our community of over 245,000 women.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ backgroundColor: "#f5cba7" }}
          className="rounded-xl p-8 space-y-8"
        >
          <section className="space-y-4">
            <h2 className="text-xl font-extrabold uppercase text-[#1a1008] tracking-wide border-b border-[#c8a882] pb-2">
              Your Details
            </h2>

            <div>
              <label className={labelClass}>
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                data-testid="input-fullName"
                type="text"
                placeholder="Full Name"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Headshot Upload */}
            <div>
              <label className={labelClass}>Upload Your Headshot</label>
              <div
                onClick={() => headshotInputRef.current?.click()}
                className="w-full border border-[#c8a882] rounded bg-white/80 flex items-center justify-center cursor-pointer hover:bg-white transition-colors"
                style={{ minHeight: "110px" }}
                data-testid="upload-headshot"
              >
                {headshotPreview ? (
                  <img
                    src={headshotPreview}
                    alt="Headshot Preview"
                    className="h-24 w-24 object-cover rounded"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 py-6 text-[#9a7558]">
                    <Upload className="h-8 w-8" />
                    <span className="text-xs">Click to upload a headshot</span>
                  </div>
                )}
              </div>
              <input
                ref={headshotInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleHeadshotChange}
              />
              <p className="text-xs text-[#7a5a3a] mt-1">
                Please upload a professional headshot. Max size: {MAX_FILE_SIZE_MB} MB.
              </p>
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                data-testid="input-phone"
                type="tel"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Email <span className="text-red-600">*</span>
              </label>
              <input
                data-testid="input-email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                What City and State do you do business in?{" "}
                <span className="text-red-600">*</span>
              </label>
              <input
                data-testid="input-cityAndState"
                type="text"
                placeholder="e.g. Atlanta, GA"
                value={form.cityAndState}
                onChange={(e) => set("cityAndState", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Country <span className="text-red-600">*</span>
              </label>
              <select
                data-testid="select-country"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>Select your country…</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-extrabold uppercase text-[#1a1008] tracking-wide border-b border-[#c8a882] pb-2">
              Your Business Details
            </h2>

            <section className="space-y-4">
              <div>
                <label className={labelClass}>
                  Business Name <span className="text-red-600">*</span>
                </label>
                <input
                  data-testid="input-businessName"
                  type="text"
                  placeholder="Your business name"
                  value={form.businessName}
                  onChange={(e) => set("businessName", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Short Bio (For Directory Display){" "}
                  <span className="text-red-600">*</span>
                </label>
                <textarea
                  data-testid="textarea-shortBio"
                  rows={4}
                  placeholder="Tell us who you are. This will be displayed publicly in the directory. Example: What you do, what you're known for, or what you're building."
                  value={form.shortBio}
                  onChange={(e) => set("shortBio", e.target.value)}
                  className={inputClass + " resize-y"}
                />
              </div>

              <div>
                <label className={labelClass}>Upload Your Business Photo</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-[#c8a882] rounded bg-white/80 flex items-center justify-center cursor-pointer hover:bg-white transition-colors"
                  style={{ minHeight: "110px" }}
                  data-testid="upload-photo"
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-24 w-24 object-cover rounded"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-6 text-[#9a7558]">
                      <Upload className="h-8 w-8" />
                      <span className="text-xs">Click to upload a photo</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <p className="text-xs text-[#7a5a3a] mt-1">
                  Please upload a clear, high-quality image that represents your business. Max size: {MAX_FILE_SIZE_MB} MB.
                </p>
              </div>

              <div>
                <label className={labelClass}>
                  Select the category that best fits your business:{" "}
                  <span className="text-red-600">*</span>
                </label>
                <select
                  data-testid="select-businessCategory"
                  value={form.businessCategory}
                  onChange={(e) => set("businessCategory", e.target.value)}
                  disabled={categoriesLoading}
                  className={inputClass}
                >
                  <option value="" disabled>
                    {categoriesLoading ? "Loading categories…" : "Select a category…"}
                  </option>
                  {businessCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div
                className="rounded-lg p-5 space-y-2"
                style={{ backgroundColor: "#eedcc4", border: "1px solid #c8a882" }}
              >
                <h3 className="text-base font-bold text-[#1a1008]">Important Note</h3>
                <p className="text-sm text-[#3a2a1a] leading-relaxed">
                  We are intentional about the businesses we feature. The Patieaux Business Guide is a curated
                  directory, and all submissions are reviewed to ensure alignment with our brand, audience, and
                  overall experience. If your business falls outside the listed categories, you may select{" "}
                  <strong>"Other (Subject to Approval)."</strong>
                </p>
              </div>

              <div>
                <label className={labelClass}>
                  What Do You Offer? <span className="text-red-600">*</span>
                </label>
                <textarea
                  data-testid="textarea-whatOffer"
                  rows={3}
                  placeholder="Briefly describe your product, service, or offering."
                  value={form.whatOffer}
                  onChange={(e) => set("whatOffer", e.target.value)}
                  className={inputClass + " resize-y"}
                />
              </div>

              <div>
                <label className={labelClass}>Website or Booking Link</label>
                <input
                  data-testid="input-website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Social Media Link (Instagram preferred)
                </label>
                <input
                  data-testid="input-socialMedia"
                  type="text"
                  placeholder="https://instagram.com/yourhandle"
                  value={form.socialMedia}
                  onChange={(e) => set("socialMedia", e.target.value)}
                  className={inputClass}
                />
              </div>
            </section>
          </section>

          <div
            className="rounded-lg p-5 space-y-2"
            style={{ backgroundColor: "#eedcc4", border: "1px solid #c8a882" }}
          >
            <h3 className="text-base font-bold text-[#1a1008]">Pause here. Review your details before you proceed.</h3>
            <p className="text-sm text-[#3a2a1a] leading-relaxed">
              Please <strong>review your submission</strong> carefully before proceeding. Once submitted, your entry enters our review queue. While backend edits are possible, we encourage you to double-check all details so your listing reflects exactly what you want the Patieaux community to see.
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-extrabold uppercase text-[#1a1008] tracking-wide border-b border-[#c8a882] pb-2">
              Acknowledgement
            </h2>

            <label className="flex items-start gap-3 cursor-pointer" data-testid="ack-1">
              <input
                type="checkbox"
                checked={form.ack1}
                onChange={(e) => set("ack1", e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[#8b5e3c] cursor-pointer"
              />
              <span className="text-sm text-[#3a2a1a]">
                I confirm that my submission aligns with the categories provided or has been submitted under
                "Other" for review.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer" data-testid="ack-2">
              <input
                type="checkbox"
                checked={form.ack2}
                onChange={(e) => set("ack2", e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[#8b5e3c] cursor-pointer"
              />
              <span className="text-sm text-[#3a2a1a]">
                I understand that all entries are reviewed and may be declined if they do not align with The
                Patieaux Chick's brand or community standards.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer" data-testid="ack-3">
              <input
                type="checkbox"
                checked={form.ack3}
                onChange={(e) => set("ack3", e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[#8b5e3c] cursor-pointer"
              />
              <span className="text-sm text-[#3a2a1a]">
                I understand that to maintain the integrity of The Patieaux Business Guide, all submissions are reviewed before
                approval. Listing fees are non-refundable once submitted.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer" data-testid="ack-4">
              <input
                type="checkbox"
                checked={form.ack4}
                onChange={(e) => set("ack4", e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[#8b5e3c] cursor-pointer"
              />
              <span className="text-sm text-[#3a2a1a]">
                I grant The Patieaux Chick permission to use my submitted information and images for the
                directory, magazine features, and related promotional materials.
              </span>
            </label>
          </section>

          {error && (
            <p
              className="text-sm text-red-700 bg-red-100 border border-red-300 rounded px-4 py-2"
              data-testid="form-error"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            data-testid="button-submit"
            className="w-full py-3 rounded-full font-semibold text-white text-sm tracking-wide transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "#8b5e3c" }}
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
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

export default SubmitBusiness;