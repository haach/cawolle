import nodemailer from "nodemailer";
import type { ContactMessage } from "@/services/contact";

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

function singleLine(value: string): string {
  return value
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function buildContactEmail(contact: ContactMessage, submittedAt: Date) {
  const subject = `Neue Nachricht von ${singleLine(contact.name)} on ${formatSubmittedAt(submittedAt)}`;
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
  const emailConfig = readEmailConfig();
  const email = buildContactEmail(contact, new Date());

  const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.port === 465,
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass,
    },
  });

  const info = await transporter.sendMail({
    from: emailConfig.fromEmail,
    to: emailConfig.toEmail,
    replyTo: contact.email,
    subject: email.subject,
    text: email.text,
  });

  if (!info.messageId) {
    throw new Error("Email was not sent.");
  }
}
