import Image from "next/image";
import { neighborhoods } from "@/lib/content";

export function Neighborhoods() {
  return (
    <section
      id="neighborhoods"
      className="section-anchor section-pad relative overflow-hidden bg-navy text-white"
    >
      <div className="absolute inset-0 opacity-25">
        <Image
          src="/media/npu-g-map-v3.png"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,31,58,0.92)_0%,rgba(11,31,58,0.88)_100%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-3xl">
          <h2 className="display text-4xl md:text-5xl lg:text-6xl">
            13 Neighborhoods
          </h2>
          <p className="serif mt-5 text-lg leading-relaxed text-white/75 md:text-xl">
            View our community across NPU-G, listed alphabetically below:
          </p>
        </div>

        <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {neighborhoods.map((place, index) => {
            const number = String(index + 1).padStart(2, "0");
            const inner = (
              <>
                <span className="display text-sm tracking-[0.14em] text-accent">
                  {number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="display block text-lg tracking-[0.06em] text-white md:text-xl">
                    {place.name}
                  </span>
                  <span className="serif mt-1 block text-sm text-white/60">
                    {place.association
                      ? place.association
                      : "Association link coming soon"}
                  </span>
                </span>
                {place.href ? (
                  <span
                    aria-hidden
                    className="display text-xs tracking-[0.14em] text-cta"
                  >
                    Visit →
                  </span>
                ) : null}
              </>
            );

            return (
              <li key={place.name}>
                {place.href ? (
                  <a
                    href={place.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-full items-start gap-4 border border-white/15 bg-white/5 px-4 py-4 transition-colors hover:border-accent hover:bg-white/10"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="flex h-full items-start gap-4 border border-white/10 bg-white/[0.03] px-4 py-4">
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
