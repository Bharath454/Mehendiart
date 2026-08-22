// Quick SMTP Test Script
// Run: node scripts/test-email.mjs
import nodemailer from "nodemailer";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Manually load .env.local
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx).trim();
  const value = trimmed.slice(idx + 1).trim();
  env[key] = value;
}

const SMTP_USER = env.SMTP_USER || "";
const SMTP_PASS = (env.SMTP_PASS || "").replace(/\s+/g, "");
const SMTP_FROM = env.SMTP_FROM || SMTP_USER;
const ADMIN_EMAIL = env.ADMIN_EMAIL || "";

console.log("\n========================================");
console.log("  SMTP EMAIL TEST");
console.log("========================================");
console.log(`SMTP_USER   : ${SMTP_USER}`);
console.log(`SMTP_PASS   : ${SMTP_PASS ? `${"*".repeat(SMTP_PASS.length)} (${SMTP_PASS.length} chars)` : "NOT SET"}`);
console.log(`ADMIN_EMAIL : ${ADMIN_EMAIL}`);
console.log("========================================\n");

if (!SMTP_USER || !SMTP_PASS || SMTP_PASS.length < 16) {
  console.error("SMTP not properly configured. Check SMTP_USER and SMTP_PASS in .env.local");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  tls: { rejectUnauthorized: false },
});

console.log("Verifying SMTP connection...");
try {
  await transporter.verify();
  console.log("SMTP connection verified successfully!\n");
} catch (err) {
  console.error("SMTP connection FAILED:", err.message);
  console.error("\nFixes:");
  console.error("  1. Ensure 2-Step Verification is ON for", SMTP_USER);
  console.error("  2. Re-generate App Password: https://myaccount.google.com/apppasswords");
  process.exit(1);
}

// Test 1: Customer Confirmation Email
console.log("Sending TEST customer confirmation email...");
const customerResult = await transporter.sendMail({
  from: `"Shahira Mehandi" <${SMTP_FROM}>`,
  to: SMTP_USER,
  subject: "[TEST] Booking Received - Shahira Mehandi (ID: TEST-001)",
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:2px solid #D4AF37;padding:24px;border-radius:16px;background:#FAF9F6;">
      <h2 style="color:#355E3B;text-align:center;border-bottom:1px solid #D4AF37;padding-bottom:12px;margin-top:0;">Shahira Mehandi — TEST EMAIL</h2>
      <p>Dear <strong>Test Customer</strong>,</p>
      <p>This is a <strong>TEST email</strong> confirming the SMTP customer email flow is working.</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr style="background:#355E3B;color:#FFFDD0;"><th colspan="2" style="padding:10px;text-align:left;">Test Booking Details</th></tr>
        <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;color:#355E3B;">Booking ID</td><td style="padding:10px;border-bottom:1px solid #eee;font-family:monospace;">TEST-001</td></tr>
        <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;color:#355E3B;">Customer</td><td style="padding:10px;border-bottom:1px solid #eee;">Test Customer</td></tr>
        <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;color:#355E3B;">Event Date</td><td style="padding:10px;border-bottom:1px solid #eee;">22 Aug 2026</td></tr>
        <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;color:#355E3B;">Design</td><td style="padding:10px;border-bottom:1px solid #eee;">Arabic - Half Hand</td></tr>
        <tr style="background:#F0F7F0;"><td style="padding:12px;border-top:2px dashed #D4AF37;font-weight:bold;color:#355E3B;">Price</td><td style="padding:12px;border-top:2px dashed #D4AF37;font-weight:bold;">Rs.150</td></tr>
      </table>
      <p style="font-size:11px;color:#999;text-align:center;border-top:1px solid #eee;padding-top:16px;margin-top:24px;">TEST EMAIL — Shahira Mehandi | Chennai 600001</p>
    </div>
  `,
});
console.log("Customer email sent! ID:", customerResult.messageId);
console.log("  -> Delivered to:", SMTP_USER);

// Test 2: Admin Notification Email
console.log("\nSending TEST admin notification email...");
const adminResult = await transporter.sendMail({
  from: `"Shahira Mehandi" <${SMTP_FROM}>`,
  to: ADMIN_EMAIL,
  subject: "[TEST] New Booking Alert - Test Customer (22 Aug 2026)",
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:2px solid #355E3B;padding:20px;border-radius:12px;background:#FAF9F6;">
      <h2 style="color:#355E3B;margin-top:0;">[TEST] New Booking Request</h2>
      <p style="color:#555;font-size:13px;">This is a TEST email to verify admin notifications are working.</p>
      <table style="width:100%;font-size:13px;border-collapse:collapse;">
        <tr><td style="padding:8px;font-weight:bold;color:#355E3B;width:35%;">Booking ID</td><td style="padding:8px;">TEST-001</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;color:#355E3B;">Customer</td><td style="padding:8px;">Test Customer</td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#355E3B;">Mobile</td><td style="padding:8px;">+91 98400 00000</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;color:#355E3B;">Date</td><td style="padding:8px;">22 Aug 2026 @ 10:00 AM</td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#355E3B;">Design</td><td style="padding:8px;">Arabic - Half Hand</td></tr>
        <tr style="background:#FFF8E1;"><td style="padding:8px;font-weight:bold;color:#355E3B;">Amount</td><td style="padding:8px;font-weight:bold;font-size:15px;">Rs.150</td></tr>
      </table>
    </div>
  `,
});
console.log("Admin email sent! ID:", adminResult.messageId);
console.log("  -> Delivered to:", ADMIN_EMAIL);

console.log("\n========================================");
console.log("ALL TESTS PASSED!");
console.log("Check inboxes (and spam folder) for:");
console.log("  Customer test ->" , SMTP_USER);
console.log("  Admin test    ->", ADMIN_EMAIL);
console.log("========================================\n");
