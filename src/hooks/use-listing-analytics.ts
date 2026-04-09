import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type EventType = "view" | "website_click" | "instagram_click";

function trackEvent(listingId: string, listingName: string, eventType: EventType) {
  supabase
    .from("listing_analytics")
    .insert({ listing_id: listingId, listing_name: listingName, event_type: eventType })
    .then(); // fire-and-forget
}

export function useCardView(listingId: string, listingName: string) {
  const tracked = useRef(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || tracked.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tracked.current) {
          tracked.current = true;
          trackEvent(listingId, listingName, "view");
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [listingId, listingName]);

  return ref;
}

export function useTrackClick(listingId: string, listingName: string, eventType: EventType) {
  return useCallback(() => {
    trackEvent(listingId, listingName, eventType);
  }, [listingId, listingName, eventType]);
}
