import "./globals.css";

/**
 * Rendered for every `notFound()` in the app, inside the root layout — which
 * only returns its children — so it supplies its own document.
 *
 * It must not `redirect("/")`: when the home page itself is what 404s (an
 * unknown site key, or the site failing to load), `/` leads straight back to
 * `/[locale]` and another 404, and the client router crashes on the loop
 * (React error #310).
 */
export default function NotFound() {
  return (
    <html lang="en">
      <body className="m-auto flex min-h-screen flex-col items-start justify-center gap-6 bg-background px-6 font-regular text-primary antialiased sm:max-w-[96rem] sm:px-12">
        <h1 className="text-lg">Page not found</h1>
        <a href="/" className="underline hover:opacity-80">
          Go to the home page
        </a>
      </body>
    </html>
  );
}
