import type { Event } from "@venuecms/sdk-next";

/**
 * A tag's identity, whichever shape it arrives in. The SDK types an event's
 * tags as `{ tagId, tag: { id, title } }`, but the API has been seen sending
 * them flat — `{ id, title }` — on pages (see the Footer), so both are read.
 * The id is preferred; the title is the fallback key.
 */
const tagKey = (tag: unknown): string | undefined => {
  const {
    tagId,
    id,
    title,
    tag: nested,
  } = (tag ?? {}) as {
    tagId?: unknown;
    id?: unknown;
    title?: unknown;
    tag?: { id?: unknown; title?: unknown };
  };
  const value = tagId ?? nested?.id ?? id ?? nested?.title ?? title;

  return typeof value === "string" && value ? value : undefined;
};

const tagKeys = (event: Event) =>
  new Set((event.tags ?? []).map(tagKey).filter((key) => key !== undefined));

const artistKeys = (event: Event) =>
  new Set(
    (event.artists ?? [])
      .map(({ profile }) => profile?.slug)
      .filter((slug): slug is string => !!slug),
  );

/**
 * The tags on an event as the events API's `tags` filter takes them — it
 * accepts an id or a title, so whichever `tagKey` found will do.
 */
export const tagFiltersOf = (event: Event) => [...tagKeys(event)];

/** The artist slugs on an event, for fetching each artist's other events. */
export const artistSlugsOf = (event: Event) => [...artistKeys(event)];

/**
 * The events related to `event`, best match first.
 *
 * A candidate is related when it starts after `now` and shares at least one
 * tag or artist with `event`. Its score is the number it shares — tags and
 * artists counted alike — and ties go to the sooner event. The event itself,
 * and any candidate listed twice (it can come back from more than one fetch),
 * appear at most once and never as their own relation.
 */
export const rankRelatedEvents = ({
  event,
  candidates,
  now = new Date(),
  limit,
}: {
  event: Event;
  candidates: Event[];
  now?: Date;
  limit?: number;
}): Event[] => {
  const tags = tagKeys(event);
  const artists = artistKeys(event);
  const seen = new Set<string>([event.id]);

  const scored: { event: Event; score: number; start: number }[] = [];

  for (const candidate of candidates) {
    if (seen.has(candidate.id)) continue;
    seen.add(candidate.id);

    const start = Date.parse(candidate.startDate);
    if (!(start > now.getTime())) continue;

    let score = 0;
    for (const key of tagKeys(candidate)) if (tags.has(key)) score++;
    for (const key of artistKeys(candidate)) if (artists.has(key)) score++;

    if (score > 0) scored.push({ event: candidate, score, start });
  }

  scored.sort((a, b) => b.score - a.score || a.start - b.start);

  return scored.slice(0, limit).map(({ event }) => event);
};
