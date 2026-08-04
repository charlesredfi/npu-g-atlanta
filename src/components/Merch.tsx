import Image from "next/image";

export function Merch() {
  return (
    <section
      id="merch"
      className="section-anchor section-pad bg-soft"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-xl">
            <p className="display text-sm tracking-[0.22em] text-accent">Merch</p>
            <h2 className="display mt-4 text-4xl text-navy md:text-5xl lg:text-6xl">
              Get your NPU-G Merch TODAY
            </h2>
            <p className="serif mt-5 text-lg leading-relaxed text-muted">
              Show NPU-G pride with neighborhood gear for meeting nights, cleanups,
              and everyday Westside life.
            </p>
            <a
              href="#contact"
              className="btn-cta mt-8 flex w-full items-center justify-center gap-3"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className="h-5 w-5 shrink-0 stroke-current"
              >
                <path
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.5 4.5h1.6l1.7 10.2a1.5 1.5 0 0 0 1.5 1.3h8.9a1.5 1.5 0 0 0 1.5-1.2l1.4-6.3H7"
                />
                <circle cx="9.2" cy="19.2" r="1.3" fill="currentColor" stroke="none" />
                <circle cx="16.8" cy="19.2" r="1.3" fill="currentColor" stroke="none" />
              </svg>
              Shop NPU-G. Order Now
            </a>
            <div className="mt-3 w-full max-w-lg md:max-w-xl">
              <Image
                src="/media/npu-g-shirt-mockup.png"
                alt="NPU-G black tee mockup with Atlanta skyline and 13 Neighborhoods One Community"
                width={586}
                height={425}
                className="h-auto w-full"
                sizes="(max-width: 1024px) 90vw, 36rem"
              />
            </div>
          </div>
          <div className="w-full">
            <Image
              src="/media/merch-npu-shirt.png"
              alt="Charles Bourgeois holding an NPU-G 13 Neighborhoods One Community skyline tee"
              width={821}
              height={1024}
              className="h-auto w-full"
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
