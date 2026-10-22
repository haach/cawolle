import nodemailer from "nodemailer";
import sanitizeHtml from "sanitize-html";

import {
  contactFieldErrors,
  contactSchema,
  type ContactFieldErrors,
  type ContactMessage,
} from "@/services/contact";

type EmailConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromEmail: string;
  toEmail: string;
};

function readEmailConfig(): EmailConfig {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.EMAIL_FROM;
  const toEmail = process.env.EMAIL_TO;

  if (!host || !port || !user || !pass || !fromEmail || !toEmail) {
    throw new Error("SMTP is not configured.");
  }

  const parsedPort = Number(port);
  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    throw new Error("SMTP port is invalid.");
  }

  return {
    host,
    port: parsedPort,
    user,
    pass,
    fromEmail,
    toEmail,
  };
}

function formatSubmittedAt(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${value("year")}/${value("month")}/${value("day")} - ${value("hour")}:${value("minute")} ${value("dayPeriod")}`;
}

// Removed before sanitize-html runs. A hidden character inside a tag keeps the
// parser from seeing it, and decoding the escaped result would rebuild the tag.
// Joiners used by emoji stay in place.
const HIDDEN_CHARS =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u00AD\u061C\u180E\u200B\u200E\u200F\u202A-\u202E\u2060-\u206F\uFEFF\uFFF9-\uFFFB\u{E0000}-\u{E007F}]/gu;
const LINE_BREAKS = /[\r\n\u2028\u2029]+/g;

const plainTextOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: "discard" as const,
  enforceHtmlBoundary: false,
};

function characterFromCode(code: number): string {
  if (!Number.isInteger(code) || code < 0 || code > 0x10ffff) return "";
  if (code >= 0xd800 && code <= 0xdfff) return "";
  return String.fromCodePoint(code);
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, digits: string) => characterFromCode(Number(digits)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => characterFromCode(Number.parseInt(hex, 16)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function stripHidden(value: string): string {
  return value.replace(HIDDEN_CHARS, "");
}

function stripMarkup(value: string): string {
  let current = stripHidden(value);

  for (let pass = 0; pass < 3; pass += 1) {
    const decoded = stripHidden(decodeHtmlEntities(current));
    const stripped = sanitizeHtml(decoded, plainTextOptions);
    const plain = stripHidden(decodeHtmlEntities(stripped));

    if (sanitizeHtml(plain, plainTextOptions) === stripped) return plain;

    current = stripped;
  }

  return current;
}

function normalizeText(value: string): string {
  return value.normalize("NFKC").replace(/\p{Zs}/gu, " ");
}

function sanitizeHeader(value: string, maxLength: number): string {
  return stripMarkup(normalizeText(value))
    .replace(LINE_BREAKS, " ")
    .replace(HIDDEN_CHARS, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function sanitizeBody(value: string, maxLength: number): string {
  return stripMarkup(normalizeText(value))
    .replace(/\r\n?/g, "\n")
    .replace(/[\u2028\u2029]/g, "\n")
    .replace(HIDDEN_CHARS, "")
    .replace(/[^\S\n]+/g, " ")
    .replace(/ *\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

function sanitizeMailbox(value: string): string {
  return normalizeText(value)
    .replace(HIDDEN_CHARS, "")
    .replace(LINE_BREAKS, "")
    .replace(/\s+/g, "")
    .trim()
    .slice(0, 254);
}

function sanitizePhone(value: string): string {
  return normalizeText(value).replace(/[^\d+]/g, "");
}

export type SanitizedContact =
  { ok: true; value: ContactMessage } | { ok: false; fieldErrors: ContactFieldErrors };

export function sanitizeContactMessage(contact: ContactMessage): SanitizedContact {
  const parsed = contactSchema.safeParse({
    name: sanitizeHeader(contact.name, 120),
    email: sanitizeMailbox(contact.email),
    phone: sanitizePhone(contact.phone),
    subject: sanitizeHeader(contact.subject, 200),
    message: sanitizeBody(contact.message, 5000),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: contactFieldErrors(parsed.error) };
  }

  return { ok: true, value: parsed.data };
}

function buildContactEmail(contact: ContactMessage, submittedAt: Date) {
  const subject = sanitizeHeader(
    `Neue Nachricht von ${contact.name} on ${formatSubmittedAt(submittedAt)}`,
    240,
  );
  const text = [
    `${contact.name} hat dir eine Nachricht über das Kontaktformular gesendet.`,
    "",
    `Nachricht: ${contact.message}`,
    "",
    `Email: ${contact.email}`,
    "",
    `Betreff: ${contact.subject}`,
    "",
    `Telefonnummer: ${contact.phone}`,
  ].join("\n");

  return { subject, text };
}

export async function sendContactEmail(contact: ContactMessage): Promise<void> {
  const sanitized = sanitizeContactMessage(contact);
  if (!sanitized.ok) {
    throw new Error("Contact message failed sanitization.");
  }

  const emailConfig = readEmailConfig();
  const safe = sanitized.value;
  const email = buildContactEmail(safe, new Date());

  const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.port === 465,
    disableFileAccess: true,
    disableUrlAccess: true,
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass,
    },
  });

  const info = await transporter.sendMail({
    from: emailConfig.fromEmail,
    to: emailConfig.toEmail,
    replyTo: safe.email,
    subject: email.subject,
    text: email.text,
    disableFileAccess: true,
    disableUrlAccess: true,
  });

  if (!info.messageId) {
    throw new Error("Email was not sent.");
  }
}
