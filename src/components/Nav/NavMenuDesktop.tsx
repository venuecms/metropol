"use client";

import { Link } from "@/lib/i18n";

import { SearchInput } from "../Search/SearchInput";
import { useSearchQuery } from "../Search/provider";
import { NavDropdown } from "./NavDropdown";
import type { NavItem } from "./items";

export const NavMenuDesktop = ({
  showSearch,
  items,
}: {
  showSearch: boolean;
  items: NavItem[];
}) => {
  const { isActive } = useSearchQuery();

  return (
    <nav className="relative hidden w-full items-center justify-between lg:flex">
      {!isActive ? (
        <ol className="mr-8 flex items-center gap-8 text-sm text-nav">
          {items.map((item) =>
            item.children.length ? (
              <NavDropdown key={item.id} item={item} />
            ) : (
              <li key={item.id}>
                <Link href={item.href} target={item.target}>
                  {item.title}
                </Link>
              </li>
            ),
          )}
        </ol>
      ) : null}
      {showSearch ? <SearchInput /> : null}
    </nav>
  );
};
