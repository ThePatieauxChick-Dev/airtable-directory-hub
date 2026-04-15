
CREATE TABLE public.listing_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id TEXT NOT NULL,
  listing_name TEXT NOT NULL DEFAULT '',
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'website_click', 'instagram_click')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.listing_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
  ON public.listing_analytics
  FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_listing_analytics_listing_id ON public.listing_analytics (listing_id);
CREATE INDEX idx_listing_analytics_event_type ON public.listing_analytics (event_type);
CREATE INDEX idx_listing_analytics_created_at ON public.listing_analytics (created_at);
