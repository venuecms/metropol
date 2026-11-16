import { NextIntlClientProvider } from "next-intl";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it } from "vitest";

import messages from "@/lib/i18n/dictionaries/en.json";

import { NavDropdown } from "./NavDropdown";
import type { NavItem } from "./items";

const item: NavItem = {
  id: "1",
  title: "About",
  href: "/p/about",
  target: "_self",
  children: [
    { id: "2", title: "Team", href: "/p/team", target: "_self", children: [] },
  ],
};

const render = async () => {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ul>
        <NavDropdown item={item} />
      </ul>
    </NextIntlClientProvider>,
  );
  await stream.allReady;
  return new Response(stream).text();
};

describe("NavDropdown", () => {
  it("keeps the parent page a link of its own", async () => {
    // The i18n Link prefixes the locale.
    expect(await render()).toMatch(
      /<a[^>]*href="\/en\/p\/about"[^>]*>About<\/a>/,
    );
  });

  it("starts closed, with the sub-pages in the markup but hidden", async () => {
    const html = await render();

    expect(html).toMatch(/<div[^>]*hidden=""[^>]*>/);
    expect(html).toContain(">Team</a>");
  });

  it("lists the parent page first, ahead of its sub-pages", async () => {
    const panel = (await render()).split("hidden=")[1];

    expect(panel.indexOf(">About</a>")).toBeGreaterThan(-1);
    expect(panel.indexOf(">About</a>")).toBeLessThan(
      panel.indexOf(">Team</a>"),
    );
  });

  it("draws no toggle beside the title", async () => {
    const html = await render();

    expect(html).not.toContain("<button");
    expect(html).not.toContain("<svg");
  });

  it("inverts the page's colors for the panel", async () => {
    expect(await render()).toContain("bg-primary p-4 text-background");
  });
});
