import type { Event } from "@venuecms/sdk-next";
import { describe, expect, it } from "vitest";

import { rankRelatedEvents } from "./related";

const NOW = new Date("2026-06-01T12:00:00Z");

const event = ({
  id,
  start = "2026-07-01T19:00:00Z",
  tags = [],
  artists = [],
}: {
  id: string;
  start?: string;
  tags?: unknown[];
  artists?: string[];
}) =>
  ({
    id,
    slug: id,
    startDate: start,
    endDate: start,
    tags,
    artists: artists.map((slug) => ({ profile: { slug } })),
  }) as unknown as Event;

const tag = (id: string) => ({ tagId: id, tag: { id, title: id } });

const ids = (events: Event[]) => events.map(({ id }) => id);

describe("rankRelatedEvents", () => {
  const current = event({
    id: "current",
    tags: [tag("jazz"), tag("live")],
    artists: ["ana", "ben"],
  });

  it("keeps only future events sharing a tag or an artist", () => {
    const candidates = [
      event({ id: "tag", tags: [tag("jazz")] }),
      event({ id: "artist", artists: ["ben"] }),
      event({ id: "none", tags: [tag("film")], artists: ["cy"] }),
      event({ id: "past", start: "2026-05-01T19:00:00Z", tags: [tag("jazz")] }),
    ];

    expect(
      ids(rankRelatedEvents({ event: current, candidates, now: NOW })),
    ).toEqual(["tag", "artist"]);
  });

  it("puts more matches first, then the sooner event", () => {
    const candidates = [
      event({ id: "one-late", start: "2026-09-01", tags: [tag("live")] }),
      event({ id: "one-soon", start: "2026-06-10", artists: ["ana"] }),
      event({
        id: "three",
        start: "2026-12-01",
        tags: [tag("jazz"), tag("live")],
        artists: ["ana"],
      }),
      event({
        id: "two",
        start: "2026-11-01",
        tags: [tag("jazz")],
        artists: ["ben"],
      }),
    ];

    expect(
      ids(rankRelatedEvents({ event: current, candidates, now: NOW })),
    ).toEqual(["three", "two", "one-soon", "one-late"]);
  });

  it("leaves out the event itself and duplicates across fetches", () => {
    const twice = event({ id: "twice", artists: ["ana"] });
    const candidates = [current, twice, twice];

    expect(
      ids(rankRelatedEvents({ event: current, candidates, now: NOW })),
    ).toEqual(["twice"]);
  });

  it("matches tags sent flat as well as nested", () => {
    const candidates = [
      event({ id: "flat", tags: [{ id: "jazz", title: "jazz" }] }),
    ];

    expect(
      ids(rankRelatedEvents({ event: current, candidates, now: NOW })),
    ).toEqual(["flat"]);
  });

  it("returns nothing for an event with no tags or artists", () => {
    const candidates = [
      event({ id: "any", tags: [tag("jazz")], artists: ["ana"] }),
    ];

    expect(
      rankRelatedEvents({ event: event({ id: "bare" }), candidates, now: NOW }),
    ).toEqual([]);
  });

  it("caps the result at the limit", () => {
    const candidates = ["a", "b", "c"].map((id) =>
      event({ id, artists: ["ana"] }),
    );

    expect(
      rankRelatedEvents({ event: current, candidates, now: NOW, limit: 2 }),
    ).toHaveLength(2);
  });
});
