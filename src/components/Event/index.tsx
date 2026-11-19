import {
  type LocationSlim,
  type SearchParams,
  Site,
  type TicketOnEvent,
  VenueContent,
  type Event as VenueEvent,
  getLocalizedContent,
} from "@venuecms/sdk-next";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, Suspense } from "react";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { contentComponents, contentHandlers } from "@/components/ListingBlock";
import { VenueImage } from "@/components/VenueImage";

import { TicketList } from "../TicketList";
import { formatDate, formatDateRange, formatTime } from "../utils";
import { proseHandlers } from "../utils/handlers";
import { renderedStyles } from "../utils/styles";
import { WhileUpcoming } from "./WhileUpcoming";

/**
 * The body's content styles a step down, at text-xs: the shared styles set
 * text-sm on each paragraph, heading and link, so the size has to change there
 * rather than on the wrapper. Listing blocks pass through untouched.
 */
const descriptionStyles = Object.fromEntries(
  Object.entries(contentComponents).map(([node, entry]) => [
    node,
    typeof entry === "string"
      ? entry.replace(/\btext-sm\b/g, "text-xs")
      : entry,
  ]),
) as typeof contentComponents;

/**
 * A single event's page:
 *
 *   title
 *   date   get tickets
 *   body         | image
 *                | location · times · artists
 *   artist cards, three across
 *
 * On a phone it reads top to bottom with the image ahead of the body, so the
 * picture and the practical details come before the long read.
 */
export const Event = ({
  event,
  site,
  searchParams,
}: {
  event: VenueEvent;
  site: Site;
  /**
   * The route's search params, for the pagers on any listing blocks in this
   * content. Only a route segment can read them, so they are passed down.
   *
   * Required rather than optional: a caller that forgets it costs every listing
   * in this content its pager, and does so silently — the records still render.
   * A surface that genuinely has no URL to page by passes `{}` and says so.
   */
  searchParams: SearchParams;
}) => {
  const locale = useLocale();
  const t = useTranslations("events");
  const { location, artists = [] } = event;
  const timeZone = site.timeZone ?? undefined;

  const { content } = getLocalizedContent(event?.localizedContent, locale);
  const isCancelled = event.publishState === "CANCELLED";
  const displayImage =
    event.image ??
    event.relations?.parents?.[0]?.image ??
    artists?.find((artist) => !!artist.profile?.image)?.profile.image;

  return (
    <article className="flex flex-col gap-12 pb-6 pt-6 lg:gap-16 lg:pb-24">
      {/* Title and date read as one heading, closer together than the
          sections below. */}
      <header className="flex flex-col gap-4 motion-safe:animate-slide-up">
        <h1
          className={cn(
            "text-balance text-xl text-primary",
            isCancelled && "line-through",
          )}
        >
          {content.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-12 gap-y-4 text-sm">
          <span className={cn("text-primary", isCancelled && "line-through")}>
            {formatDateRange({
              start: event.startDate,
              end: event.endDate,
              withTime: false,
              template: "EEEE d MMMM",
              timeZone: site.timeZone!,
              locale,
            })}
            {/* The start time, set off the way the listings set it, and kept
                apart from the date so a multi-day range still gets one. */}
            {event.hasTime
              ? ` • ${formatTime({ date: event.startDate, timeZone, locale })}`
              : null}
          </span>
          {isCancelled ? (
            <span className="text-secondary">{t("cancelled")}</span>
          ) : event.tickets?.length ? (
            // Hidden once the event is over: there is nothing left to buy.
            <Suspense fallback={null}>
              <WhileUpcoming event={event}>
                <Tickets tickets={event.tickets} />
              </WhileUpcoming>
            </Suspense>
          ) : null}
        </div>
      </header>

      <div className="grid gap-12 lg:grid-cols-3">
        <div
          className="flex flex-col gap-4 motion-safe:animate-slide-up lg:order-2 lg:col-span-2"
          style={stagger(1)}
        >
          {displayImage ? (
            // Full width of its column at the image's own proportions. `sizes`
            // tells Next how wide that is, so it serves a source to match
            // rather than the stored width, stretched.
            <VenueImage
              image={displayImage}
              className="h-auto w-full"
              props={{ sizes: "(min-width: 1024px) 66vw, 100vw" }}
            />
          ) : null}
          <div className="grid gap-8 text-xs sm:grid-cols-3">
            {location ? (
              <Detail>
                <EventLocation location={location} />
              </Detail>
            ) : null}
            {event.hasTime ? (
              <Detail>
                <EventTimes
                  start={event.startDate}
                  end={event.endDate}
                  timeZone={timeZone}
                />
              </Detail>
            ) : null}
            {artists.length ? (
              <Detail>
                <ul>
                  {artists.map(({ profile }) => (
                    <li key={profile.slug}>
                      <Link
                        href={`/artists/${profile.slug}`}
                        className="hover:brightness-150"
                      >
                        {
                          getLocalizedContent(profile.localizedContent, locale)
                            .content.title
                        }
                      </Link>
                    </li>
                  ))}
                </ul>
              </Detail>
            ) : null}
          </div>
        </div>

        <VenueContent
          // The opening paragraph a step up, as a lead-in to the rest. Its
          // selector outranks the text-xs each paragraph carries.
          className="flex flex-col gap-6 text-xs [animation-delay:160ms] motion-safe:animate-slide-up lg:order-1 [&>p:first-of-type]:text-sm"
          content={content}
          contentStyles={descriptionStyles}
          components={contentHandlers}
          searchParams={searchParams}
        />
      </div>

      {artists.length ? (
        <div className="grid gap-12 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {artists.map(({ profile }, index) => (
            <div
              key={profile.slug}
              className="motion-safe:animate-slide-up"
              style={stagger(3 + index)}
            >
              <ArtistCard profile={profile} />
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
};

/**
 * The delay for the nth section of the page sliding up, so the sections come
 * in one after another in reading order, as the homepage grid's cards do.
 * The description takes step 2 as a class instead (160ms): VenueContent
 * passes no style through.
 */
const stagger = (step: number) => ({ animationDelay: `${step * 80}ms` });

/** One of the facts under the image. */
const Detail = ({ children }: { children: ReactNode }) => (
  <div className="min-w-0 text-primary">{children}</div>
);

const EventLocation = ({ location }: { location: LocationSlim }) => {
  const locale = useLocale();
  const t = useTranslations("events");
  const { content } = getLocalizedContent(location.localizedContent, locale);
  const { address, address2, zipCode, city, mapLink } = location;
  const cityLine = [city, zipCode].filter(Boolean).join(" ");

  return (
    <address className="flex flex-col not-italic">
      {content.title ? <span>{content.title}</span> : null}
      {address ? <span>{address}</span> : null}
      {address2 ? <span>{address2}</span> : null}
      {cityLine ? <span>{cityLine}</span> : null}
      {mapLink ? (
        <a
          href={mapLink}
          target="_blank"
          rel="noreferrer"
          className="hover:brightness-150"
        >
          [ {t("map")} ]
        </a>
      ) : null}
    </address>
  );
};

/**
 * Start and end times. A single-day event gives times alone; one running over
 * several days puts each time with its date, since a bare end time would read
 * as the same evening.
 */
const EventTimes = ({
  start,
  end,
  timeZone,
}: {
  start: string;
  end?: string | null;
  timeZone?: string;
}) => {
  const locale = useLocale();
  const t = useTranslations("events");

  const sameDay =
    !end ||
    formatDate({
      date: start,
      withTime: false,
      template: "yyyy-MM-dd",
      timeZone,
    }) ===
      formatDate({
        date: end,
        withTime: false,
        template: "yyyy-MM-dd",
        timeZone,
      });

  const label = (date: string) =>
    sameDay
      ? formatTime({ date, timeZone, locale })
      : formatDate({ date, template: "d MMMM", timeZone, locale });

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-2">
      <dt>{t("starts")}:</dt>
      <dd>{label(start)}</dd>
      {end && end !== start ? (
        <>
          <dt>{t("ends")}:</dt>
          <dd>{label(end)}</dd>
        </>
      ) : null}
    </dl>
  );
};

/**
 * The tickets as a call to action. Tickets sharing one link — the usual case,
 * a single ticket shop — make one "get tickets" button; separate links get a
 * button each, named for the ticket. Tickets with no link at all fall back to
 * the plain price list, since there is nowhere to send anyone.
 */
const Tickets = ({ tickets }: { tickets: TicketOnEvent[] }) => {
  const t = useTranslations("tickets");
  const linked = tickets.filter((ticket) => ticket.externalLink);
  const links = [...new Set(linked.map((ticket) => ticket.externalLink!))];

  if (!links.length) {
    return <TicketList tickets={tickets} />;
  }

  const button =
    "bg-primary px-[1.5em] py-[0.75em] text-xs leading-none text-background transition-transform duration-500 hover:scale-[1.02]";

  return (
    <div className="flex flex-wrap gap-4">
      {links.length === 1 ? (
        <Link href={links[0]} target="_blank" className={button}>
          {t("get_tickets")}
        </Link>
      ) : (
        linked.map((ticket) => (
          <Link
            key={ticket.name}
            href={ticket.externalLink!}
            target="_blank"
            className={button}
          >
            {ticket.name}
          </Link>
        ))
      )}
    </div>
  );
};

/**
 * An artist on the event: image, with the name set over its bottom edge as a
 * link to their page, then the bio. One of a list of artists, so its image
 * takes the site's listing filter.
 */
const ArtistCard = ({
  profile,
}: {
  profile: VenueEvent["artists"][number]["profile"];
}) => {
  const locale = useLocale();
  const { content } = getLocalizedContent(profile.localizedContent, locale);
  const href = `/artists/${profile.slug}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Link href={href}>
          <VenueImage image={profile.image} aspect="square" filter />
        </Link>
        <Link
          href={href}
          className="absolute bottom-0 left-0 translate-y-1/2 px-3 text-md leading-none text-primary hover:brightness-150"
        >
          {content.title}
        </Link>
      </div>
      <VenueContent
        className="flex flex-col gap-6 pt-4 text-sm"
        content={content}
        contentStyles={renderedStyles}
        components={proseHandlers}
      />
    </div>
  );
};
