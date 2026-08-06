"use client";

import Image from "next/image";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { newsletterNeighborhoods } from "@/lib/content";
import { deliverSiteForm } from "@/lib/deliverSiteForm";

export function SubscribeModal() {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMounted(true);
    // Always open on each page load (no session/local storage remember).
    const frame = window.requestAnimationFrame(() => setOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function dismiss() {
    setOpen(false);
  }

  async function onSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const result = await deliverSiteForm({
        type: "newsletter",
        name: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        neighborhood: String(data.get("neighborhood") || ""),
      });
      setStatus("success");
      setMessage(
        result.via === "sheet"
          ? "You're on the list and saved. Email notification is still finishing setup."
          : "You're on the list. Watch your inbox for the next NPU-G newsletter.",
      );
      form.reset();
      window.setTimeout(dismiss, 1400);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">
      <button
        type="button"
        aria-label="Dismiss subscribe dialog"
        className="absolute inset-0 bg-navy/70 backdrop-blur-[2px]"
        onClick={dismiss}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex w-full max-w-md flex-col overflow-hidden border border-white/15 bg-white shadow-[0_24px_80px_rgba(11,31,58,0.35)] max-h-[min(100dvh-1.5rem,560px)]"
      >
        <div className="relative shrink-0 bg-accent px-4 py-3 pr-12 sm:px-5 sm:py-3.5">
          <Image
            src="/media/npu-g-logo-white.png"
            alt="NPU-G"
            width={320}
            height={104}
            className="h-14 w-auto sm:h-16"
            priority
          />
          <p
            id={titleId}
            className="display mt-2.5 text-2xl leading-none tracking-[0.04em] text-white sm:text-3xl"
          >
            Join our Newsletter!
          </p>
          <p className="serif mt-1.5 text-xs font-bold leading-snug text-white sm:text-sm">
            Monthly updates, meeting reminders, zoning notes, and Westside news.
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={dismiss}
            aria-label="Close"
            className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center text-white transition hover:bg-white/15"
          >
            <span className="display text-2xl leading-none" aria-hidden>
              ×
            </span>
          </button>
        </div>

        <form
          onSubmit={onSubscribe}
          className="flex min-h-0 flex-1 flex-col gap-2.5 px-4 py-3.5 sm:gap-3 sm:px-5 sm:py-4"
        >
          <label className="block">
            <span className="display text-[11px] tracking-[0.16em] text-muted">
              Name
            </span>
            <input
              required
              type="text"
              name="name"
              autoComplete="name"
              className="mt-1 w-full border border-line bg-soft px-3 py-2.5 text-sm text-navy outline-none transition focus:border-accent sm:py-3"
              placeholder="Your name"
            />
          </label>
          <label className="block">
            <span className="display text-[11px] tracking-[0.16em] text-muted">
              Email
            </span>
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              className="mt-1 w-full border border-line bg-soft px-3 py-2.5 text-sm text-navy outline-none transition focus:border-accent sm:py-3"
              placeholder="you@example.com"
            />
          </label>
          <label className="block">
            <span className="display text-[11px] tracking-[0.16em] text-muted">
              Neighborhood
            </span>
            <select
              required
              name="neighborhood"
              defaultValue=""
              className="mt-1 w-full appearance-none border border-line bg-soft bg-[length:12px_8px] bg-[right_0.85rem_center] bg-no-repeat px-3 py-2.5 text-sm text-navy outline-none transition focus:border-accent sm:py-3"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%230B1F3A' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`,
              }}
            >
              <option value="" disabled>
                Select your neighborhood
              </option>
              {newsletterNeighborhoods.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className="display mt-1 w-full bg-accent px-5 py-3 text-sm font-bold tracking-[0.16em] text-white transition hover:bg-navy disabled:opacity-60"
          >
            {status === "loading"
              ? "Signing up..."
              : status === "success"
                ? "Subscribed"
                : "Subscribe"}
          </button>

          {message ? (
            <p
              className={`serif text-xs leading-snug sm:text-sm ${
                status === "error" ? "text-accent" : "text-navy"
              }`}
            >
              {message}
            </p>
          ) : null}
        </form>
      </div>
    </div>,
    document.body,
  );
}
