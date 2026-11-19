import type { Event } from "@venuecms/sdk-next";

/**
 * Whether an event is over: its end has passed, or its start where it has no
 * end. A multi-day event still running is not past, so its tickets stay up.
 */
export const isPastEvent = (
  event: Pick<Event, "startDate" | "endDate">,
  now: Date = new Date(),
) => {
  const end = Date.parse(event.endDate || event.startDate);

  return Number.isFinite(end) && end < now.getTime();
};
