"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { meetingAgenda, zoomMeeting } from "@/lib/content";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const WEEKDAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"] as const;
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

  return (
    <div className={`flex h-full flex-col border border-line bg-soft ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-3 sm:gap-3 sm:px-4 sm:py-4 md:px-6">
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => selectMonth(monthIndex - 1)}
            className="display px-2 py-2 text-[10px] tracking-[0.14em] text-navy transition hover:bg-white sm:px-3 sm:text-xs"
            aria-label="Previous month"
          >
            Prev
          </button>
          <p className="display truncate text-base tracking-[0.06em] text-navy sm:text-lg md:text-xl">
            {MONTHS[monthIndex]} {year}
          </p>
          <button
            type="button"
            onClick={() => selectMonth(monthIndex + 1)}
            className="display px-2 py-2 text-[10px] tracking-[0.14em] text-navy transition hover:bg-white sm:px-3 sm:text-xs"
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
            setSelectedKey(dateKey(thirdThursday(today.getFullYear(), today.getMonth())));
          }}
          className="display text-[10px] tracking-[0.14em] text-accent underline decoration-accent underline-offset-4 sm:text-xs"
        >
          Today
        </button>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-line px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] md:px-4 [&::-webkit-scrollbar]:hidden">
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
              className={`display shrink-0 px-2.5 py-1.5 text-[10px] tracking-[0.12em] transition sm:px-3 sm:py-2 sm:text-[11px] md:text-xs ${
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
        <div className="p-2 sm:p-3 md:p-5">
          <div className="mb-1 grid grid-cols-7 gap-0.5 sm:mb-2 sm:gap-1">
            {WEEKDAYS.map((day, i) => (
              <div
                key={day}
                className="display py-1.5 text-center text-[9px] tracking-[0.08em] text-muted sm:py-2 sm:text-[10px] sm:tracking-[0.12em]"
              >
                <span className="sm:hidden">{WEEKDAYS_SHORT[i]}</span>
                <span className="hidden sm:inline">{day}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {cells.map((date, index) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-10 sm:min-h-14 md:min-h-16"
                  />
                );
              }
              const key = dateKey(date);
              const isMeeting = Boolean(meetingKey && key === meetingKey);
              const isJulyMarker = isJulyRecess && key === dateKey(meetingDate);
              const isSelected = key === selectedKey;
              const isToday = key === dateKey(today);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedKey(key)}
                  className={`min-h-10 border p-1 text-left transition sm:min-h-14 sm:p-1.5 md:min-h-16 ${
                    isSelected
                      ? "border-navy bg-navy text-white"
                      : isMeeting
                        ? "border-accent/50 bg-white text-navy hover:border-accent"
                        : isJulyMarker
                          ? "border-line bg-white text-navy hover:border-accent"
                          : "border-transparent bg-white/60 text-navy hover:border-line"
                  }`}
                >
                  <span
                    className={`display text-[10px] sm:text-xs ${
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
                      className="mt-0.5 h-2.5 w-auto max-w-full rounded-[2px] object-contain sm:mt-1 sm:h-3.5 md:h-4"
                    />
                  ) : null}
                  {isJulyMarker ? (
                    <span
                      className={`mt-0.5 block text-[7px] font-semibold leading-tight tracking-wide sm:mt-1 sm:text-[9px] ${
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

        <div className="border-t border-line bg-white p-4 sm:p-5 md:border-l md:border-t-0 md:p-6">
          <p className="display text-xs tracking-[0.16em] text-accent">
            Event details
          </p>
          {selectedIsMeeting ? (
            <div className="mt-3">
              <Image
                src="/media/zoom-logo.png"
                alt="Zoom"
                width={1024}
                height={537}
                className="mb-3 h-5 w-auto rounded-[3px] object-contain sm:h-6"
              />
              <h3 className="display text-lg text-navy sm:text-xl md:text-2xl">
                {zoomMeeting.title}
              </h3>
              <p className="serif mt-2 text-sm text-muted sm:mt-3 sm:text-base">
                {MONTHS[meetingDate.getMonth()]} {meetingDate.getDate()},{" "}
                {meetingDate.getFullYear()}
              </p>
              <p className="serif mt-1 text-sm text-muted sm:text-base">
                {zoomMeeting.time}
              </p>
              <ul className="serif mt-3 space-y-1 text-sm text-navy sm:mt-4 md:text-base">
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
              <p className="display mt-3 text-[11px] font-bold uppercase tracking-[0.04em] text-accent sm:mt-4 sm:text-sm sm:tracking-[0.06em] md:whitespace-nowrap md:text-base">
                {meetingAgenda.note}
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:flex-wrap sm:gap-3">
                <a
                  href={meetingAgenda.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full text-center text-navy hover:bg-navy hover:text-white sm:w-auto"
                >
                  {meetingAgenda.label}
                </a>
                <a
                  href={zoomMeeting.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cta w-full text-center sm:w-auto"
                >
                  Join on Zoom
                </a>
              </div>
            </div>
          ) : selectedIsJulyRecess || isJulyRecess ? (
            <div className="mt-3">
              <h3 className="display text-lg text-navy sm:text-xl md:text-2xl">
                No meeting in July
              </h3>
              <p className="serif mt-3 text-sm leading-relaxed text-muted sm:text-base">
                NPU-G does not meet in July. Monthly Zoom meetings resume in
                August on the third Thursday.
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <h3 className="display text-lg text-navy sm:text-xl">
                No event scheduled
              </h3>
              <p className="serif mt-3 text-sm leading-relaxed text-muted sm:text-base">
                Select the highlighted third Thursday to view NPU-G Zoom meeting
                details for {MONTHS[monthIndex]}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
