/**
 * Quotes through the real SDK renderer: the failure being guarded against is
 * the renderer dropping a node it has no handler for, which a test rendering
 * the handler alone would never see.
 */
import { type LocalizedContent, VenueContent } from "@venuecms/sdk-next";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { proseHandlers } from "./handlers";
import { renderedStyles } from "./styles";

const render = async (node: React.ReactNode) => {
  const stream = await renderToReadableStream(<>{node}</>);
  await stream.allReady;
  return new Response(stream).text();
};

const quoted = {
  siteId: "s1",
  locale: "en",
  contentJSON: {
    type: "doc",
    content: [
      {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Quoted line" }],
          },
        ],
      },
    ],
  },
} as unknown as LocalizedContent;

describe("proseHandlers", () => {
  it("renders a quote from the editor's JSON, with its text", async () => {
    const html = await render(
      <VenueContent
        content={quoted}
        contentStyles={renderedStyles}
        components={proseHandlers}
      />,
    );

    expect(html).toMatch(/<blockquote><p[^>]*>Quoted line<\/p><\/blockquote>/);
  });

  it("renders a quote from markdown", async () => {
    const html = await render(
      <VenueContent
        content={
          {
            siteId: "s1",
            locale: "en",
            content: "> Quoted line",
          } as LocalizedContent
        }
        contentStyles={renderedStyles}
        components={proseHandlers}
      />,
    );

    expect(html).toContain("<blockquote");
    expect(html).toContain("Quoted line");
  });
});
