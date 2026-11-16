/**
 * Handlers for prose nodes the SDK's renderer does not draw itself, for every
 * VenueContent on the site — page bodies, bios, the footer, the site blurb.
 *
 * Without one, the renderer drops the node: a quote an author marked up simply
 * vanished. Each handler is handed the node's children already rendered, so
 * it only has to give them their element. Styling lives with the element in
 * globals.css, because content that only has markdown (no editor JSON) goes
 * through a different renderer, which emits a bare <blockquote> with no hook
 * for a class.
 *
 * Page bodies extend this with the blocks only they carry; see
 * `contentHandlers` in ListingBlock.
 */
import type { NodeHandlers } from "@venuecms/sdk-next";

export const proseHandlers: NodeHandlers = {
  blockquote: ({ children }) => <blockquote>{children}</blockquote>,
};
