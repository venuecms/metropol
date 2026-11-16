import {
  type NodeHandlers,
  type Page,
  VenueContent,
  getLocalizedContent,
  getPage,
  getPages,
} from "@venuecms/sdk-next";
import { getLocale } from "next-intl/server";

import { InvertedEmailListSignupBlock } from "../EmailSignup";
import { FullWidthLayout } from "../layout";
import { proseHandlers } from "../utils/handlers";
import { hasRenderableContent } from "../utils/pageContent";
// Prose styling only: footer content is an address or opening hours, not a
// place for listing blocks.
import { renderedStyles } from "../utils/styles";

/**
 * The prose styles with the page's colors swapped, for the footer's inverted
 * scheme: primary text becomes the page background, and secondary text the
 * same at reduced opacity, since the themes define no inverted secondary. Set
 * a step smaller than page text, at text-xs. Headings take the primary color
 * here, where the page sets them secondary, so they read at full strength.
 */
const footerStyles = Object.fromEntries(
  Object.entries(renderedStyles).map(([node, classes]) => [
    node,
    (/^h[1-6]$/.test(node)
      ? classes?.replace(/\btext-secondary\b/g, "text-primary")
      : classes
    )
      ?.replace(/\btext-primary\b/g, "text-background")
      .replace(/\btext-secondary\b/g, "text-background opacity-70")
      .replace(/\btext-sm\b/g, "text-xs"),
  ]),
) as typeof renderedStyles;

/**
 * The blocks the footer draws beyond prose: a mailing-list signup, in the
 * footer's inverted colors so it doesn't vanish into the fill.
 */
const footerHandlers: NodeHandlers = {
  ...proseHandlers,
  emailListSignup: InvertedEmailListSignupBlock,
};

/** Pages carrying this tag lend their content to the footer. */
const FOOTER_TAG = "footer";

/**
 * A tag's name, whichever shape it arrives in. The SDK types a page's tags as
 * `{ tagId, tag: { title } }`, but the pages API sends them flat — `{ id,
 * title }` — so trusting the types throws on the first tagged page. Both are
 * read, so this keeps working if either side is brought in line.
 */
const tagTitle = (tag: unknown): string | undefined => {
  const { title, tag: nested } = (tag ?? {}) as {
    title?: unknown;
    tag?: { title?: unknown };
  };
  const value = title ?? nested?.title;

  return typeof value === "string" ? value : undefined;
};

const isFooterPage = (page: Page) =>
  (page.tags ?? []).some(
    (tag) => tagTitle(tag)?.trim().toLowerCase() === FOOTER_TAG,
  );

/**
 * The site footer, under every page: the bodies of the pages tagged `footer`,
 * and nothing else. Pushed to the bottom of the window by `mt-auto` inside
 * ThemedBody's full-height column, so a short page doesn't leave it floating
 * mid-screen. With no tagged page to show, there is no footer at all.
 */
export const Footer = async () => {
  const [locale, { data: pages }] = await Promise.all([
    getLocale(),
    getPages(),
  ]);

  // Matched by the tag's name, off the page list, then read one by one: only
  // the single-page read is sure to carry a body. Both are cached.
  const footerPages = (
    await Promise.all(
      (pages?.records ?? [])
        .filter(isFooterPage)
        .map(({ slug }) => getPage({ slug })),
    )
  ).flatMap(({ data: page }) => {
    if (!page) return [];

    const { content } = getLocalizedContent(page.localizedContent, locale);
    return hasRenderableContent(content) ? [{ id: page.id, content }] : [];
  });

  if (!footerPages.length) {
    return null;
  }

  return (
    // Inverted: the page's text color as the background, its background as
    // the text. The shadow carries the fill out to the screen edges past the
    // body's gutters, and the clip trims it vertically; unlike a 100vw width,
    // that can't overflow the page sideways when a scrollbar takes up room.
    <footer className="mt-auto bg-primary text-xs text-background shadow-[0_0_0_100vmax_hsla(var(--primary))] [clip-path:inset(0_-100vmax)]">
      {/* Equal padding above and below, in place of the layout's deeper bottom
          for a page section: the footer is a band, so it sits centered in it. */}
      <FullWidthLayout className="py-12 lg:py-12">
        {/* A column per tagged page; the last spans two in the four-column
            grid, room for a wider block like the signup form. */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:[&>*:last-child]:col-span-2">
          {footerPages.map(({ id, content }) => (
            <VenueContent
              key={id}
              className="flex flex-col gap-3"
              content={content}
              contentStyles={footerStyles}
              components={footerHandlers}
            />
          ))}
        </div>
      </FullWidthLayout>
    </footer>
  );
};
