"use client";

import { FormEvent, useState } from "react";
import { newsletterNeighborhoods } from "@/lib/content";
import { deliverSiteForm } from "@/lib/deliverSiteForm";

const committees = [
  {
    title: "Land Use and Zoning Committee",
    members: ["LA Williams", "Ola Reynolds"],
  },
  {
    title: "Public Safety and Code Enforcement Committee",
    members: ["Andrew Anderson", "Nancy Atufunwa"],
  },
  {
    title: "Bylaw and Policy Committee",
    members: ["Darvin Thurman", "JoAnna Powell"],
  },
  {
    title: "Parks and Recreation and Cultural Affairs Committee",
    members: ["Nio Olutosin", "JoAnna Powell"],
  },
  {
    title: "Marketing/Social Media Committee",
    members: ["Charles Bourgeois"],
  },
] as const;

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
      const result = await deliverSiteForm({
        type: "contact",
        name: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        neighborhood: String(data.get("neighborhood") || ""),
        message: String(data.get("message") || ""),
      });
      setStatus("success");
      setMessage(
        result.via === "sheet"
          ? "Message received and saved. Email notification is still finishing setup."
          : "Message sent; thank you for reaching out to NPU-G.",
      );
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
                NPU-G Chairperson
              </p>
              <p className="display mt-2 text-lg tracking-[0.04em] text-white">
                Torrey Sumlin
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
          </ul>

          <div className="mt-10 border-t border-white/15 pt-8">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <p className="display text-sm tracking-[0.22em] text-accent">
                Committees
              </p>
              <a
                href="mailto:info@npugatlanta.org"
                className="serif text-base text-white/80 underline decoration-accent/60 underline-offset-4 hover:text-accent"
              >
                info@npugatlanta.org
              </a>
            </div>
            <ul className="mt-6 space-y-6">
              {committees.map((committee) => (
                <li key={committee.title}>
                  <p className="display text-xs tracking-[0.18em] text-accent">
                    {committee.title}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {committee.members.map((member) => (
                      <li
                        key={`${committee.title}-${member}`}
                        className="display text-lg tracking-[0.04em] text-white"
                      >
                        {member}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <form
          className="h-fit space-y-4 border border-white/15 bg-white/5 p-6 md:sticky md:top-28 md:p-8"
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
            <select
              required
              name="neighborhood"
              defaultValue=""
              className="mt-2 w-full appearance-none border border-white/20 bg-navy bg-[length:12px_8px] bg-[right_1rem_center] bg-no-repeat px-4 py-3 text-white outline-none focus:border-cta"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23ffffff' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`,
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
