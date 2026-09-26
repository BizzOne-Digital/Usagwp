import "server-only";

import { escapeHtml } from "@/lib/email/mailer";

/**
 * The two notification bodies. Plain text is built first and the HTML mirrors
 * it, so a client that refuses HTML still shows everything.
 */

const WRAPPER_OPEN =
  '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;' +
  'font-size:15px;line-height:1.6;color:#16203a;max-width:34rem">';
const WRAPPER_CLOSE = "</div>";

const LABEL = 'style="padding:6px 14px 6px 0;color:#5b6479;vertical-align:top;white-space:nowrap"';
const VALUE = 'style="padding:6px 0;color:#16203a"';

function rows(entries: [string, string][]): string {
  return entries
    .filter(([, value]) => value.trim().length > 0)
    .map(
      ([label, value]) =>
        `<tr><td ${LABEL}>${escapeHtml(label)}</td><td ${VALUE}>${escapeHtml(value)}</td></tr>`,
    )
    .join("");
}

function timestamp(): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date());
}

export type ContactSubmission = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export function contactNotification(submission: ContactSubmission) {
  const sentAt = timestamp();

  const fields: [string, string][] = [
    ["Name", submission.name],
    ["Email", submission.email],
    ["Phone", submission.phone],
    ["Subject", submission.subject],
    ["Received", `${sentAt} UTC`],
  ];

  const text = [
    "New contact form submission",
    "",
    ...fields.filter(([, v]) => v.trim()).map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    submission.message,
    "",
    "Sent from the contact form on the Edmond Kelly website.",
  ].join("\n");

  const html =
    WRAPPER_OPEN +
    '<h2 style="margin:0 0 16px;font-size:18px;font-weight:600">New contact form submission</h2>' +
    `<table style="border-collapse:collapse;margin-bottom:18px">${rows(fields)}</table>` +
    '<p style="margin:0 0 6px;color:#5b6479">Message</p>' +
    '<div style="white-space:pre-wrap;padding:14px;background:#f4f5f8;border-radius:4px">' +
    escapeHtml(submission.message) +
    "</div>" +
    '<p style="margin:18px 0 0;font-size:13px;color:#5b6479">' +
    "Sent from the contact form on the Edmond Kelly website. Reply to this email to answer " +
    escapeHtml(submission.name || "the sender") +
    " directly.</p>" +
    WRAPPER_CLOSE;

  return {
    subject: submission.subject
      ? `New Contact Form Submission: ${submission.subject}`
      : "New Contact Form Submission",
    text,
    html,
    replyTo: submission.email,
  };
}

export function subscriberNotification(subscriber: { email: string; firstName: string }) {
  const signedUpAt = timestamp();

  const fields: [string, string][] = [
    ["Subscriber email", subscriber.email],
    ["First name", subscriber.firstName],
    ["Signed up", `${signedUpAt} UTC`],
  ];

  const text = [
    "New story subscriber",
    "",
    "A new person has subscribed to be among the first to read his story.",
    "",
    ...fields.filter(([, v]) => v.trim()).map(([label, value]) => `${label}: ${value}`),
    "",
    "They have been added to the subscriber list in the admin dashboard.",
  ].join("\n");

  const html =
    WRAPPER_OPEN +
    '<h2 style="margin:0 0 16px;font-size:18px;font-weight:600">New story subscriber</h2>' +
    '<p style="margin:0 0 16px">A new person has subscribed to be among the first to read ' +
    "his story.</p>" +
    `<table style="border-collapse:collapse">${rows(fields)}</table>` +
    '<p style="margin:18px 0 0;font-size:13px;color:#5b6479">' +
    "They have been added to the subscriber list in the admin dashboard.</p>" +
    WRAPPER_CLOSE;

  return { subject: "New Story Subscriber", text, html, replyTo: subscriber.email };
}
