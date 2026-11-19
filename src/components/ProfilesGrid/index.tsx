import {
  type Profile,
  VenueContent,
  getLocalizedContent,
} from "@venuecms/sdk-next";
import { useLocale } from "next-intl";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { EventsList } from "@/components/EventList";
import { VenueImage, type VenueImageAspect } from "@/components/VenueImage";

// Deliberately plain `renderedStyles` rather than `contentComponents`: a bio
// is itself what a profile listing renders, so a map carrying the listing
// blocks would let a profile listing nest inside its own results.
import { proseHandlers } from "../utils/handlers";
import { renderedStyles } from "../utils/styles";

/**
 * What a card draws, so a full profile or the slim one an event carries for
 * its artists will both do.
 */
type GridProfile = Pick<Profile, "slug" | "image" | "localizedContent">;

/**
 * The bio's body text a step down, at text-xs, with headings left at their
 * size. The shared styles set text-sm on each paragraph and link, so the size
 * has to change there rather than on the wrapper.
 */
const bioStyles = {
  ...renderedStyles,
  p: renderedStyles.p?.replace(/\btext-sm\b/, "text-xs"),
  a: renderedStyles.a?.replace(/\btext-sm\b/, "text-xs"),
} as typeof renderedStyles;

/**
 * Columns from `lg` up. Five suits a roster of image-and-name cards; three
 * gives a card room for a bio, as the event grid gives its cards.
 */
const COLUMNS = {
  3: "lg:grid-cols-3",
  5: "md:grid-cols-3 lg:grid-cols-5",
} as const;

/**
 * Artists in a grid built on the event grid's wrapper, so its gaps and card
 * rhythm match `EventsGrid`: two columns from `sm`, one on phones, and
 * `columns` from `lg`, each card sliding up in turn.
 */
export const ProfilesGrid = ({
  profiles,
  className,
  columns = 5,
  withBio = false,
  imageAspect = "square",
}: {
  profiles: GridProfile[];
  className?: string;
  columns?: keyof typeof COLUMNS;
  /** Whether each card carries the artist's bio under the name. */
  withBio?: boolean;
  /** The cards' image ratio; square unless given. */
  imageAspect?: VenueImageAspect;
}) => (
  <EventsList className={cn("gap-y-4", COLUMNS[columns], className)}>
    {profiles.map((profile, index) => (
      <div
        key={profile.slug}
        className="motion-safe:animate-slide-up"
        // Staggered so the grid fills in card by card, capped so a full page
        // of thirty is all in within a second rather than trickling for two.
        style={{ animationDelay: `${Math.min(index, 10) * 80}ms` }}
      >
        <ProfileCard
          profile={profile}
          withBio={withBio}
          imageAspect={imageAspect}
        />
      </div>
    ))}
  </EventsList>
);

/**
 * One artist in the grid: the image, square unless asked otherwise, then
 * the name under it, both linking to the artist's page, and the bio where
 * asked for, the three evenly spaced by the card's gap. No photo credit — the artist's own page carries it.
 */
const ProfileCard = ({
  profile,
  withBio,
  imageAspect,
}: {
  profile: GridProfile;
  withBio: boolean;
  imageAspect: VenueImageAspect;
}) => {
  const locale = useLocale();
  const { content } = getLocalizedContent(profile.localizedContent, locale);
  const href = `/artists/${profile.slug}`;

  return (
    <div className="flex break-inside-avoid flex-col gap-3 pb-8">
      <div className="w-full">
        <Link href={href}>
          <VenueImage
            image={profile.image}
            aspect={imageAspect}
            filter
            withCredit={false}
          />
        </Link>
      </div>
      <Link
        href={href}
        // Set rather than inherited, so the name holds at text-sm whatever
        // size the grid or the bio under it takes.
        className="text-balance text-sm text-primary hover:brightness-150"
      >
        {content.title}
      </Link>
      {withBio ? (
        <VenueContent
          className="flex flex-col gap-6 text-xs"
          content={content}
          contentStyles={bioStyles}
          components={proseHandlers}
        />
      ) : null}
    </div>
  );
};
