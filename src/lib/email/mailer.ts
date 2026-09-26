import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

/**
 * One SMTP configuration for every notification the site sends.
 *
 * `server-only` is the guard that matters: importing this from a Client
 * Component is a build error, so the credentials can never be bundled into
 * anything the browser downloads.
 *
 * Nothing here throws. A site with no SMTP configured, or a provider that is
 * refusing connections, must not take down the contact form or the sign-up
 * list, because both already persist their record to MongoDB before any mail
 * is attempted. Callers get a boolean and decide what it means for them.
 */

type Notification = {
  subject: string;
  text: string;
  html: string;
  /** Lets the owner hit reply and reach the person who wrote in. */
  replyTo?: string;
};

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  to: string;
};

function readConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password) return null;

  // 465 is implicit TLS; 587 and 25 start plain and upgrade with STARTTLS.
  const port = Number(process.env.SMTP_PORT) || 587;

  return {
    host,
    port,
    secure: port === 465,
    user,
    password,
    from: process.env.SMTP_FROM?.trim() || user,
    to: process.env.CONTACT_EMAIL?.trim() || user,
  };
}

export function isEmailConfigured(): boolean {
  return readConfig() !== null;
}

/** The address notifications are delivered to, for display in the admin. */
export function notificationRecipient(): string {
  return readConfig()?.to ?? "";
}

let transporter: Transporter | null = null;

function getTransporter(config: SmtpConfig): Transporter {
  transporter ??= nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    // On 587/25 the connection starts in the clear and upgrades. Without this
    // a server that fails to offer STARTTLS gets the password in plaintext,
    // because nodemailer would otherwise carry on unencrypted.
    requireTLS: !config.secure,
    auth: { user: config.user, pass: config.password },
  });
  return transporter;
}

/**
 * Sends one notification to the configured owner address.
 *
 * Returns whether it was delivered. Only the error *message* is logged, never
 * the error object or the transport options, so the password cannot reach the
 * logs by accident.
 */
export async function sendOwnerNotification(notification: Notification): Promise<boolean> {
  const config = readConfig();

  if (!config) {
    console.warn(
      `[usagwp] SMTP is not configured, so no email was sent for: ${notification.subject}`,
    );
    return false;
  }

  try {
    await getTransporter(config).sendMail({
      from: config.from,
      to: config.to,
      replyTo: notification.replyTo,
      subject: notification.subject,
      text: notification.text,
      html: notification.html,
    });
    return true;
  } catch (error) {
    console.error(
      `[usagwp] could not send "${notification.subject}":`,
      error instanceof Error ? error.message : "unknown transport error",
    );
    return false;
  }
}

/** Submitted values are untrusted text, never markup. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
