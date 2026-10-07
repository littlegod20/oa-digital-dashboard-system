import { v } from "convex/values";
import { internalAction } from "./_generated/server";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function resetEmailHtml(name: string, url: string) {
  const safeName = escapeHtml(name);
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
                <p style="margin:0 0 8px;font-size:20px;font-weight:600;">Reset your password</p>
                <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475467;">
                  Hi ${safeName}, we received a request to reset the password for your OA Digital account.
                  This link expires in 1 hour.
                </p>
                <a href="${safeUrl}" style="display:inline-block;background:#1551b5;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:999px;">
                  Choose a new password
                </a>
                <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#8A94A6;">
                  If you didn't ask for this, you can ignore this email; your password won't change.<br />
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
 * Sends the password-reset email through Resend.
 * Requires RESEND_API_KEY and AUTH_EMAIL_FROM on the Convex deployment; until they are
 * set, the link is written to the Convex logs instead so an admin can pass it on.
 */
export const sendPasswordReset = internalAction({
  args: { to: v.string(), name: v.string(), url: v.string() },
  handler: async (_ctx, { to, name, url }) => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.AUTH_EMAIL_FROM;
    if (!apiKey || !from) {
      console.warn(`[password-reset] Email not configured (RESEND_API_KEY / AUTH_EMAIL_FROM). Link for ${to}: ${url}`);
      return;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Reset your OA Digital password",
        html: resetEmailHtml(name, url),
        text: `Hi ${name},\n\nReset your OA Digital password using this link (valid for 1 hour):\n${url}\n\nIf you didn't ask for this, ignore this email.`,
      }),
    });
    if (!res.ok) {
      // Throwing marks the action as failed in the Convex dashboard logs.
      throw new Error(`Resend rejected the reset email for ${to}: ${res.status} ${await res.text()}`);
    }
  },
});
