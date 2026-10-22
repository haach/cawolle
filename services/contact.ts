import { z } from "zod";

const maxLengthMessage = (max: number) => `Bitte verwenden Sie höchstens ${max} Zeichen.`;

function requiredText(message: string, max: number) {
  return z.string().trim().min(1, message).max(max, maxLengthMessage(max));
}

export const contactSchema = z.object({
  name: requiredText("Bitte geben Sie Ihren Namen ein.", 120),
  email: z
    .string()
    .trim()
    .min(1, "Bitte geben Sie Ihre E-Mail Adresse ein.")
    .max(254, maxLengthMessage(254))
    .pipe(z.email("Bitte geben Sie eine gültige E-Mail Adresse ein.")),
  phone: z
    .string()
    .trim()
    .min(1, "Bitte geben Sie eine Telefonnummer ein.")
    .transform((value) => value.replace(/[\s()./-]/g, ""))
    .pipe(
      z
        .string()
        .regex(/^\+?\d+$/, "Bitte geben Sie eine gültige Telefonnummer ein.")
        .max(20, maxLengthMessage(20)),
    ),
  subject: requiredText("Bitte geben Sie einen Betreff ein.", 200).regex(
    /^[\p{L}\p{M}\p{N}\p{Zs}]+$/u,
    "Bitte verwenden Sie im Betreff nur Buchstaben und Zahlen.",
  ),
  message: requiredText("Bitte geben Sie eine Nachricht ein.", 5000),
});

export type ContactMessage = z.infer<typeof contactSchema>;

export const contactFieldNames = ["name", "email", "phone", "subject", "message"] as const;

export type ContactField = (typeof contactFieldNames)[number];

export type ContactFieldErrors = Partial<Record<ContactField, string>>;

function isContactField(field: string): field is ContactField {
  return (contactFieldNames as readonly string[]).includes(field);
}

export function readContactForm(formData: FormData): Record<ContactField, string> {
  return {
    name: readFormValue(formData, "name"),
    email: readFormValue(formData, "email"),
    phone: readFormValue(formData, "phone"),
    subject: readFormValue(formData, "subject"),
    message: readFormValue(formData, "message"),
  };
}

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function contactFieldErrors(error: z.ZodError): ContactFieldErrors {
  const fieldErrors: ContactFieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field !== "string" || !isContactField(field) || fieldErrors[field]) {
      continue;
    }
    fieldErrors[field] = issue.message;
  }

  return fieldErrors;
}
