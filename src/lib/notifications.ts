import nodemailer from "nodemailer";
import { Resend } from "resend";
import type { IBooking as Booking } from "@/lib/models";

// Helper to escape HTML characters and prevent XSS/HTML Injection
function escapeHTML(str: string): string {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}

// ─── Check if Resend is configured (preferred for Vercel) ────────────────────
function isResendConfigured(): boolean {
  const key = process.env.RESEND_API_KEY || "";
  return key.startsWith("re_") && key.length > 10;
}

// ─── Check if Gmail SMTP is configured (fallback for local dev) ──────────────
function isSMTPConfigured(): boolean {
  const user = process.env.SMTP_USER || "";
  const rawPass = process.env.SMTP_PASS || "";
  const pass = rawPass.replace(/\s+/g, "");
  const PLACEHOLDERS = [
    "your_16_char_app_password_here",
    "xxxxxxxxxxxxxxxxxxxx",
    "xxxxxxxxxxxxxxxx",
    "your_app_password_here",
  ];
  const isPlaceholder = PLACEHOLDERS.includes(pass.toLowerCase());
  return !!(user && pass && pass.length >= 16 && !isPlaceholder);
}

// ─── Gmail SMTP Transporter (local dev fallback) ─────────────────────────────
function createSMTPTransporter() {
  const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER || "",
      pass,
    },
    tls: { rejectUnauthorized: false },
  });
}

// ─── Unified sendMail: Resend (Vercel) → SMTP (local) → console log ─────────
async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const fromName = "Shahira Mehandi";
  const fromAddress = process.env.RESEND_FROM || process.env.SMTP_FROM || "onboarding@resend.dev";
  const from = `${fromName} <${fromAddress}>`;

  // ── Option 1: Resend (works on Vercel) ──────────────────────────────────
  if (isResendConfigured()) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({ from, to, subject, html });
    if (result.error) {
      throw new Error(`Resend error: ${result.error.message}`);
    }
    console.log(`✅ [Resend] Email sent to ${to} | ID: ${result.data?.id}`);
    return;
  }

  // ── Option 2: Gmail SMTP (works locally) ────────────────────────────────
  if (isSMTPConfigured()) {
    const transporter = createSMTPTransporter();
    const info = await transporter.sendMail({ from, to, subject, html });
    console.log(`✅ [SMTP] Email sent to ${to} | ID: ${info.messageId}`);
    return;
  }

  // ── Option 3: Neither configured — log to console ───────────────────────
  console.log("=========================================");
  console.log("[EMAIL NOT SENT — NO EMAIL SERVICE CONFIGURED]");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log("Fix: Add RESEND_API_KEY to Vercel env vars → https://resend.com");
  console.log("=========================================");
}

// ─── 1. Customer Booking Confirmation Email ──────────────────────────────────
export async function sendEmailConfirmation(booking: Booking) {
  const cleanId = escapeHTML(booking.id || (booking as any)._id?.toString() || "");
  const cleanName = escapeHTML(booking.name || "");
  const cleanMobile = escapeHTML(booking.mobile || "");
  const cleanEmail = escapeHTML(booking.email || "");
  const cleanEventType = escapeHTML(booking.eventType || "");
  const cleanDate = escapeHTML(booking.date || "");
  const cleanTimeSlot = escapeHTML(booking.timeSlot || "");
  const cleanDesign = booking.packageOrGuest === "package"
    ? escapeHTML(booking.packageName || "")
    : `${escapeHTML(booking.designType || "")} Style – ${escapeHTML(booking.subDesignName || "")}`;
  const cleanAddress = escapeHTML(booking.address || "");
  const cleanPrice = String(booking.price);
  const cleanNotes = booking.additionalNotes ? escapeHTML(booking.additionalNotes) : "";
  const adminContact = process.env.ADMIN_EMAIL || "chennaimehendiart@gmail.com";

  try {
    await sendMail({
      to: cleanEmail,
      subject: `✅ Booking Received – Shahira Mehandi (ID: ${cleanId})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 2px solid #D4AF37; padding: 24px; border-radius: 16px; background-color: #FAF9F6;">
          <h2 style="color: #355E3B; font-family: Georgia, serif; text-align: center; border-bottom: 1px solid #D4AF37; padding-bottom: 12px; margin-top: 0;">
            ✨ Shahira Mehandi
          </h2>
          <p style="font-size: 14px; color: #1A2E22;">Dear <strong>${cleanName}</strong>,</p>
          <p style="font-size: 14px; color: #1A2E22; line-height: 1.6;">
            Thank you for choosing <strong>Shahira Mehandi</strong>! 🎉 Your booking request has been received successfully. Here is your appointment summary:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
            <tr style="background-color: #355E3B; color: #FFFDD0;">
              <th colspan="2" style="padding: 10px; text-align: left; border-radius: 4px 4px 0 0;">Appointment Details</th>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%; color: #355E3B;">Booking ID</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-family: monospace; font-weight: bold;">${cleanId}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Customer Name</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${cleanName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Mobile</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${cleanMobile}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Event Type</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${cleanEventType}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Event Date</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${cleanDate}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Time Slot</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${cleanTimeSlot}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Design Selected</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${cleanDesign}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Venue Address</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${cleanAddress}</td>
            </tr>
            <tr style="font-size: 15px; font-weight: bold; color: #355E3B; background-color: #F0F7F0;">
              <td style="padding: 12px; border-top: 2px dashed #D4AF37;">Estimated Price</td>
              <td style="padding: 12px; border-top: 2px dashed #D4AF37;">₹${cleanPrice}</td>
            </tr>
          </table>

          ${cleanNotes ? `<p style="font-size: 13px; color: #555; margin-top: -10px;"><strong>Notes:</strong> ${cleanNotes}</p>` : ""}

          <p style="font-size: 14px; color: #1A2E22; line-height: 1.6;">
            Our artist team will review your booking and contact you on WhatsApp at <strong>${cleanMobile}</strong> to confirm the appointment.
          </p>

          <div style="background-color: #FFF8E1; border-left: 4px solid #D4AF37; padding: 12px; margin: 16px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; font-size: 13px; color: #555;">
              💬 <strong>WhatsApp us directly:</strong> <a href="https://wa.me/919840792693" style="color: #25D366;">+91 98407 92693</a><br/>
              📧 <strong>Email:</strong> <a href="mailto:${adminContact}" style="color: #355E3B;">${adminContact}</a>
            </p>
          </div>

          <p style="font-size: 11px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 16px; margin-top: 24px; font-style: italic;">
            This is an automated booking confirmation. Please do not reply directly to this email.<br/>
            Shahira Mehandi | No:42/87, Angappan Naicke Street, George Town, Mannady, Chennai – 600001.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("❌ Customer confirmation email failed:", err);
  }
}

// ─── 2. Approval Email (sent when admin approves a booking) ─────────────────
export async function sendApprovalEmail(booking: Booking) {
  const cleanId = escapeHTML(booking.id || (booking as any)._id?.toString() || "");
  const cleanName = escapeHTML(booking.name || "");
  const cleanMobile = escapeHTML(booking.mobile || "");
  const cleanEmail = escapeHTML(booking.email || "");
  const cleanDate = escapeHTML(booking.date || "");
  const cleanTimeSlot = escapeHTML(booking.timeSlot || "");
  const cleanDesign = booking.packageOrGuest === "package"
    ? escapeHTML(booking.packageName || "")
    : `${escapeHTML(booking.designType || "")} – ${escapeHTML(booking.subDesignName || "")}`;
  const cleanAddress = escapeHTML(booking.address || "");
  const cleanPrice = String(booking.price);

  try {
    await sendMail({
      to: cleanEmail,
      subject: `🎉 Booking Approved – Shahira Mehandi (ID: ${cleanId})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 2px solid #D4AF37; padding: 24px; border-radius: 16px; background-color: #FAF9F6;">
          <h2 style="color: #355E3B; font-family: Georgia, serif; text-align: center; border-bottom: 1px solid #D4AF37; padding-bottom: 12px; margin-top: 0;">
            🎊 Booking Confirmed!
          </h2>
          <p style="font-size: 14px; color: #1A2E22;">Dear <strong>${cleanName}</strong>,</p>
          <p style="font-size: 14px; color: #1A2E22; line-height: 1.6;">
            Great news! Your booking has been <strong style="color: #355E3B;">approved</strong> by our admin team. We look forward to creating beautiful mehendi designs for your special occasion! ✨
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
            <tr style="background-color: #355E3B; color: #FFFDD0;">
              <th colspan="2" style="padding: 10px; text-align: left;">Confirmed Booking Details</th>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Booking ID</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-family: monospace;">${cleanId}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Date</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${cleanDate}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Time</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${cleanTimeSlot}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Design</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${cleanDesign}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Venue</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${cleanAddress}</td>
            </tr>
            <tr style="background-color: #F0F7F0;">
              <td style="padding: 12px; border-top: 2px dashed #D4AF37; font-weight: bold; color: #355E3B;">Amount</td>
              <td style="padding: 12px; border-top: 2px dashed #D4AF37; font-weight: bold; font-size: 15px;">₹${cleanPrice}</td>
            </tr>
          </table>
          <p style="font-size: 14px; color: #1A2E22; line-height: 1.6;">
            Please keep your phone available — our artist will reach you on WhatsApp at <strong>${cleanMobile}</strong> before the appointment for final coordination.
          </p>
          <p style="font-size: 11px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 16px; margin-top: 24px; font-style: italic;">
            Shahira Mehandi | +91 98407 92693 | No:42/87, Angappan Naicke Street, Chennai – 600001.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("❌ Approval email failed:", err);
  }
}

// ─── 3. Owner Notification on New Booking ───────────────────────────────────
export async function notifyOwnerOnBooking(booking: Booking) {
  const cleanId = escapeHTML(booking.id || (booking as any)._id?.toString() || "");
  const cleanName = escapeHTML(booking.name || "");
  const cleanMobile = escapeHTML(booking.mobile || "");
  const cleanEmail = escapeHTML(booking.email || "");
  const cleanDate = escapeHTML(booking.date || "");
  const cleanTimeSlot = escapeHTML(booking.timeSlot || "");
  const cleanDesign = booking.packageOrGuest === "package"
    ? escapeHTML(booking.packageName || "")
    : `${escapeHTML(booking.designType || "")} (${escapeHTML(booking.subDesignName || "")})`;
  const cleanAddress = escapeHTML(booking.address || "");
  const cleanPrice = String(booking.price);

  console.log("=========================================");
  console.log("[NEW BOOKING NOTIFICATION]");
  console.log(`ID: ${cleanId} | Customer: ${cleanName} | Date: ${cleanDate}`);
  console.log("=========================================");

  // Send admin notification email
  const adminEmail = process.env.ADMIN_EMAIL || "chennaimehendiart@gmail.com";
  try {
    await sendMail({
      to: adminEmail,
      subject: `📋 New Booking Alert – ${cleanName} (${cleanDate})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 2px solid #355E3B; padding: 20px; border-radius: 12px; background: #FAF9F6;">
          <h2 style="color: #355E3B; margin-top: 0;">🔔 New Booking Request</h2>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold; color: #355E3B; width: 35%;">Booking ID</td><td style="padding: 8px;">${cleanId}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold; color: #355E3B;">Customer</td><td style="padding: 8px;">${cleanName}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #355E3B;">Mobile</td><td style="padding: 8px;">${cleanMobile}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold; color: #355E3B;">Email</td><td style="padding: 8px;">${cleanEmail}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #355E3B;">Date</td><td style="padding: 8px;">${cleanDate} @ ${cleanTimeSlot}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold; color: #355E3B;">Design</td><td style="padding: 8px;">${cleanDesign}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #355E3B;">Venue</td><td style="padding: 8px;">${cleanAddress}</td></tr>
            <tr style="background: #FFF8E1;"><td style="padding: 8px; font-weight: bold; color: #355E3B;">Amount</td><td style="padding: 8px; font-weight: bold; font-size: 15px;">₹${cleanPrice}</td></tr>
          </table>
          <p style="margin-top: 16px; font-size: 13px; color: #555;">
            Log in to your <strong>Admin Dashboard</strong> to Accept or Reject this booking.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("❌ Admin notification email failed:", err);
  }
}
