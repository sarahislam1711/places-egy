// Admin alerts: e-mail the team when something breaks, at most once per hour
// per kind of problem so a failure loop can't flood the inbox.
// Recipients: ALERT_EMAILS (comma separated) or the weekly-report addresses.
import { sendMail, escapeHtml } from "./mailer";

const RECIPIENTS = (process.env.ALERT_EMAILS ?? "admin@places-egy.com,mohamed.safwat@places-egy.com")
  .split(",").map((s) => s.trim()).filter(Boolean);
const THROTTLE_MS = 60 * 60 * 1000;
const lastSent = new Map<string, number>();

export async function sendAdminAlert(key: string, subject: string, detail: string): Promise<void> {
  if (process.env.NODE_ENV !== "production") return;
  const now = Date.now();
  if (now - (lastSent.get(key) ?? 0) < THROTTLE_MS) return;
  lastSent.set(key, now);
  try {
    for (const to of RECIPIENTS) {
      await sendMail({
        to,
        subject: `[PLACES alert] ${subject}`,
        html: `<p><strong>${escapeHtml(subject)}</strong></p><pre style="white-space:pre-wrap">${escapeHtml(detail.slice(0, 3000))}</pre><p style="color:#64748b">Sent by the site at ${new Date().toISOString()}. At most one e-mail per hour for this kind of problem.</p>`,
      });
    }
  } catch (e) {
    console.error("[alerts] could not send alert:", e);
  }
}

export function installProcessAlerts(): void {
  process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
    void sendAdminAlert("unhandledRejection", "Unhandled promise rejection", String((reason as any)?.stack ?? reason));
  });
  process.on("uncaughtException", (err) => {
    console.error("[uncaughtException]", err);
    void sendAdminAlert("uncaughtException", "Uncaught exception", String(err?.stack ?? err));
  });
}
