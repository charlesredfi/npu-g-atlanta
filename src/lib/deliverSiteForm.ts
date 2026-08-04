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
  recipients?: string[];
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

async function deliverViaFormSubmitTo(
  to: string,
  subject: string,
  fields: Record<string, string>,
) {
  const response = await fetch(
    `https://formsubmit.co/ajax/${encodeURIComponent(to)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...fields,
        _subject: subject,
        _template: "table",
        _captcha: "false",
      }),
    },
  );

  const raw = await response.text();
  let payload: { success?: string | boolean; message?: string } = {};
  try {
    payload = JSON.parse(raw) as typeof payload;
  } catch {
    throw new Error(friendlyClientError(raw || `Form delivery failed for ${to}.`));
  }

  if (!response.ok) {
    throw new Error(
      friendlyClientError(
        payload.message || raw || `Form delivery failed for ${to}.`,
      ),
    );
  }

  return true;
}

/** Prefer Resend via API; fall back to browser FormSubmit (one real send per recipient). */
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

  if (
    data.fallback === "formsubmit" &&
    data.recipients?.length &&
    data.subject &&
    data.fields
  ) {
    const results = await Promise.allSettled(
      data.recipients.map((to) =>
        deliverViaFormSubmitTo(to, data.subject!, data.fields!),
      ),
    );

    const failures = results.filter((result) => result.status === "rejected");
    if (failures.length === results.length) {
      const first = failures[0];
      throw new Error(
        first.status === "rejected"
          ? String(first.reason?.message || first.reason)
          : "Unable to send your message.",
      );
    }

    // Partial success still counts as delivered (some inboxes may need FormSubmit activation).
    return {
      via: "formsubmit",
      delivered: results.length - failures.length,
      attempted: results.length,
    };
  }

  throw new Error(
    friendlyClientError(data.error || "Unable to send your message."),
  );
}
