import { NextResponse } from "next/server";

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
  return (process.env.CONTACT_EMAIL || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
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
  recipients: string[],
  subject: string,
  text: string,
  replyTo: string,
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL || "NPU-G Atlanta <onboarding@resend.dev>";

  if (!apiKey || recipients.length === 0) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipients,
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
    const size = asString(body.size);
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
      item ? `Item: ${item}` : null,
      size ? `Size: ${size}` : null,
      type === "newsletter"
        ? "Request: Subscribe to monthly newsletter"
        : message
          ? `Message: ${message}`
          : "Message: (none)",
    ]
      .filter(Boolean)
      .join("\n");

    const sentResend = await sendWithResend(recipients, subject, text, email);
    if (sentResend) {
      return NextResponse.json({ ok: true, via: "resend", recipients: recipients.length });
    }

    // FormSubmit blocks Vercel IPs with Cloudflare. Let the browser deliver
    // one real message to each CONTACT_EMAIL recipient (not CC).
    return NextResponse.json({
      ok: false,
      fallback: "formsubmit",
      recipients,
      subject,
      fields: {
        name,
        email,
        neighborhood,
        item,
        size,
        message: message || "(none)",
        formType: type,
      },
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
