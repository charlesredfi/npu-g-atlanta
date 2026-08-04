import Image from "next/image";
import { EventsCalendar } from "@/components/EventsCalendar";
import { upcomingMeeting } from "@/lib/content";

export function Events() {
  return (
    <section id="events" className="section-anchor section-pad border-y border-line bg-surface">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-2xl">
          <p className="display text-sm tracking-[0.22em] text-accent">Events</p>
          <h2 className="display mt-3 text-3xl text-navy md:mt-4 md:text-5xl lg:text-6xl">
            Meet, learn, gather
          </h2>
          <p className="serif mt-3 text-base leading-relaxed text-muted md:mt-5 md:text-lg">
            Monthly NPU-G meetings are the core rhythm. Use the calendar to find
            each third Thursday Zoom session and RSVP for the next gathering.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3 md:mt-12 md:grid md:items-stretch md:gap-8 lg:grid-cols-[minmax(240px,0.72fr)_1.45fr]">
          {/* Mobile: ultra-compact event strip. Desktop: fuller card. */}
          <article className="overflow-hidden bg-white ring-1 ring-line lg:flex lg:min-h-[40rem] lg:flex-col">
            {/* Mobile compact row */}
            <div className="flex gap-3 p-3 md:hidden">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-soft">
                <Image
                  src={upcomingMeeting.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="display text-[10px] tracking-[0.16em] text-accent">
                  {upcomingMeeting.type}
                </p>
                <h3 className="display mt-1 text-base leading-tight text-navy">
                  {upcomingMeeting.title}
                </h3>
                <p className="serif mt-1 truncate text-xs text-muted">
                  {upcomingMeeting.date} · {upcomingMeeting.time}
                </p>
                <a
                  href={upcomingMeeting.rsvpHref}
                  className="display mt-2 inline-flex bg-cta px-3 py-1.5 text-[10px] tracking-[0.14em] text-white"
                >
                  RSVP
                </a>
              </div>
            </div>

            {/* Desktop / tablet card */}
            <div className="hidden md:flex md:h-full md:flex-col">
              <div className="relative aspect-[16/10] shrink-0">
                <Image
                  src={upcomingMeeting.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-8">
                <p className="display text-xs tracking-[0.18em] text-accent">
                  {upcomingMeeting.type}
                </p>
                <h3 className="display mt-4 text-3xl leading-tight text-navy">
                  {upcomingMeeting.title}
                </h3>
                <dl className="serif mt-5 flex-1 space-y-3 text-base text-muted">
                  <div>
                    <dt className="display text-[10px] tracking-[0.14em] text-accent">
                      Event Title
                    </dt>
                    <dd className="mt-1 text-navy">{upcomingMeeting.eventTitle}</dd>
                  </div>
                  <div>
                    <dt className="display text-[10px] tracking-[0.14em] text-accent">
                      Date
                    </dt>
                    <dd className="mt-1 text-navy">{upcomingMeeting.date}</dd>
                  </div>
                  <div>
                    <dt className="display text-[10px] tracking-[0.14em] text-accent">
                      Time
                    </dt>
                    <dd className="mt-1 text-navy">{upcomingMeeting.time}</dd>
                  </div>
                  <div>
                    <dt className="display text-[10px] tracking-[0.14em] text-accent">
                      Location
                    </dt>
                    <dd className="mt-1 text-navy">{upcomingMeeting.location}</dd>
                  </div>
                </dl>
                <a
                  href={upcomingMeeting.rsvpHref}
                  className="btn-cta mt-7 inline-flex w-full items-center justify-center px-8 py-6 text-lg tracking-[0.18em]"
                >
                  RSVP
                </a>
              </div>
            </div>
          </article>

          <div className="flex min-h-0 flex-col lg:min-h-[40rem]">
            <EventsCalendar className="h-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
