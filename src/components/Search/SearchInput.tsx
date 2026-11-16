import { SearchIcon, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import { Input } from "../ui/Input";
import { useSearchQuery } from "./provider";

export const SearchInput = ({ className }: { className?: string }) => {
  const t = useTranslations("menu");
  const { query, setQuery, reset, isActive, setActive } = useSearchQuery();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive) {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [isActive]);

  return (
    <div
      className={cn(
        // Sized in em off text-sm, so the icons and field grow with the fluid
        // type scale; Lucide strokes scale with the icon, so weight follows.
        "flex h-[1.5em] justify-end text-sm",
        className,
        isActive && "absolute left-0 w-full gap-4",
      )}
    >
      <SearchIcon className="size-[1.5em]" onClick={() => setActive(true)} />
      <div
        className={cn(
          "grid grid-cols-[1fr,auto] items-center gap-4 overflow-hidden transition-[width] duration-300 ease-in-out",
          isActive ? "w-full" : "w-0",
        )}
      >
        <label className="sr-only" htmlFor="nav-search">
          {t("search")}
        </label>
        <Input
          id="nav-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          ref={inputRef}
          // pb nudges the text up: Metropol's custom font carries extra space
          // above its capitals, which sits them low in a centered line. In em
          // so the nudge scales with the fluid type size.
          className="h-[1.5em] border-primary bg-primary px-2 pb-[0.15em] pt-0 leading-none text-background"
        />
        <X onClick={reset} className="size-[1.5em]" />
      </div>
    </div>
  );
};
