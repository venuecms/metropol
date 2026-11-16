import { MediaItem, VenueImage as SdkVenueImage } from "@venuecms/sdk-next";

const ASPECTS = {
  square: "aspect-square",
  video: "aspect-video",
};

/** Marks an image the site-wide duotone filter applies to; see ThemedBody. */
export const FILTERABLE_IMAGE_CLASS = "venue-image";

export const VenueImage = ({
  className,
  image,
  aspect,
  props,
  filter = false,
}: {
  className?: string;
  image?: Partial<MediaItem>;
  aspect?: keyof typeof ASPECTS;
  props?: object;
  /**
   * Whether the site's image filter, when switched on, reaches this image.
   * Only listings opt in — the cards in an event, product or artist list — so
   * a record's own page, the featured event, the hero and the logo all show
   * their images in full color.
   */
  filter?: boolean;
}) => {
  const img = (
    <SdkVenueImage
      className={className}
      image={image}
      aspect={aspect}
      props={props}
    />
  );

  return (
    <CreditWrapper credit={image?.credit}>
      {filter ? (
        // The filter's tint is a layer over the image, so it needs a box of
        // its own to sit in; `isolate` keeps its blend to this image alone.
        <div className={`${FILTERABLE_IMAGE_CLASS} relative isolate`}>
          {img}
        </div>
      ) : (
        img
      )}
    </CreditWrapper>
  );
};

const CreditWrapper = ({
  children,
  credit,
}: {
  children?: React.ReactNode;
  credit?: string | null;
}) =>
  credit ? (
    <div className="relative">
      {children}
      <div className="absolute bottom--1 right-0 text-end text-xs text-muted opacity-60">
        {credit}
      </div>
    </div>
  ) : (
    children
  );
