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
  sheetLogged?: boolean;
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

function isActivationMessage(message: string) {
  return /activat/i.test(message);
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

  // FormSubmit returns HTTP 200 with success:"false" when the inbox still needs activation.
  if (payload.success === false || payload.success === "false") {
    const message =
      payload.message ||
        `FormSubmit needs activation for ${config.to}. Check that inbox (and spam) for an "Activate Form" email, click the link, then try again.`;
    const error = new Error(message) as Error & { code?: string };
    error.code = isActivationMessage(message) ? "FORMSUBMIT_ACTIVATION" : "FORMSUBMIT_ERROR";
    throw error;
  }

  return true;
}

/** Prefer Resend via API; fall back to one FormSubmit send (1stchair To, others CC). */
export async function deliverSiteForm(payload: FormPayload) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: ApiResponse;
  try {
    data = (await response.json()) as ApiResponse;
  } catch {
    throw new Error("Unable to send your message. The server returned an invalid response.");
  }

  if (response.ok && data.ok) {
    return { via: data.via || "api", sheetLogged: Boolean(data.sheetLogged) };
  }

  if (data.fallback === "formsubmit" && data.to && data.subject && data.fields) {
    try {
      await deliverViaFormSubmit({
        to: data.to,
        cc: data.cc,
        subject: data.subject,
        fields: data.fields,
      });
      return { via: "formsubmit", sheetLogged: Boolean(data.sheetLogged) };
    } catch (error) {
      // Sheet archive is the durable record. If it saved, count the submission as received
      // even when FormSubmit is waiting on inbox activation.
      if (data.sheetLogged) {
        return {
          via: "sheet",
          sheetLogged: true,
          emailPending:
            error instanceof Error && isActivationMessage(error.message)
              ? "activation"
              : "failed",
        };
      }

      if (error instanceof Error && isActivationMessage(error.message)) {
        throw new Error(
          `Almost there: FormSubmit needs one-time activation for ${data.to}. Open that inbox (check Spam), click "Activate Form", then submit again.`,
        );
      }

      throw error instanceof Error
        ? error
        : new Error("Unable to send your message.");
    }
  }

  throw new Error(
    friendlyClientError(
      data.error ||
        `Unable to send your message.${data.sheetLogged === false ? " Google Sheet archive is not connected yet." : ""}`,
    ),
  );
}
