import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "npug_uv";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2; // 2 years

type VisitResponse = {
  ok?: boolean;
  visitors?: number;
  version?: string;
  error?: string;
};

async function readVisitorCount(increment: boolean) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return { visitors: 0, configured: false as const };
  }

  const separator = webhookUrl.includes("?") ? "&" : "?";
  const url = `${webhookUrl}${separator}action=visit&increment=${
    increment ? "1" : "0"
  }`;

  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    cache: "no-store",
  });
  const raw = await response.text();

  let parsed: VisitResponse = {};
  try {
    parsed = JSON.parse(raw) as VisitResponse;
  } catch {
    throw new Error("Visitor counter webhook did not return JSON.");
  }

  if (!parsed.ok || typeof parsed.visitors !== "number") {
    throw new Error(
      parsed.error ||
        "Visitor counter is unavailable. Redeploy Apps Script with physical-tabs-v4.",
    );
  }

  return { visitors: parsed.visitors, configured: true as const };
}

export async function GET() {
  try {
    const jar = await cookies();
    const seen = Boolean(jar.get(COOKIE_NAME)?.value);
    const increment = !seen;
    const result = await readVisitorCount(increment);

    const response = NextResponse.json({
      ok: true,
      visitors: result.visitors,
      counted: increment && result.configured,
    });

    if (increment && result.configured) {
      response.cookies.set(COOKIE_NAME, "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Visitor counter error:", error);
    return NextResponse.json(
      {
        ok: false,
        visitors: null,
        error: error instanceof Error ? error.message : "Counter unavailable",
      },
      { status: 200 },
    );
  }
}
