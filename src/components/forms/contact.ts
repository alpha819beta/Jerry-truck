import { isEmail, str, toE164 } from "@/lib/format";
import { subscribe } from "@/lib/api";

export function contactFields(form: FormData) {
  const name = str(form, "name");
  const phone = str(form, "phone");
  const email = str(form, "email");
  const errors: Record<string, string> = {};
  if (!name) errors.name = "Please enter your name.";
  if (!toE164(phone)) errors.phone = "Please enter a valid 10-digit phone number.";
  if (email && !isEmail(email)) errors.email = "That email doesn't look right.";
  return { name, phone, email, errors };
}

export async function maybeSubscribe(form: FormData, email: string, name: string) {
  if (!email || form.get("subscribe") !== "on") return;
  try {
    await subscribe(email, name);
  } catch (e) {
    console.error("[subscribe]", e);
  }
}
