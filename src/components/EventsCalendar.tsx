"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { meetingAgenda, zoomMeeting } from "@/lib/content";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function thirdThursday(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1);
  const offset = (4 - first.getDay() + 7) % 7;
  const firstThursday = 1 + offset;
  return new Date(year, monthIndex, firstThursday + 14);
}

function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildMonthCells(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: Array<Date | null> = [];
  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, monthIndex, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function MeetingDetails({
  isJulyRecess,
  meetingDate,
  compact = false,
}: {
  isJulyRecess: boolean;
  meetingDate: Date;
  compact?: boolean;
}) {
  if (isJulyRecess) {
    return (
      <div>
        <h3
          className={`display leading-tight text-navy ${
            compact ? "text-lg" : "text-xl md:text-2xl"
          }`}
        >
          No meeting in July
        </h3>
        <p
          className={`serif mt-2 leading-relaxed text-muted ${
            compact ? "text-sm" : "mt-3 text-base"
          }`}
        >
          NPU-G does not meet in July. Monthly Zoom meetings resume in August on
          the third Thursday.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Image
        src="/media/zoom-logo.png"
        alt="Zoom"
        width={1024}
        height={537}
        className={`w-auto rounded-[3px] object-contain ${
          compact ? "mb-2 h-5" : "mb-3 h-6"
        }`}
      />
      <h3
        className={`display leading-tight text-navy ${
          compact ? "text-lg" : "text-xl md:text-2xl"
        }`}
      >
        {zoomMeeting.title}
      </h3>
      <p className={`serif text-muted ${compact ? "mt-2 text-sm" : "mt-3 text-base"}`}>
        {MONTHS[meetingDate.getMonth()]} {meetingDate.getDate()},{" "}
        {meetingDate.getFullYear()}
      </p>
      <p className={`serif text-muted ${compact ? "mt-0.5 text-sm" : "mt-1 text-base"}`}>
        {zoomMeeting.time}
      </p>
      <ul
        className={`serif space-y-1 text-navy ${
          compact ? "mt-3 text-sm" : "mt-4 space-y-2 text-base"
        }`}
      >
        <li>Meeting ID {zoomMeeting.meetingId}</li>
        <li>
          Dial-In{" "}
          <a
            href={`tel:+1${zoomMeeting.dialIn.replace(/\D/g, "")}`}
            className="underline decoration-accent underline-offset-4 hover:text-cta"
          >
            {zoomMeeting.dialIn}
          </a>
        </li>
        <li>Access Code {zoomMeeting.accessCode}</li>
      </ul>
      <p
        className={`display font-bold uppercase tracking-[0.06em] text-accent ${
          compact
            ? "mt-3 text-[11px]"
            : "mt-4 text-xs md:whitespace-nowrap md:text-sm"
        }`}
      >
        {meetingAgenda.note}
      </p>
      <div
        className={`flex flex-col gap-2 sm:flex-row sm:flex-wrap ${
          compact ? "mt-4" : "mt-5 gap-3"
        }`}
      >
        <a
          href={meetingAgenda.href}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline w-full justify-center text-navy hover:bg-navy hover:text-white sm:w-auto"
        >
          {meetingAgenda.label}
        </a>
        <a
          href={zoomMeeting.href}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cta w-full justify-center sm:w-auto"
        >
          Join on Zoom
        </a>
      </div>
    </div>
  );
}

export function EventsCalendar({ className = "" }: { className?: string }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [monthIndex, setMonthIndex] = useState(today.getMonth());

  const meetingDate = useMemo(
    () => thirdThursday(year, monthIndex),
    [year, monthIndex],
  );
  const isJulyRecess = monthIndex === 6;
  const meetingKey = isJulyRecess ? null : dateKey(meetingDate);
  const [selectedKey, setSelectedKey] = useState<string | null>(
    isJulyRecess ? dateKey(meetingDate) : meetingKey,
  );

  const cells = useMemo(
    () => buildMonthCells(year, monthIndex),
    [year, monthIndex],
  );

  const selectedIsMeeting = Boolean(meetingKey && selectedKey === meetingKey);
  const selectedIsJulyRecess =
    isJulyRecess && selectedKey === dateKey(meetingDate);

  function selectMonth(nextMonth: number) {
    let nextYear = year;
    let m = nextMonth;
    if (m < 0) {
      m = 11;
      nextYear -= 1;
    } else if (m > 11) {
      m = 0;
      nextYear += 1;
    }
    setYear(nextYear);
    setMonthIndex(m);
    const nextMeeting = thirdThursday(nextYear, m);
    setSelectedKey(dateKey(nextMeeting));
  }

  const monthLabel = `${MONTHS[monthIndex]} ${year}`;
  const meetingLabel = isJulyRecess
    ? "No meeting this month"
    : `Third Thursday · ${MONTHS[meetingDate.getMonth()]} ${meetingDate.getDate()}`;

  return (
    <>
      {/* Mobile: compact meeting card (no full grid) */}
      <div
        className={`overflow-hidden bg-white ring-1 ring-line md:hidden ${className}`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-line bg-soft px-4 py-3">
          <button
            type="button"
            onClick={() => selectMonth(monthIndex - 1)}
            className="display px-2 py-1.5 text-[10px] tracking-[0.14em] text-navy"
            aria-label="Previous month"
          >
            Prev
          </button>
          <p className="display text-sm tracking-[0.06em] text-navy">
            {monthLabel}
          </p>
          <button
            type="button"
            onClick={() => selectMonth(monthIndex + 1)}
            className="display px-2 py-1.5 text-[10px] tracking-[0.14em] text-navy"
            aria-label="Next month"
          >
            Next
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {MONTHS.map((month, index) => {
            const active = index === monthIndex;
            return (
              <button
                key={month}
                type="button"
                onClick={() => {
                  setMonthIndex(index);
                  setSelectedKey(dateKey(thirdThursday(year, index)));
                }}
                className={`display shrink-0 px-2.5 py-1.5 text-[10px] tracking-[0.12em] ${
                  active ? "bg-navy text-white" : "text-navy/50"
                }`}
              >
                {month.slice(0, 3)}
              </button>
            );
          })}
        </div>

        <div className="border-b border-line px-4 py-3">
          <p className="display text-[10px] tracking-[0.16em] text-accent">
            Monthly meeting
          </p>
          <p className="display mt-1 text-base text-navy">{meetingLabel}</p>
        </div>

        <div className="p-4">
          <MeetingDetails
            isJulyRecess={isJulyRecess}
            meetingDate={meetingDate}
            compact
          />
        </div>
      </div>

      {/* Desktop: full interactive calendar */}
      <div
        className={`hidden h-full flex-col overflow-hidden bg-white shadow-[0_1px_0_rgba(11,31,58,0.06)] ring-1 ring-line md:flex ${className}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line bg-soft px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => selectMonth(monthIndex - 1)}
              className="display px-3 py-2 text-xs tracking-[0.14em] text-navy transition hover:bg-white"
              aria-label="Previous month"
            >
              Prev
            </button>
            <p className="display text-lg tracking-[0.06em] text-navy md:text-xl">
              {monthLabel}
            </p>
            <button
              type="button"
              onClick={() => selectMonth(monthIndex + 1)}
              className="display px-3 py-2 text-xs tracking-[0.14em] text-navy transition hover:bg-white"
              aria-label="Next month"
            >
              Next
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setYear(today.getFullYear());
              setMonthIndex(today.getMonth());
              setSelectedKey(
                dateKey(thirdThursday(today.getFullYear(), today.getMonth())),
              );
            }}
            className="display text-xs tracking-[0.14em] text-accent underline decoration-accent underline-offset-4"
          >
            Today
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-line bg-soft/60 px-4 py-2">
          {MONTHS.map((month, index) => {
            const active = index === monthIndex;
            return (
              <button
                key={month}
                type="button"
                onClick={() => {
                  setMonthIndex(index);
                  setSelectedKey(dateKey(thirdThursday(year, index)));
                }}
                className={`display shrink-0 px-3 py-2 text-xs tracking-[0.12em] transition ${
                  active
                    ? "bg-navy text-white"
                    : "text-navy/50 hover:bg-white hover:text-navy"
                }`}
              >
                {month.slice(0, 3)}
              </button>
            );
          })}
        </div>

        <div className="grid min-h-0 flex-1 gap-0 md:grid-cols-[1.4fr_1fr]">
          <div className="bg-soft/40 p-5">
            <div className="mb-2 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="display py-2 text-center text-[10px] tracking-[0.12em] text-muted"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="min-h-16" />;
                }
                const key = dateKey(date);
                const isMeeting = Boolean(meetingKey && key === meetingKey);
                const isJulyMarker =
                  isJulyRecess && key === dateKey(meetingDate);
                const isSelected = key === selectedKey;
                const isToday = key === dateKey(today);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedKey(key)}
                    className={`min-h-16 border p-1.5 text-left transition ${
                      isSelected
                        ? "border-navy bg-navy text-white"
                        : isMeeting
                          ? "border-accent/40 bg-white text-navy hover:border-accent"
                          : isJulyMarker
                            ? "border-line bg-white text-navy hover:border-accent"
                            : "border-transparent bg-white text-navy hover:border-line"
                    }`}
                  >
                    <span
                      className={`display text-xs ${
                        isToday && !isSelected ? "text-accent" : ""
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {isMeeting ? (
                      <Image
                        src="/media/zoom-logo.png"
                        alt="Zoom meeting"
                        width={1024}
                        height={537}
                        className="mt-1 h-4 w-auto max-w-full rounded-[2px] object-contain"
                      />
                    ) : null}
                    {isJulyMarker ? (
                      <span
                        className={`mt-1 block text-[9px] font-semibold leading-tight tracking-wide ${
                          isSelected ? "text-white/80" : "text-accent"
                        }`}
                      >
                        No mtg
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-l border-line bg-white p-6">
            <p className="display text-xs tracking-[0.16em] text-accent">
              Event details
            </p>
            <div className="mt-4">
              {selectedIsMeeting || selectedIsJulyRecess || isJulyRecess ? (
                <MeetingDetails
                  isJulyRecess={isJulyRecess || selectedIsJulyRecess}
                  meetingDate={meetingDate}
                />
              ) : (
                <>
                  <h3 className="display text-xl leading-tight text-navy">
                    No event scheduled
                  </h3>
                  <p className="serif mt-3 text-base leading-relaxed text-muted">
                    Select the highlighted third Thursday to view NPU-G Zoom
                    meeting details for {MONTHS[monthIndex]}.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
