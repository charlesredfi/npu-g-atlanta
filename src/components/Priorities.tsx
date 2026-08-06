"use client";

import { useEffect, useRef, useState } from "react";
import { priorities } from "@/lib/content";

type PriorityId = (typeof priorities)[number]["id"];

const CITY_VIDEO = "/media/atlanta-skyline.mp4";

const landUseContacts = [
  {
    title: "Zoning Representative",
    name: "LA Williams & Ola Reynolds",
    email: "info@npugatlanta.org",
  },
  {
    title: "City Planner",
    name: "Nathan Carson",
    email: "NATCarson@atlantaga.gov",
  },
  {
    title: "DCP Director",
    name: "Leah LaRue",
    email: "llarue@atlantaga.gov",
  },
] as const;

export function Priorities() {
  const [activeId, setActiveId] = useState<PriorityId>("land-use");
  const [playing, setPlaying] = useState(true);
  const [loadVideo, setLoadVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoShellRef = useRef<HTMLDivElement>(null);

  // Defer fetching the 4.8MB city video until the section is near the viewport.
  useEffect(() => {
    const shell = videoShellRef.current;
    if (!shell) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px", threshold: 0.01 },
    );
    observer.observe(shell);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!loadVideo) return;
    const video = videoRef.current;
    if (!video) return;

    // iOS Safari: mute + playsInline must be set as properties AND attributes.
    video.defaultMuted = true;
    video.muted = true;
    video.volume = 0;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "true");

    let cancelled = false;

    const tryPlay = () => {
      if (cancelled) return;
      if (!playing) {
        video.pause();
        return;
      }
      void video.play().then(
        () => {
          if (!cancelled) setPlaying(true);
        },
        () => {
          // Autoplay blocked (common in Low Power Mode). Leave paused until gesture.
        },
      );
    };

    tryPlay();

    const onReady = () => tryPlay();
    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);

    // Play in view; pause off-screen to cut CPU/GPU lag while scrolling.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (visible) tryPlay();
        else video.pause();
      },
      { threshold: 0.15 },
    );
    observer.observe(video);

    const unlock = () => tryPlay();
    document.addEventListener("touchstart", unlock, { passive: true, once: true });

    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      observer.disconnect();
      document.removeEventListener("touchstart", unlock);
    };
  }, [loadVideo, playing]);

  return (
    <section
      id="priorities"
      className="section-anchor relative min-h-[min(90vh,860px)] overflow-x-clip bg-[#eef1f4]"
    >
      <div className="grid min-h-[min(90vh,860px)] lg:grid-cols-[minmax(280px,30%)_1fr]">
        {/* Cream left rail */}
        <div className="relative z-20 flex flex-col overflow-visible bg-[#eef1f4] px-6 py-14 md:px-10 lg:py-20 xl:px-12">
          <h2 className="display text-4xl text-navy md:text-5xl xl:text-6xl">
            2026-2027 Priorities
          </h2>

          <ul
            className="mt-10 border-t border-navy/15"
            role="tablist"
            aria-label="NPU-G priorities"
          >
            {priorities.map((item) => {
              const isActive = item.id === activeId;

              if (isActive) {
                return (
                  <li
                    key={item.id}
                    role="presentation"
                    className="relative z-30 border-b border-navy/15"
                  >
                    <div className="flex flex-col shadow-[0_18px_50px_rgba(11,31,58,0.22)] lg:absolute lg:left-0 lg:top-0 lg:w-[min(92vw,720px)] lg:flex-row">
                      <div className="relative w-full bg-white px-6 py-7 md:px-8 md:py-8 lg:w-[46%]">
                        <span
                          className="absolute bottom-0 left-0 top-0 w-[3px] bg-accent"
                          aria-hidden
                        />
                        <button
                          type="button"
                          role="tab"
                          aria-selected
                          className="display w-full text-left text-sm tracking-[0.1em] text-navy md:text-base"
                          onClick={() => setActiveId(item.id)}
                        >
                          {item.label}
                        </button>
                        <p className="serif mt-3 text-base leading-snug text-foreground md:text-lg">
                          {item.summary}
                        </p>
                        <a
                          href="#about"
                          className="btn-outline mt-6 inline-flex text-navy hover:bg-navy hover:text-white"
                        >
                          Learn more
                        </a>
                      </div>

                      <div className="flex w-full flex-col justify-center bg-navy px-6 py-7 md:px-8 md:py-8 lg:w-[54%]">
                        {item.id === "land-use" ? (
                          <ul className="space-y-5">
                            {landUseContacts.map((contact) => (
                              <li key={contact.title}>
                                <p className="display text-[11px] tracking-[0.18em] text-accent">
                                  {contact.title}
                                </p>
                                <p className="display mt-1.5 text-sm tracking-[0.04em] text-white md:text-base">
                                  {contact.name}
                                </p>
                                <p className="serif mt-1 text-sm text-white/80">
                                  <a
                                    href={`mailto:${contact.email}`}
                                    className="underline decoration-white/35 underline-offset-4 transition hover:text-accent hover:decoration-accent"
                                  >
                                    {contact.email}
                                  </a>
                                </p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <>
                            <p className="display text-xs tracking-[0.18em] text-accent">
                              {item.highlightLabel}
                            </p>
                            <a
                              href={item.highlightHref}
                              className="serif mt-3 text-lg leading-snug text-white underline decoration-white/40 underline-offset-4 transition hover:decoration-accent md:text-xl"
                            >
                              {item.highlightTitle}
                            </a>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Holds list height while the card is absolutely positioned on desktop */}
                    <div
                      className={`hidden lg:block ${
                        item.id === "land-use" ? "lg:h-[420px]" : "lg:h-[210px]"
                      }`}
                      aria-hidden
                    />
                  </li>
                );
              }

              return (
                <li key={item.id} role="presentation" className="border-b border-navy/15">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={false}
                    onClick={() => setActiveId(item.id)}
                    className="display w-full py-4 text-left text-sm tracking-[0.1em] text-navy/50 transition-colors hover:text-navy md:text-[15px]"
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Clear City of Atlanta video — city still shows until video plays */}
        <div
          ref={videoShellRef}
          className="relative min-h-[380px] bg-navy bg-cover bg-center sm:min-h-[480px] lg:min-h-0"
          style={{ backgroundImage: "url(/media/atlanta-city-poster.jpg)" }}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster="/media/atlanta-city-poster.jpg"
            disableRemotePlayback
            aria-hidden
            onCanPlay={() => {
              const video = videoRef.current;
              if (!video || !playing) return;
              video.muted = true;
              void video.play().catch(() => undefined);
            }}
          >
            {loadVideo ? <source src={CITY_VIDEO} type="video/mp4" /> : null}
          </video>

          <button
            type="button"
            onClick={() => {
              const video = videoRef.current;
              setPlaying((value) => {
                const next = !value;
                if (video) {
                  video.muted = true;
                  if (next) {
                    if (!loadVideo) setLoadVideo(true);
                    void video.play().catch(() => undefined);
                  } else video.pause();
                }
                return next;
              });
            }}
            className="absolute right-5 top-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-accent bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/55"
            aria-label={playing ? "Pause background video" : "Play background video"}
          >
            {playing ? (
              <span className="flex gap-1" aria-hidden>
                <span className="h-3.5 w-[3px] bg-white" />
                <span className="h-3.5 w-[3px] bg-white" />
              </span>
            ) : (
              <span
                className="ml-0.5 h-0 w-0 border-y-[7px] border-l-[12px] border-y-transparent border-l-white"
                aria-hidden
              />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
