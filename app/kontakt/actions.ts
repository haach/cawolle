"use server";

import { contactFieldErrors, contactSchema, readContactForm } from "@/services/contact";
import type { ContactField, ContactFieldErrors } from "@/services/contact";
import { sanitizeContactMessage, sendContactEmail } from "@/services/email";
import { siteConfig } from "@/services/site";

export type ContactFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  name?: string;
  fieldErrors?: ContactFieldErrors;
  values?: Record<ContactField, string>;
};

export async function sendContactMessage(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const submitted = readContactForm(formData);
  const honeypot = formData.get("hp_field");

  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { status: "success", name: submitted.name.trim() };
  }

  const parsed = contactSchema.safeParse(submitted);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: contactFieldErrors(parsed.error),
      values: submitted,
    };
  }

  const sanitized = sanitizeContactMessage(parsed.data);
  if (!sanitized.ok) {
    return {
      status: "error",
      fieldErrors: sanitized.fieldErrors,
      values: submitted,
    };
  }

  try {
    await sendContactEmail(sanitized.value);
  } catch (error) {
    console.error("Contact form email failed", error);
    return {
      status: "error",
      message: `Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut oder schreiben Sie direkt an ${siteConfig.email}.`,
    };
  }

  return { status: "success", name: sanitized.value.name };
}
