import emailjs from "@emailjs/browser";

const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "";
const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "";
const ownerTemplate = process.env.NEXT_PUBLIC_EMAILJS_OWNER_TEMPLATE || "";
const customerTemplate = process.env.NEXT_PUBLIC_EMAILJS_CUSTOMER_TEMPLATE || "";

export const emailConfigured = Boolean(publicKey && serviceId && ownerTemplate && customerTemplate);

type Result = { ok: boolean; error?: string };

async function send(template: string, params: Record<string, string>): Promise<Result> {
  if (!emailConfigured) {
    console.log("[email:not-configured]", params);
    return { ok: false, error: "Email isn't set up yet (EmailJS keys missing)." };
  }
  try {
    await emailjs.send(serviceId, template, params, { publicKey });
    return { ok: true };
  } catch (e) {
    const err = e as { text?: string; message?: string };
    console.error("[email]", e);
    return { ok: false, error: err.text || err.message || "Email failed." };
  }
}

/** New-request alert. The owner template's "To" is fixed in EmailJS. */
export function notifyOwner(subject: string, message: string) {
  return send(ownerTemplate, { subject, message });
}

/** Invoice / newsletter email to a customer. */
export function emailCustomer(to: string, toName: string, subject: string, message: string) {
  return send(customerTemplate, { to_email: to, to_name: toName, subject, message });
}
