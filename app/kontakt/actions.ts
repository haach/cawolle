"use server";

import { contactFieldErrors, contactSchema, readContactForm } from "@/services/contact";
import type { ContactFieldErrors } from "@/services/contact";
import { sendContactEmail } from "@/services/email";

export type ContactFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  name?: string;
  fieldErrors?: ContactFieldErrors;
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
    };
  }

  try {
    await sendContactEmail(parsed.data);
  } catch (error) {
    console.error("Contact form email failed", error);
    return {
      status: "error",
      message:
        "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut oder schreiben Sie direkt an info@cawolle.de.",
    };
  }

  return { status: "success", name: parsed.data.name };
}
