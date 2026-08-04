import Image from "next/image";
import { EventsCalendar } from "@/components/EventsCalendar";
import { upcomingMeeting } from "@/lib/content";

export function Events() {
  return (
    <section id="events" className="section-anchor section-pad border-y border-line bg-surface">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-2xl">
          <p className="display text-sm tracking-[0.22em] text-accent">Events</p>
          <h2 className="display mt-4 text-3xl text-navy sm:text-4xl md:text-5xl lg:text-6xl">
            Meet, learn, gather
          </h2>
          <p className="serif mt-4 text-base leading-relaxed text-muted sm:mt-5 sm:text-lg">
            Monthly NPU-G meetings are the core rhythm. Use the calendar to find
            each third Thursday Zoom session and RSVP for the next gathering.
          </p>
        </div>

        <div className="mt-8 grid items-stretch gap-6 md:mt-12 md:gap-8 lg:grid-cols-[minmax(240px,0.72fr)_1.45fr]">
          <article className="flex h-full flex-col overflow-hidden bg-white shadow-[0_1px_0_rgba(11,31,58,0.06)] ring-1 ring-line lg:min-h-[40rem]">
            <div className="relative aspect-[16/10] shrink-0">
              <Image
                src={upcomingMeeting.image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-1 flex-col p-6 md:p-8">
              <p className="display text-xs tracking-[0.18em] text-accent">
                {upcomingMeeting.type}
              </p>
              <h3 className="display mt-3 text-2xl leading-tight text-navy md:mt-4 md:text-3xl">
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
                className="btn-cta mt-6 inline-flex w-full items-center justify-center px-6 py-4 text-sm tracking-[0.18em] md:mt-7 md:px-8 md:py-6 md:text-lg"
              >
                RSVP
              </a>
            </div>
          </article>

          <div className="flex h-full min-h-0 flex-col lg:min-h-[40rem]">
            <EventsCalendar className="h-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
