import { getLocalizedContent } from "@venuecms/sdk-next";
import { getPage, getProfiles, getSite } from "@venuecms/sdk-next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { SubPages } from "@/components/Page/SubPages";
import { PaginationLinks } from "@/components/Pagination";
import { ProfilesGrid } from "@/components/ProfilesGrid";
import { FullWidthLayout } from "@/components/layout";

/** Fills whole rows at two, three and five columns. */
const ITEMS_PER_PAGE = 30;

export async function ProfilesListContent({
  locale,
  currentPage,
}: {
  locale: string;
  currentPage: number;
}) {
  await connection();

  const [{ data: profiles }, { data: page }, { data: site }, t] =
    await Promise.all([
      getProfiles({ page: currentPage, limit: ITEMS_PER_PAGE }),
      getPage({ slug: "artists" }),
      getSite(),
      getTranslations("profiles"),
    ]);

  if (!site) {
    notFound();
  }

  const pageTitle = page
    ? getLocalizedContent(page.localizedContent, locale).content.title
    : t("profiles");

  const records = profiles?.records ?? [];

  // Deliberately not a total-pages count with a fallback: the endpoint only
  // sometimes returns `count`, and inventing one strands the reader on a run of
  // empty pages. Without a count, a full page is the only evidence there may be
  // another — the same rule the SDK's own listing pager uses.
  const hasNext = profiles?.count
    ? (currentPage + 1) * ITEMS_PER_PAGE < profiles.count
    : records.length === ITEMS_PER_PAGE;

  return (
    // Full width, as the homepage's event grid, with the title above it rather
    // than in a column of its own: five columns of cards need the room.
    <FullWidthLayout>
      <p className="text-sm text-primary">{pageTitle}</p>
      {records.length ? (
        <ProfilesGrid profiles={records} />
      ) : (
        <p className="text-sm text-secondary">{t("no_profiles_found")}</p>
      )}
      <PaginationLinks
        prevHref={currentPage <= 0 ? null : `/artists?page=${currentPage - 1}`}
        nextHref={hasNext ? `/artists?page=${currentPage + 1}` : null}
      />
      {page ? <SubPages parentId={page.id} /> : null}
    </FullWidthLayout>
  );
}
