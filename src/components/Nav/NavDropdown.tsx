"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Link } from "@/lib/i18n";

import type { NavItem } from "./items";

/**
 * A desktop nav item with sub-pages. The title stays a link to the parent page,
 * and the sub-pages open on hover, or when the title takes keyboard focus, so
 * tabbing walks straight through them. Escape or tabbing out closes it again.
 */
export const NavDropdown = ({ item }: { item: NavItem }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLLIElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const panelId = useId();

  // A click anywhere outside closes it, as any other menu on the page would.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <li
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      // Tabbing past the last sub-page closes it rather than leaving it open
      // over the page.
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          linkRef.current?.focus();
        }
      }}
    >
      <Link
        ref={linkRef}
        href={item.href}
        target={item.target}
        aria-controls={panelId}
      >
        {item.title}
      </Link>

      {/*
        Padded rather than offset with a margin, so the pointer crossing from
        the title to the panel never leaves the item and closes it on the way.
        Rendered while closed, under `hidden`, so the links stay in the markup
        but out of the tab order.

        Inverted against the page — its text color as the background, its
        background as the text — so the panel reads as a layer above it.
      */}
      <div
        id={panelId}
        hidden={!open}
        className="absolute left-0 top-full z-50 pt-3"
      >
        <ul
          className="flex min-w-48 flex-col gap-3 bg-primary p-4 text-background"
          onClick={() => setOpen(false)}
        >
          {/* The parent leads its own list, so the panel names every page
              in the section and its landing page is a click away from it. */}
          {[item, ...item.children].map((child) => (
            <li key={child.id}>
              <Link
                href={child.href}
                target={child.target}
                className="whitespace-nowrap hover:opacity-70"
              >
                {child.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
};
