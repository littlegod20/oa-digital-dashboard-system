import { v } from "convex/values";
import { internalAction } from "./_generated/server";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Branded email shell: a dark header, a heading, a paragraph and one call-to-action button. */
function layout({ heading, intro, button, url, footnote }: { heading: string; intro: string; button: string; url: string; footnote: string }) {
  const safeUrl = escapeHtml(url);
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#EDF0F6;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0E1525;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="background:#0B1F3B;background-image:linear-gradient(160deg,#13203A,#0B1222);padding:28px 32px;">
                <p style="margin:0;font-size:18px;font-weight:600;color:#F3F6FB;">OA Digital</p>
                <p style="margin:4px 0 0;font-size:12px;color:#9FB0C8;">Command Center</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 8px;font-size:20px;font-weight:600;">${escapeHtml(heading)}</p>
                <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475467;">${intro}</p>
                <a href="${safeUrl}" style="display:inline-block;background:#1551b5;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:999px;">
                  ${escapeHtml(button)}
                </a>
                <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#8A94A6;">
                  ${footnote}<br />
                  Button not working? Paste this link into your browser:<br />
                  <span style="color:#1551b5;word-break:break-all;">${safeUrl}</span>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Sends through Resend. Needs RESEND_API_KEY and AUTH_EMAIL_FROM on the deployment;
 * until they are set, the message (with its link) goes to the Convex logs instead.
 */
async function send(to: string, subject: string, html: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn(`[email] Not configured (RESEND_API_KEY / AUTH_EMAIL_FROM). To ${to}: ${subject}\n${text}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });
  if (!res.ok) {
    // Throwing marks the action as failed in the Convex dashboard logs.
    throw new Error(`Resend rejected "${subject}" for ${to}: ${res.status} ${await res.text()}`);
  }
}

export const sendPasswordReset = internalAction({
  args: { to: v.string(), name: v.string(), url: v.string() },
  handler: async (_ctx, { to, name, url }) => {
    await send(
      to,
      "Reset your OA Digital password",
      layout({
        heading: "Reset your password",
        intro: `Hi ${escapeHtml(name)}, we received a request to reset the password for your OA Digital account. This link expires in 1 hour.`,
        button: "Choose a new password",
        url,
        footnote: "If you didn't ask for this, you can ignore this email; your password won't change.",
      }),
      `Hi ${name},\n\nReset your OA Digital password using this link (valid for 1 hour):\n${url}\n\nIf you didn't ask for this, ignore this email.`,
    );
  },
});

export const sendInvite = internalAction({
  args: { to: v.string(), name: v.string(), inviterName: v.string(), url: v.string() },
  handler: async (_ctx, { to, name, inviterName, url }) => {
    await send(
      to,
      "You're invited to the OA Digital Command Center",
      layout({
        heading: `Welcome aboard, ${name.split(" ")[0]}`,
        intro: `${escapeHtml(inviterName)} has set up your OA Digital account. Choose a password to sign in to the Command Center. This link works once and expires in 7 days.`,
        button: "Set your password",
        url,
        footnote: "Weren't expecting this? You can ignore this email.",
      }),
      `Hi ${name},\n\n${inviterName} has set up your OA Digital account. Set your password here (valid for 7 days, works once):\n${url}`,
    );
  },
});
