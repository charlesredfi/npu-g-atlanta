type FormPayload = {
  type: "contact" | "merch" | "newsletter";
  name: string;
  email: string;
  neighborhood?: string;
  item?: string;
  size?: string;
  message?: string;
};

type ApiResponse = {
  ok?: boolean;
  via?: string;
  error?: string;
  fallback?: "formsubmit";
  to?: string;
  cc?: string;
  subject?: string;
  fields?: Record<string, string>;
};

function friendlyClientError(detail: string) {
  if (
    detail.includes("<!DOCTYPE") ||
    detail.includes("Just a moment") ||
    detail.includes("cloudflare")
  ) {
    return "Email delivery is temporarily unavailable. Please try again shortly, or email chair@npugatlanta.org directly.";
  }
  return detail;
}

async function deliverViaFormSubmit(config: {
  to: string;
  cc?: string;
  subject: string;
  fields: Record<string, string>;
}) {
  const response = await fetch(
    `https://formsubmit.co/ajax/${encodeURIComponent(config.to)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...config.fields,
        _subject: config.subject,
        _template: "table",
        _captcha: "false",
        ...(config.cc ? { _cc: config.cc } : {}),
      }),
    },
  );

  const raw = await response.text();
  let payload: { success?: string | boolean; message?: string } = {};
  try {
    payload = JSON.parse(raw) as typeof payload;
  } catch {
    throw new Error(friendlyClientError(raw || "Form delivery failed."));
  }

  if (!response.ok) {
    throw new Error(
      friendlyClientError(payload.message || raw || "Form delivery failed."),
    );
  }

  return true;
}

/** Prefer Resend via API; fall back to browser FormSubmit (avoids Vercel→Cloudflare block). */
export async function deliverSiteForm(payload: FormPayload) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as ApiResponse;

  if (response.ok && data.ok) {
    return { via: data.via || "api" };
  }

  if (data.fallback === "formsubmit" && data.to && data.subject && data.fields) {
    await deliverViaFormSubmit({
      to: data.to,
      cc: data.cc,
      subject: data.subject,
      fields: data.fields,
    });
    return { via: "formsubmit" };
  }

  throw new Error(
    friendlyClientError(data.error || "Unable to send your message."),
  );
}
