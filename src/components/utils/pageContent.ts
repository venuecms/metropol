import type { LocalizedContent } from "@venuecms/sdk-next";

/** Whether a body would put anything on screen. */
export const hasRenderableContent = (content?: LocalizedContent): boolean => {
  const doc = content?.contentJSON;

  // Mirrors VenueContent, which renders a present `contentJSON` and only falls
  // back to markdown without one — so an emptied doc beats a stale body.
  if (!doc) {
    return Boolean(content?.content?.trim());
  }

  const nodes = doc.content;

  // A cleared editor still saves a doc, holding one empty paragraph. Only a
  // paragraph is judged by its children; an image carries no text and is content.
  return (
    Array.isArray(nodes) &&
    nodes.some((node) => {
      const { type, content: children } = (node ?? {}) as {
        type?: string;
        content?: unknown;
      };

      return (
        type !== "paragraph" || (Array.isArray(children) && children.length > 0)
      );
    })
  );
};

/**
 * A body split into sections, each starting at a heading — so a layout can set
 * them side by side. Anything before the first heading is a section of its own.
 *
 * Splits `contentJSON` when present, since that is what VenueContent renders;
 * otherwise falls back to splitting the markdown at its heading lines. Each
 * section keeps the rest of the record, so it renders like the whole would.
 */
export const splitAtHeadings = (
  content: LocalizedContent,
): LocalizedContent[] => {
  const doc = content.contentJSON as
    | { content?: Array<{ type?: string }> }
    | null
    | undefined;

  if (doc && Array.isArray(doc.content)) {
    const sections = doc.content.reduce<Array<typeof doc.content>>(
      (sections, node) => {
        if (node?.type === "heading" || !sections.length) {
          sections.push([]);
        }
        sections[sections.length - 1].push(node);
        return sections;
      },
      [],
    );

    return sections.map((nodes) => ({
      ...content,
      contentJSON: {
        ...doc,
        content: nodes,
      } as LocalizedContent["contentJSON"],
    }));
  }

  if (content.content?.trim()) {
    return content.content
      .split(/\n(?=#{1,6}\s)/)
      .filter((section) => section.trim())
      .map((section) => ({ ...content, content: section }));
  }

  return [];
};
