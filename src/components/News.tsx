"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { newsItems, newsletterNeighborhoods } from "@/lib/content";

export function News() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubscribe(event: FormEvent<HTMLFormElement>) {
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
          type: "newsletter",
          name: data.get("name"),
          email: data.get("email"),
          neighborhood: data.get("neighborhood"),
        }),
      });
      const payload = (await response.json()) as { error?: string; ok?: boolean };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to subscribe.");
      }
      setStatus("success");
      setMessage("You're on the list. Watch your inbox for the next NPU-G newsletter.");
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  }

  return (
    <section id="news" className="section-anchor section-pad bg-soft">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div>
          <p className="display text-sm tracking-[0.22em] text-accent">News</p>
          <h2 className="display mt-4 text-4xl text-navy md:text-5xl lg:text-6xl">
            Monthly Newsletter
          </h2>
        </div>

        <ul className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-stretch">
          <li className="flex flex-col overflow-hidden bg-white">
            <div className="bg-accent px-7 py-7 md:py-8">
              <h3 className="display text-5xl leading-none tracking-[0.04em] text-white md:text-6xl">
                Subscribe!
              </h3>
              <p className="serif mt-3 text-sm font-bold leading-relaxed text-white">
                Monthly updates from NPU-G leadership, the City of Atlanta,
                Meeting reminders, zoning notes, and Westside community news.
              </p>
            </div>

            <form
              onSubmit={onSubscribe}
              className="flex flex-1 flex-col gap-4 p-7"
            >
              <label className="block">
                <span className="display text-xs tracking-[0.16em] text-muted">
                  Name
                </span>
                <input
                  required
                  type="text"
                  name="name"
                  autoComplete="name"
                  className="mt-2 w-full border border-line bg-soft px-4 py-3 text-navy outline-none transition focus:border-accent"
                  placeholder="Your name"
                />
              </label>
              <label className="block">
                <span className="display text-xs tracking-[0.16em] text-muted">
                  Email
                </span>
                <input
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  className="mt-2 w-full border border-line bg-soft px-4 py-3 text-navy outline-none transition focus:border-accent"
                  placeholder="you@example.com"
                />
              </label>
              <label className="block">
                <span className="display text-xs tracking-[0.16em] text-muted">
                  Neighborhood
                </span>
                <select
                  required
                  name="neighborhood"
                  defaultValue=""
                  className="mt-2 w-full appearance-none border border-line bg-soft bg-[length:12px_8px] bg-[right_1rem_center] bg-no-repeat px-4 py-3 text-navy outline-none transition focus:border-accent"
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
                disabled={status === "loading"}
                className="display mt-auto w-full bg-accent px-6 py-4 text-sm font-bold tracking-[0.16em] text-white transition hover:bg-navy disabled:opacity-60"
              >
                {status === "loading" ? "Signing up..." : "Subscribe"}
              </button>

              {message ? (
                <p
                  className={`serif text-sm ${
                    status === "error" ? "text-accent" : "text-navy"
                  }`}
                >
                  {message}
                </p>
              ) : null}
            </form>
          </li>

          {newsItems.map((item) => (
            <li
              key={item.title}
              className="group flex flex-col overflow-hidden bg-white transition-transform duration-500 hover:-translate-y-1"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-7">
                <p className="display text-xs tracking-[0.18em] text-cta">
                  {item.category}
                </p>
                <h3 className="display mt-3 text-2xl leading-tight text-navy">
                  {item.title}
                </h3>
                <p className="serif mt-4 flex-1 text-base leading-relaxed text-muted">
                  {item.summary}
                </p>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="display mt-6 inline-block text-xs tracking-[0.16em] text-navy underline decoration-accent underline-offset-4 hover:text-cta"
                >
                  Read more
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
