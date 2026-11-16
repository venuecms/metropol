import {
  LocalizedContent,
  type SearchParams,
  VenueContent,
  getLocalizedContent,
} from "@venuecms/sdk-next";
import { getEvents, getSite } from "@venuecms/sdk-next";
import { ArrowRight } from "lucide-react";
import { connection } from "next/server";

import { Link } from "@/lib/i18n";

import { EventsGrid } from "@/components/EventList";
import { contentComponents } from "@/components/ListingBlock";
import { TranslatedText } from "@/components/TranslatedText";
import { FullWidthLayout } from "@/components/layout";

export async function EventsContent({
  locale,
  searchParams,
}: {
  locale: string;
  /**
   * Taken as a promise and awaited here rather than in the route, because this
   * component already renders inside the home page's Suspense boundary. Awaiting
   * it up in `Home` would make the whole home page wait on the request; awaiting
   * it here costs nothing extra, since `connection()` above has already opted
   * this subtree out of the prerender.
   */
  searchParams: Promise<SearchParams>;
}) {
  await connection();

  const [{ data: events }, { data: site }, resolvedSearchParams] =
    await Promise.all([
      getEvents({ limit: 6, upcoming: true }),
      getSite(),
      searchParams,
    ]);

  if (!site) {
    return null;
  }

  const webSiteSettings = site.webSites ? site.webSites[0] : undefined;
  const { content: siteContent } = webSiteSettings?.localizedContent?.length
    ? getLocalizedContent(webSiteSettings.localizedContent, locale)
    : { content: { content: site.description } as LocalizedContent };

  return (
    <>
      {events?.records.length ? (
        <FullWidthLayout>
          <section className="flex flex-col gap-3">
            <EventsGrid events={events.records} site={site} />
            {events.records.length >= 6 ? (
              <Link
                className="flex w-full items-center gap-2 hover:brightness-125"
                href="/events"
              >
                <ArrowRight className="h-4" />{" "}
                <TranslatedText
                  namespace="events"
                  text="see_all_upcoming_events"
                />
              </Link>
            ) : null}
          </section>
        </FullWidthLayout>
      ) : null}

      {siteContent ? (
        <FullWidthLayout className="text-sm text-secondary">
          <VenueContent
            className="flex max-w-2xl flex-col gap-6"
            content={siteContent}
            contentStyles={contentComponents}
            searchParams={resolvedSearchParams}
          />
        </FullWidthLayout>
      ) : null}
    </>
  );
}
