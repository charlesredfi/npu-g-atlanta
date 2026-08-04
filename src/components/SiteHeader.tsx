"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/content";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-line bg-white/95 shadow-[0_8px_30px_rgba(11,31,58,0.06)] backdrop-blur-md"
          : "border-transparent bg-white/90 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-5 px-4 py-4 md:px-8">
        <a href="#top" className="flex shrink-0 items-center gap-3 md:gap-4">
          <Image
            src="/media/npu-g-logo-black.png"
            alt="NPU-G Atlanta logo"
            width={72}
            height={72}
            className="h-14 w-14 object-contain md:h-16 md:w-16"
            priority
          />
          <span className="display whitespace-nowrap text-2xl tracking-[0.06em] text-navy sm:text-3xl md:text-4xl">
            NPU-G{" "}
            <span className="text-accent">Atlanta</span>
          </span>
        </a>

        <nav className="hidden items-center gap-4 lg:flex xl:gap-6" aria-label="Main">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="display whitespace-nowrap text-sm tracking-[0.1em] text-navy transition-colors hover:text-cta xl:text-base"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="display inline-flex items-center gap-2 text-lg tracking-[0.12em] text-navy lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          Menu
          <span aria-hidden className="text-accent">
            {open ? "−" : "+"}
          </span>
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-line bg-white px-5 py-5 lg:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="display text-xl tracking-[0.12em] text-navy"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
