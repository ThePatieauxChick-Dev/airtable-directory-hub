import { useRef, useCallback } from "react";

type EventType = "view" | "website_click" | "instagram_click";

export function useCardView(_listingId: string, _listingName: string) {
  const ref = useRef<HTMLElement | null>(null);
  return ref;
}

export function useTrackClick(_listingId: string, _listingName: string, _eventType: EventType) {
  return useCallback(() => {}, []);
}
