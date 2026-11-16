import type { LocalizedContent, SearchParams } from "@venuecms/sdk-next";
import { VenueContent } from "@venuecms/sdk-next";
import type { ReactNode } from "react";

import {
  ColumnLeft,
  ColumnRight,
  FullWidthLayout,
  TwoColumnLayout,
} from "@/components/layout";

import {
  contentComponents,
  contentHandlers,
  eventListPageComponents,
  pageBodyStyles,
} from "../ListingBlock";
import { NewsView } from "../News";
import { SubPages } from "../Page/SubPages";
import { hasRenderableContent } from "../utils/pageContent";
import type { PageListingLayout } from "../utils/pageLayout";

/**
 * A page whose type names a listing.
 *
 * The type picks the frame and nothing else: the records come from a listing
 * block the author placed in the body, which is where the limit, the ordering
 * and whether it pages at all are already decided. That is why this draws no
 * records of its own — a layout that fetched as well would put a second,
 * unasked-for listing on the page.
 */
export const PageListing = ({
  layout,
  pageId,
  title,
  content,
  searchParams,
}: {
  layout: PageListingLayout;
  /** The page's id, whose direct sub-pages stack below its own body. */
  pageId?: string;
  /** Heads the listing the way its own route does; the shop route has none. */
  title?: string;
  /** The page's own body, which holds the block drawing the records. */
  content?: LocalizedContent;
  /** The body's listing blocks page themselves off these. */
  searchParams: SearchParams;
}) => {
  // An event listing stands alone: its grid is the page, so its sub-pages
  // keep to their own routes rather than stacking under it.
  const subPages = (frame?: (sections: ReactNode) => ReactNode) =>
    pageId && layout !== "events" ? (
      <SubPages parentId={pageId} searchParams={searchParams} frame={frame} />
    ) : null;

  // This view draws the latest article's body; a second would compete with it.
  // Sub-pages follow in a frame of their own, under the article's right column.
  if (layout === "news") {
    return (
      <>
        <NewsView title={title} searchParams={searchParams} />
        {subPages((sections) => (
          <TwoColumnLayout>
            <ColumnLeft />
            <ColumnRight>{sections}</ColumnRight>
          </TwoColumnLayout>
        ))}
      </>
    );
  }

  // The shop and artists frames match their own routes, so a page typed as one
  // of those listings sits where its index does.
  const frame = (children: ReactNode) => {
    switch (layout) {
      case "products":
        return <section className="pb-20 pt-6">{children}</section>;
      // Full width, so the body's event listings get the homepage's grid.
      case "events":
        return (
          <FullWidthLayout>
            {title ? <p className="text-sm text-primary">{title}</p> : null}
            {children}
          </FullWidthLayout>
        );
      case "profiles":
        return (
          <TwoColumnLayout>
            <ColumnLeft className="text-sm text-secondary">
              {title ? <p className="pb-8 text-primary">{title}</p> : null}
            </ColumnLeft>
            <ColumnRight>{children}</ColumnRight>
          </TwoColumnLayout>
        );
    }
  };

  // Without a body, the frame waits on the sub-pages: nothing to draw means no
  // frame either, or the page is a screenful of padding above an empty column.
  if (!content || !hasRenderableContent(content)) {
    return subPages(frame);
  }

  return frame(
    <>
      <VenueContent
        className={pageBodyStyles}
        content={content}
        contentStyles={
          layout === "events" ? eventListPageComponents : contentComponents
        }
        components={contentHandlers}
        searchParams={searchParams}
      />
      {/* The shop's section doesn't stack its children, so the sub-pages
          bring their own spacing there, as they do on /shop itself. */}
      {layout === "products"
        ? subPages((sections) => (
            <div className="flex flex-col gap-12 pt-20">{sections}</div>
          ))
        : subPages()}
    </>,
  );
};
