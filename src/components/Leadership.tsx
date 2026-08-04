import Image from "next/image";
import { leadershipBoard } from "@/lib/content";

const PLACEHOLDER = "/media/leader-silhouette.svg";

export function Leadership() {
  return (
    <section
      id="about"
      className="section-anchor section-pad relative overflow-hidden bg-surface"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="display text-sm tracking-[0.22em] text-accent">
              About Us
            </p>
            <h2 className="display mt-3 text-3xl text-navy md:text-4xl lg:text-5xl">
              Executive Leadership Board
            </h2>
          </div>
          <p className="serif max-w-md text-base text-muted md:text-right">
            The volunteer officers guiding NPU-G&apos;s city planning
            recommendations to Atlanta City Council and the Mayor.
          </p>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">
          {leadershipBoard.map((member) => {
            const src = member.image ?? PLACEHOLDER;
            const isPlaceholder = !member.image;

            return (
              <li key={member.name} className="group border border-line bg-white">
                <div className="relative aspect-[3/4] overflow-hidden bg-soft">
                  {isPlaceholder ? (
                    // SVG placeholders skip next/image optimization.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={PLACEHOLDER}
                      alt={`Portrait placeholder for ${member.name}`}
                      className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                  ) : (
                    <Image
                      src={src}
                      alt={member.name}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 1024px) 33vw, 16vw"
                    />
                  )}
                </div>
                <div className="border-t border-line px-1.5 py-2.5 md:px-2">
                  <h3 className="display min-h-[2.4em] text-[12px] font-bold leading-snug tracking-[0.03em] text-navy sm:text-[13px] md:text-sm">
                    {member.name}
                  </h3>
                  <p className="display mt-1 !normal-case text-xs font-semibold tracking-normal text-cta md:text-[13px]">
                    {member.role}
                  </p>
                  <a
                    href={`mailto:${member.email}`}
                    className="mt-1.5 block break-all text-[10px] leading-snug text-muted underline decoration-accent/50 underline-offset-2 transition hover:text-accent sm:text-[11px]"
                  >
                    {member.email}
                  </a>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-stretch">
          <div className="min-w-0 flex-1 border border-line bg-soft px-5 py-4 md:px-6">
            <p className="display text-xs tracking-[0.16em] text-accent">
              City Council Districts
            </p>
            <p className="serif mt-2 text-base leading-relaxed text-navy md:text-lg">
              District 3,{" "}
              <a
                href="https://citycouncil.atlantaga.gov/council-members/byron-amos"
                target="_blank"
                rel="noopener noreferrer"
                className="display !normal-case underline decoration-accent underline-offset-4 transition hover:text-cta"
              >
                Byron Amos
              </a>
              <span className="mx-4 text-navy/40 md:mx-5" aria-hidden>
                |
              </span>
              District 9,{" "}
              <a
                href="https://citycouncil.atlantaga.gov/council-members/dustin-hillis"
                target="_blank"
                rel="noopener noreferrer"
                className="display !normal-case underline decoration-accent underline-offset-4 transition hover:text-cta"
              >
                Dustin Hillis
              </a>
              <span className="mx-4 text-navy/40 md:mx-5" aria-hidden>
                |
              </span>
              District 10,{" "}
              <a
                href="https://citycouncil.atlantaga.gov/council-members/andrea-l-boone"
                target="_blank"
                rel="noopener noreferrer"
                className="display !normal-case underline decoration-accent underline-offset-4 transition hover:text-cta"
              >
                Andrea L. Boone
              </a>
            </p>
          </div>
          <a
            href="#contact"
            className="btn-cta flex shrink-0 items-center justify-center bg-cta px-8 py-4 text-white hover:bg-navy"
          >
            Contact NPU-G
          </a>
        </div>
      </div>
    </section>
  );
}
