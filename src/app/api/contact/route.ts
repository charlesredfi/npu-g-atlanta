import { NextResponse } from "next/server";
import { appendToGoogleSheet } from "@/lib/googleSheet";

type Payload = {
  type?: "contact" | "merch" | "newsletter";
  name?: string;
  email?: string;
  neighborhood?: string;
  item?: string;
  size?: string;
  message?: string;
};

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getContactEmails() {
  const emails = (process.env.CONTACT_EMAIL || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  // Temporary primary: 1st Vice-Chair receives To; everyone else is CC.
  const preferred = "1stchair@npugatlanta.org";
  const preferredMatch = emails.find(
    (email) => email.toLowerCase() === preferred.toLowerCase(),
  );
  if (!preferredMatch) return emails;

  return [
    preferredMatch,
    ...emails.filter(
      (email) => email.toLowerCase() !== preferred.toLowerCase(),
    ),
  ];
}

function friendlyError(detail: string) {
  if (detail.includes("<!DOCTYPE") || detail.includes("Just a moment")) {
    return "Email delivery is temporarily unavailable. Please try again shortly, or email chair@npugatlanta.org directly.";
  }
  return detail.length > 180
    ? "Unable to deliver this submission. Please try again or email chair@npugatlanta.org."
    : detail;
}

async function sendWithResend(
  to: string,
  cc: string[],
  subject: string,
  text: string,
  replyTo: string,
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL || "NPU-G Atlanta <onboarding@resend.dev>";

  if (!apiKey || !to) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      ...(cc.length ? { cc } : {}),
      reply_to: replyTo,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(friendlyError(`Resend failed: ${detail}`));
  }

  return true;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;
    const type =
      body.type === "merch" || body.type === "newsletter"
        ? body.type
        : "contact";
    const name = asString(body.name);
    const email = asString(body.email);
    const message = asString(body.message);
    const neighborhood = asString(body.neighborhood);
    const item = asString(body.item);
    const recipients = getContactEmails();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 },
      );
    }

    if (type === "contact" && !message) {
      return NextResponse.json(
        { error: "Please include a message." },
        { status: 400 },
      );
    }

    if (type === "newsletter" && !neighborhood) {
      return NextResponse.json(
        { error: "Please select a neighborhood." },
        { status: 400 },
      );
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        {
          error:
            "Form delivery is not configured yet. Add CONTACT_EMAIL to your environment.",
        },
        { status: 503 },
      );
    }

    const [to, ...cc] = recipients;

    const subject =
      type === "merch"
        ? `NPU-G Merch Waitlist: ${item || "Interest"}`
        : type === "newsletter"
          ? `NPU-G Newsletter Signup: ${name}`
          : `NPU-G Contact from ${name}`;

    const text = [
      `Type: ${type}`,
      `Name: ${name}`,
      `Email: ${email}`,
      neighborhood ? `Neighborhood: ${neighborhood}` : null,
      type === "newsletter"
        ? "Request: Subscribe to monthly newsletter"
        : message
          ? `Message: ${message}`
          : "Message: (none)",
    ]
      .filter(Boolean)
      .join("\n");

    // Keep the FormSubmit table lean: no empty/unused columns like item/size.
    const fields: Record<string, string> = {
      name,
      email,
      formType: type,
    };
    if (neighborhood) fields.neighborhood = neighborhood;
    if (type === "newsletter") {
      fields.request = "Subscribe to monthly newsletter";
    } else {
      fields.message = message || "(none)";
    }

    // Archive every valid submission in the shared Google Sheet first.
    let sheetLogged = false;
    try {
      const sheetResult = await appendToGoogleSheet({
        formType: type,
        name,
        email,
        neighborhood,
        message: type === "newsletter" ? undefined : message || "(none)",
        request:
          type === "newsletter" ? "Subscribe to monthly newsletter" : undefined,
      });
      sheetLogged = sheetResult.ok;
      if (sheetResult.skipped) {
        console.warn(
          "GOOGLE_SHEETS_WEBHOOK_URL is not set; submission was not archived to the sheet.",
        );
      }
    } catch (sheetError) {
      console.error("Google Sheet archive failed:", sheetError);
      // Keep email delivery working even if the sheet webhook is misconfigured.
    }

    const sentResend = await sendWithResend(to, cc, subject, text, email);
    if (sentResend) {
      return NextResponse.json({
        ok: true,
        via: "resend",
        sheetLogged,
        recipients: recipients.length,
      });
    }

    // FormSubmit blocks Vercel IPs with Cloudflare. Browser sends one email:
    // 1stchair as To, remaining CONTACT_EMAIL addresses as CC.
    return NextResponse.json({
      ok: false,
      fallback: "formsubmit",
      to,
      cc: cc.join(","),
      subject,
      fields,
      sheetLogged,
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      {
        error: friendlyError(
          error instanceof Error
            ? error.message
            : "Unable to deliver this submission.",
        ),
      },
      { status: 500 },
    );
  }
}
