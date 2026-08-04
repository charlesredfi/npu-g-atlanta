import Image from "next/image";
import { aboutPoints, cityNpuResources, meetingAgenda } from "@/lib/content";

export function About() {
  return (
    <section className="relative overflow-hidden bg-surface pb-10 md:pb-12 lg:pb-14">
      <div className="bg-navy">
        <div className="mx-auto max-w-7xl px-5 py-7 md:px-8 md:py-9 lg:py-10">
          <h2 className="display text-center text-4xl text-white md:text-5xl lg:text-6xl">
            A seat at Atlanta&apos;s planning table
          </h2>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-10 md:px-8 lg:py-12">
        <div className="flex flex-row items-center gap-5 md:gap-8">
          <div className="min-w-0 flex-[0.95]">
            <p className="serif text-base leading-relaxed text-muted md:text-xl">
              NPU-G brings together 13 Westside neighborhoods as one community,
              reviewing decisions for land use &amp; licenses. Neighborhood Planning
              Units are Atlanta&apos;s official community voice on city planning.
            </p>

            <ul className="mt-6 space-y-5">
              {aboutPoints.map((point) => (
                <li key={point.title} className="border-l-2 border-accent pl-5">
                  <h3 className="display text-lg tracking-[0.08em] text-navy">
                    {point.title}
                  </h3>
                  <p className="serif mt-2 text-base leading-relaxed text-muted">
                    {point.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-[54%] max-w-[640px] shrink-0">
            <Image
              src="/media/npu-g-map-v3.png"
              alt="NPU-G Atlanta map showing thirteen neighborhoods"
              width={790}
              height={528}
              className="h-auto w-full"
              sizes="(max-width: 1024px) 54vw, 640px"
              priority
            />
          </div>
        </div>
      </div>

      <div className="border-y border-line bg-soft">
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 lg:py-12">
          <div>
            <p className="display text-sm tracking-[0.22em] text-accent">
              City of Atlanta
            </p>
            <h3 className="display mt-3 max-w-xl text-3xl text-navy md:text-4xl">
              NPU-G at a glance
            </h3>
          </div>

          <ul className="mt-8 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {cityNpuResources.map((item) => {
              const isZoom = "zoom" in item && item.zoom;

              return (
                <li key={item.id} className="flex flex-col bg-soft p-5 md:p-6">
                  <div className="flex h-7 shrink-0 items-center overflow-hidden">
                    {isZoom ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src="/media/zoom-logo.png"
                        alt="Zoom"
                        className="mr-4 block h-[20px] w-auto shrink-0 rounded-[3px] object-contain"
                      />
                    ) : null}
                    <p
                      className={`display text-sm leading-none tracking-[0.16em] text-accent ${
                        isZoom ? "" : "whitespace-nowrap"
                      }`}
                    >
                      {item.label}
                    </p>
                  </div>
                  <h4
                    className={`display mt-3 text-lg leading-none tracking-[0.04em] text-navy md:text-xl ${
                      isZoom ? "whitespace-nowrap" : ""
                    }`}
                  >
                    {isZoom ? (
                      <>
                        Attend remote meetings via Zoom{" "}
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-accent underline-offset-4 transition hover:text-cta"
                        >
                          here
                        </a>
                        .
                      </>
                    ) : (
                      item.title
                    )}
                  </h4>
                  {"lines" in item && item.lines ? (
                    <div className="serif mt-3 flex-1 text-sm leading-relaxed text-muted md:text-base">
                      {item.lines.map((line) => (
                        <p key={`${line.label}-${line.value}`}>
                          {line.label}{" "}
                          {"href" in line && line.href ? (
                            <a
                              href={line.href}
                              className="text-navy underline decoration-accent underline-offset-4 transition hover:text-cta"
                            >
                              {line.value}
                            </a>
                          ) : (
                            line.value
                          )}
                        </p>
                      ))}
                      {isZoom ? (
                        <p className="display mt-3 whitespace-nowrap text-sm font-bold uppercase tracking-[0.06em] text-accent">
                          {meetingAgenda.note}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="serif mt-3 flex-1 text-sm leading-relaxed text-muted md:text-base">
                      {item.text}
                    </p>
                  )}
                  {isZoom ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="display mt-5 flex w-full items-center justify-center bg-accent px-4 py-5 text-sm font-bold tracking-[0.16em] text-white transition hover:bg-navy md:py-6"
                    >
                      {item.cta}
                    </a>
                  ) : null}
                  <a
                    href={isZoom ? meetingAgenda.href : item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="display mt-5 self-start text-xs tracking-[0.14em] text-navy underline decoration-accent underline-offset-4 transition hover:text-cta"
                  >
                    {isZoom ? meetingAgenda.label : item.cta}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
