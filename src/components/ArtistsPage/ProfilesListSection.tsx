import { Suspense } from "react";

import { FullWidthLayout } from "@/components/layout";
import { Skeleton } from "@/components/ui/Input/Skeleton";
import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import { ProfilesListContent } from "./ProfilesListContent";

function ProfilesListError() {
  return (
    <FullWidthLayout>
      <p className="text-sm text-secondary">
        Unable to load artists. Please try refreshing the page.
      </p>
    </FullWidthLayout>
  );
}

/** Mirrors the loaded grid: title, then five columns of image and name. */
function ProfilesListSkeleton() {
  return (
    <FullWidthLayout>
      <Skeleton className="w-32" />
      <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="flex flex-col gap-3 pb-8">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="w-32" />
          </div>
        ))}
      </div>
    </FullWidthLayout>
  );
}

/** The artist grid behind /artists, with its skeleton and error states. */
export function ProfilesListSection({
  locale,
  currentPage,
}: {
  locale: string;
  currentPage: number;
}) {
  return (
    <ErrorBoundary fallback={<ProfilesListError />}>
      <Suspense fallback={<ProfilesListSkeleton />}>
        <ProfilesListContent locale={locale} currentPage={currentPage} />
      </Suspense>
    </ErrorBoundary>
  );
}
