import { Skeleton } from "@/components/ui/Input/Skeleton";

/** Mirrors the event page: title, date row, body beside image, artist cards. */
export default function Loading() {
  return (
    <div className="flex flex-col gap-12 pb-6 pt-6 lg:gap-16 lg:pb-24">
      <Skeleton className="h-12 w-3/4" />

      <div className="flex items-center gap-12">
        <Skeleton className="w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:order-2 lg:col-span-2">
          <Skeleton className="aspect-video" />
          <div className="grid gap-8 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="w-3/4" />
                <Skeleton className="w-1/2" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 lg:order-1">
          <Skeleton />
          <Skeleton />
          <Skeleton className="w-3/4" />
          <Skeleton />
          <Skeleton className="w-5/6" />
        </div>
      </div>

      <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-6">
            <Skeleton className="aspect-square" />
            <Skeleton className="w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
