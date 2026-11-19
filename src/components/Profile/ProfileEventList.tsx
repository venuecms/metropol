import { getProfileEvents, getSite } from "@venuecms/sdk-next";
import { connection } from "next/server";

import { EventsGrid } from "@/components/EventList";
import { Skeleton } from "@/components/ui/Input/Skeleton";

export const ProfileEventList = async ({
  header,
  slug,
  filter,
}: {
  header: string;
  slug: string;
  filter?: { upcoming?: boolean; lt?: number; dir?: "asc" | "desc" };
}) => {
  await connection();

  const [{ data: events }, { data: site }] = await Promise.all([
    getProfileEvents({ slug, limit: 60, ...filter }),
    getSite(),
  ]);

  if (!site) {
    return null;
  }

  return events?.records.length ? (
    <div className="flex flex-col gap-6">
      <h2 className="m-0 py-0 text-sm text-primary">{header}</h2>
      {/* The homepage's grid, so an artist's events look as they do there. */}
      <EventsGrid events={events.records} site={site} />
    </div>
  ) : null;
};

export const ProfileEventListSkeleton = ({
  numElements = 2,
}: {
  numElements?: number;
}) => {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="w-1/4" />
      {/* Mirrors EventsGrid: image, date and title, three across. */}
      <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: numElements }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2 pb-8">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="w-1/3" />
            <Skeleton className="w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
};
