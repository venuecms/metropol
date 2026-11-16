import { LocalizedContent, Page, Site, VenueContent } from "@venuecms/sdk-next";
import { getPages } from "@venuecms/sdk-next";
import { getLocale } from "next-intl/server";
import { ReactNode } from "react";

// The site description is a short blurb, so it takes prose styling only — no
// listing blocks to resolve here.
import { proseHandlers } from "../utils/handlers";
import { renderedStyles } from "../utils/styles";
import { NavMenuDesktop } from "./NavMenuDesktop";
import { NavMenuMobile } from "./NavMenuMobile";
import { buildNavItems } from "./items";

export type RootPageContent = {
  page: Page;
  content: LocalizedContent;
};

export const Nav = async ({ logo, site }: { logo: ReactNode; site: Site }) => {
  const locale = await getLocale();
  const { data: pages } = await getPages();

  // Defined in the custom fields for this template under public/_venue/config.schema.json
  const showSearch: boolean =
    !!site.settings?.publicSite?.template?.config?.showSearch;

  const items = buildNavItems(pages?.records ?? [], locale);

  // Render the menu for desktop and mobile
  return (
    <>
      <NavMenuDesktop showSearch={showSearch} items={items} />
      <NavMenuMobile
        logo={logo}
        items={items}
        footer={
          site.description ? (
            <VenueContent
              content={{ content: site.description } as LocalizedContent}
              contentStyles={renderedStyles}
              components={proseHandlers}
            />
          ) : null
        }
      />
    </>
  );
};
