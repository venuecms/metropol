import type { LocalizedContent } from "@venuecms/sdk-next";
import { describe, expect, it } from "vitest";

import { splitAtHeadings } from "./pageContent";

const heading = (text: string) => ({
  type: "heading",
  attrs: { level: 3 },
  content: [{ type: "text", text }],
});
const paragraph = (text: string) => ({
  type: "paragraph",
  content: [{ type: "text", text }],
});

const withDoc = (nodes: unknown[]) =>
  ({
    siteId: "s1",
    locale: "en",
    content: "ignored while a doc is present",
    contentJSON: { type: "doc", content: nodes },
  }) as unknown as LocalizedContent;

const nodesOf = (section: LocalizedContent) =>
  (section.contentJSON as { content: Array<{ type: string }> }).content.map(
    (node) => node.type,
  );

describe("splitAtHeadings", () => {
  it("starts a section at every heading", () => {
    const sections = splitAtHeadings(
      withDoc([
        heading("Address"),
        paragraph("Špitálska 61"),
        heading("Contact"),
        paragraph("info@"),
        paragraph("+421"),
      ]),
    );

    expect(sections.map(nodesOf)).toEqual([
      ["heading", "paragraph"],
      ["heading", "paragraph", "paragraph"],
    ]);
  });

  it("keeps anything before the first heading as a section of its own", () => {
    const sections = splitAtHeadings(
      withDoc([paragraph("Intro"), heading("Address"), paragraph("Street")]),
    );

    expect(sections.map(nodesOf)).toEqual([
      ["paragraph"],
      ["heading", "paragraph"],
    ]);
  });

  it("keeps the rest of the record on each section", () => {
    const [section] = splitAtHeadings(withDoc([heading("Address")]));

    expect(section.locale).toBe("en");
    expect((section.contentJSON as { type: string }).type).toBe("doc");
  });

  it("splits markdown at its heading lines when there is no doc", () => {
    const sections = splitAtHeadings({
      siteId: "s1",
      locale: "en",
      content: "### Address\nStreet\n\n### Contact\nMail",
    } as LocalizedContent);

    expect(sections.map((section) => section.content)).toEqual([
      "### Address\nStreet\n",
      "### Contact\nMail",
    ]);
  });
});
