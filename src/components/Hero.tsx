import Image from "next/image";
import { neighborhoods } from "@/lib/content";

function MarqueeRow({ id }: { id: string }) {
  return (
    <div className="flex shrink-0 items-center gap-8 px-4 md:gap-10 md:px-6" aria-hidden={id !== "a"}>
      {neighborhoods.map((n) => (
        <span
          key={`${id}-${n.name}`}
          className="flex shrink-0 items-center gap-8 md:gap-10"
        >
          <span className="display whitespace-nowrap text-xs tracking-[0.18em] text-white/90 md:text-sm">
            {n.name}
          </span>
          <span
            aria-hidden
            className="inline-block h-1 w-1 shrink-0 rounded-full bg-accent"
          />
        </span>
      ))}
    </div>
  );
}

export function Hero() {
  const neighborhoodNames = neighborhoods.map((n) => n.name).join(", ");

  return (
    <section id="top" className="relative min-h-[92vh] overflow-hidden bg-navy text-white">
      <div className="absolute inset-0">
        <Image
          src="/media/shirley-clarke-franklin-park.jpg"
          alt="Shirley Clarke Franklin Park in Atlanta, overlooking the reservoir and skyline"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
          quality={75}
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(11,31,58,0.88)_0%,rgba(11,31,58,0.72)_45%,rgba(11,31,58,0.45)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(0,163,224,0.22),transparent_40%)]" />
      </div>

      <div
        className="relative z-10 border-b border-white/15 bg-navy/55 backdrop-blur-[2px]"
        aria-label={`NPU-G neighborhoods: ${neighborhoodNames}`}
      >
        <div className="overflow-hidden py-2.5 md:py-3">
          <div className="marquee-track flex">
            <MarqueeRow id="a" />
            <MarqueeRow id="b" />
          </div>
        </div>
      </div>

      <div className="relative mx-auto flex min-h-[calc(92vh-2.75rem)] max-w-7xl flex-col justify-center px-5 py-14 md:px-8 md:py-16">
        <div className="animate-rise flex items-center gap-5">
          <Image
            src="/media/npu-g-logo-white.png"
            alt="NPU-G Atlanta"
            width={160}
            height={160}
            className="h-32 w-32 object-contain md:h-36 md:w-36"
            priority
          />
          <p className="display text-sm tracking-[0.28em] text-accent md:text-base">
            13 Neighborhoods · One Community
          </p>
        </div>

        <div className="mt-6 grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <h1 className="animate-rise-delay display max-w-4xl text-5xl leading-[0.95] sm:text-6xl md:text-7xl lg:text-8xl">
            NPU-G welcomes you to the Westside of Atlanta
          </h1>
          <div className="animate-rise-delay-2">
            <p className="serif max-w-md text-xl leading-relaxed text-white/90 md:text-2xl">
              Neighborhood Planning Unit G brings residents together to shape
              zoning, planning, and the future of our streets and places.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#about" className="btn-cta">
                About NPU-G
              </a>
              <a
                href="#events"
                className="btn-outline border-white/60 text-white hover:border-accent hover:text-accent"
              >
                Upcoming Events
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
