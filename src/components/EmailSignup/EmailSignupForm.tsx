"use client";

import { useTranslations } from "next-intl";
import { useActionState, useId, useMemo } from "react";

import { cn } from "@/lib/utils";
import { useSiteKey } from "@/lib/utils/VenueProvider";

import { type SignupState, subscribeToMailingList } from "./actions";

const initialState: SignupState = { status: "idle" };

/**
 * The form's colors for each scheme. Inverted is for a surface filled with the
 * page's text color — the footer — where the usual primary border and button
 * would vanish into the fill: there the page's background takes their place.
 */
const tones = {
  default: {
    text: "text-primary",
    field:
      "border-primary text-primary placeholder:text-primary focus-visible:outline-primary",
    button:
      "border-primary bg-primary text-background focus-visible:outline-primary",
    error: "text-error",
  },
  inverted: {
    text: "text-background",
    field:
      "border-background text-background placeholder:text-background focus-visible:outline-background",
    button:
      "border-background bg-background text-primary focus-visible:outline-background",
    // The themes define no error color against their text color, so a message
    // keeps to the surface's own text, where it is sure to be legible.
    error: "text-background",
  },
};

export const EmailSignupForm = ({
  tags = [],
  inverted = false,
  className,
}: {
  /** Ids of the tags a signup is filed under, from the content node. */
  tags?: string[];
  /** For a surface filled with the page's text color, like the footer. */
  inverted?: boolean;
  className?: string;
}) => {
  const tone = tones[inverted ? "inverted" : "default"];
  const t = useTranslations("signup");
  const inputId = useId();
  const messageId = useId();
  const siteKey = useSiteKey();

  // Bound rather than wrapped in a closure, so the form posts to the server
  // action directly and still submits before hydration.
  const action = useMemo(
    () => subscribeToMailingList.bind(null, siteKey ?? "", tags),
    [siteKey, tags],
  );
  const [state, formAction, pending] = useActionState(action, initialState);

  // Outside a VenueProvider there is no site to sign anyone up to.
  if (!siteKey) {
    return null;
  }

  if (state.status === "success") {
    return (
      <p role="status" className={cn("text-xs", tone.text, className)}>
        {t("success")}
      </p>
    );
  }

  const isError = state.status !== "idle";
  const message =
    state.status === "rate_limited"
      ? state.retryAfter
        ? t("rate_limited_seconds", { seconds: Math.ceil(state.retryAfter) })
        : t("rate_limited")
      : isError
        ? t(state.status)
        : null;

  return (
    <form
      action={formAction}
      // Set in text-xs with its spacing in em, so padding and gaps keep their
      // proportion to the type as the fluid scale grows.
      className={cn(
        "flex max-w-[72ch] flex-col gap-[0.5em] text-xs",
        className,
      )}
    >
      {/* Kept for screen readers; the placeholder carries it on screen. */}
      <label htmlFor={inputId} className="sr-only">
        {t("label")}
      </label>
      <div className="flex flex-col gap-[1em] sm:flex-row sm:gap-[2em]">
        <input
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          placeholder={t("placeholder")}
          aria-invalid={state.status === "invalid" || undefined}
          aria-describedby={message ? messageId : undefined}
          className={cn(
            "min-w-0 flex-1 border-2 bg-transparent px-[1.5em] py-[1em] leading-none",
            "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
            tone.field,
          )}
        />
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "border-2 px-[3em] py-[1em] leading-none hover:opacity-80 disabled:opacity-50",
            "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
            tone.button,
          )}
        >
          {pending ? t("submitting") : t("submit")}
        </button>
      </div>
      <p
        id={messageId}
        role="alert"
        className={cn(tone.error, !message && "sr-only")}
      >
        {message}
      </p>
    </form>
  );
};
