"use client";

import { FormEvent, useState } from "react";

export function Contact() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          name: data.get("name"),
          email: data.get("email"),
          neighborhood: data.get("neighborhood"),
          message: data.get("message"),
        }),
      });
      const payload = (await response.json()) as { error?: string; ok?: boolean };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to send message.");
      }
      setStatus("success");
      setMessage("Message sent; thank you for reaching out to NPU-G.");
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  }

  return (
    <section id="contact" className="section-anchor section-pad bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-2 md:px-8">
        <div>
          <p className="display text-sm tracking-[0.22em] text-accent">Contact Us</p>
          <h2 className="display mt-4 text-4xl md:text-5xl lg:text-6xl">
            Reach NPU-G
          </h2>
          <p className="serif mt-5 text-lg leading-relaxed text-white/75">
            Have a zoning question, want to present at a meeting, or need a
            neighborhood contact? Send a message and we&apos;ll follow up.
          </p>
          <ul className="mt-8 space-y-6">
            <li>
              <p className="display text-xs tracking-[0.18em] text-accent">
                NPU Chairperson
              </p>
              <p className="display mt-2 text-lg tracking-[0.04em] text-white">
                Torrey Sumlin
              </p>
              <p className="serif mt-1 text-base text-white/80">
                <a
                  href="tel:+16786009829"
                  className="underline decoration-accent/60 underline-offset-4 hover:text-accent"
                >
                  678-600-9829
                </a>
              </p>
              <p className="serif text-base text-white/80">
                <a
                  href="mailto:chair@npugatlanta.org"
                  className="underline decoration-accent/60 underline-offset-4 hover:text-accent"
                >
                  chair@npugatlanta.org
                </a>
              </p>
            </li>
            <li>
              <p className="display text-xs tracking-[0.18em] text-accent">
                City Planner
              </p>
              <p className="display mt-2 text-lg tracking-[0.04em] text-white">
                Nathan Carson
              </p>
              <p className="serif mt-1 text-base text-white/80">
                <a
                  href="tel:+16783819481"
                  className="underline decoration-accent/60 underline-offset-4 hover:text-accent"
                >
                  678-381-9481
                </a>
              </p>
              <p className="serif text-base text-white/80">
                <a
                  href="mailto:NATCarson@atlantaga.gov"
                  className="underline decoration-accent/60 underline-offset-4 hover:text-accent"
                >
                  NATCarson@atlantaga.gov
                </a>
              </p>
            </li>
            <li>
              <p className="display text-xs tracking-[0.18em] text-accent">
                Zoning Representative
              </p>
              <p className="display mt-2 text-lg tracking-[0.04em] text-white">
                LA Williams &amp; Ola Reynolds
              </p>
              <p className="serif mt-1 text-base text-white/80">
                <a
                  href="tel:+14049888990"
                  className="underline decoration-accent/60 underline-offset-4 hover:text-accent"
                >
                  404-988-8990
                </a>
              </p>
              <p className="serif text-base text-white/80">
                <a
                  href="mailto:secretary@npugatlanta.org"
                  className="underline decoration-accent/60 underline-offset-4 hover:text-accent"
                >
                  secretary@npugatlanta.org
                </a>
              </p>
            </li>
            <li>
              <p className="display text-xs tracking-[0.18em] text-accent">
                DCP Director
              </p>
              <p className="display mt-2 text-lg tracking-[0.04em] text-white">
                Leah LaRue
              </p>
              <p className="serif mt-1 text-base text-white/80">
                <a
                  href="tel:+14045460159"
                  className="underline decoration-accent/60 underline-offset-4 hover:text-accent"
                >
                  404-546-0159
                </a>
              </p>
              <p className="serif text-base text-white/80">
                <a
                  href="mailto:llarue@atlantaga.gov"
                  className="underline decoration-accent/60 underline-offset-4 hover:text-accent"
                >
                  llarue@atlantaga.gov
                </a>
              </p>
            </li>
          </ul>
        </div>

        <form
          className="space-y-4 border border-white/15 bg-white/5 p-6 md:p-8"
          onSubmit={onSubmit}
        >
          <label className="block">
            <span className="display text-xs tracking-[0.16em] text-white/70">
              Name
            </span>
            <input
              required
              type="text"
              name="name"
              className="mt-2 w-full border border-white/20 bg-navy px-4 py-3 text-white outline-none focus:border-cta"
              placeholder="Your name"
            />
          </label>
          <label className="block">
            <span className="display text-xs tracking-[0.16em] text-white/70">
              Email
            </span>
            <input
              required
              type="email"
              name="email"
              className="mt-2 w-full border border-white/20 bg-navy px-4 py-3 text-white outline-none focus:border-cta"
              placeholder="you@example.com"
            />
          </label>
          <label className="block">
            <span className="display text-xs tracking-[0.16em] text-white/70">
              Neighborhood
            </span>
            <input
              type="text"
              name="neighborhood"
              className="mt-2 w-full border border-white/20 bg-navy px-4 py-3 text-white outline-none focus:border-cta"
              placeholder="e.g. West Highlands"
            />
          </label>
          <label className="block">
            <span className="display text-xs tracking-[0.16em] text-white/70">
              Message
            </span>
            <textarea
              required
              name="message"
              rows={4}
              className="mt-2 w-full resize-y border border-white/20 bg-navy px-4 py-3 text-white outline-none focus:border-cta"
              placeholder="How can NPU-G help?"
            />
          </label>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-cta px-6 py-3 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white hover:text-navy disabled:opacity-60"
          >
            {status === "loading" ? "Sending..." : "Send message"}
          </button>
          {message ? (
            <p
              className={`serif text-sm ${
                status === "error" ? "text-accent" : "text-white/80"
              }`}
            >
              {message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
