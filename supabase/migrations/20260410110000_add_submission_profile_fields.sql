ALTER TABLE public.business_submissions
  ADD COLUMN owner_headshot TEXT,
  ADD COLUMN business_photo TEXT,
  ADD COLUMN services_offered TEXT,
  ADD COLUMN other_social_media TEXT,
  ADD COLUMN how_to_contact TEXT,
  ADD COLUMN contact_details TEXT,
  ADD COLUMN email_selected BOOLEAN NOT NULL DEFAULT false;
