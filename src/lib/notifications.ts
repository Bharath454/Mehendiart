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
  const RESEND_PLACEHOLDERS = [
    "re_your_api_key_here",
    "re_placeholder",
    "re_xxxxxxxxxxxx",
  ];
  if (RESEND_PLACEHOLDERS.includes(key)) return false;
  return key.startsWith("re_") && key.length > 20;
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

  const resendOk = isResendConfigured();
  const smtpOk = isSMTPConfigured();
  console.log(`📧 [sendMail] to=${to} | Resend=${resendOk} | SMTP=${smtpOk}`);

  // ── Option 1: Resend (works on Vercel) ──────────────────────────────────
  if (resendOk) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({ from, to, subject, html });
    if (result.error) {
      throw new Error(`Resend error: ${result.error.message}`);
    }
    console.log(`✅ [Resend] Email sent to ${to} | ID: ${result.data?.id}`);
    return;
  }

  // ── Option 2: Gmail SMTP (works locally) ────────────────────────────────
  if (smtpOk) {
    console.log(`📤 [SMTP] Sending via ${process.env.SMTP_USER}...`);
    const transporter = createSMTPTransporter();
    const info = await transporter.sendMail({ from, to, subject, html });
    console.log(`✅ [SMTP] Email sent to ${to} | ID: ${info.messageId}`);
    return;
  }

  // ── Option 3: Neither configured — log to console ───────────────────────
  console.log("=========================================");
  console.log("❌ [EMAIL NOT SENT] No email service configured.");
  console.log(`   To: ${to} | Subject: ${subject}`);
  console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? "set but invalid/placeholder" : "not set"}`);
  console.log(`   SMTP_USER: ${process.env.SMTP_USER || "not set"}`);
  console.log(`   SMTP_PASS length: ${(process.env.SMTP_PASS || "").replace(/\s+/g,"").length}`);
  console.log("   Fix: Add real RESEND_API_KEY or valid Gmail App Password");
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
  // Public-facing business email shown to customers (read from env, never hardcoded)
  const adminContact = process.env.ADMIN_EMAIL || "";


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
  // Public-facing contact email shown in customer email body
  const businessEmail = process.env.ADMIN_EMAIL || "";

  try {
    await sendMail({
      to: cleanEmail,
      subject: `🎉 Booking Confirmed – Shahira Mehandi (ID: ${cleanId})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 2px solid #D4AF37; padding: 24px; border-radius: 16px; background-color: #FAF9F6;">
          <h2 style="color: #355E3B; font-family: Georgia, serif; text-align: center; border-bottom: 1px solid #D4AF37; padding-bottom: 12px; margin-top: 0;">
            🎊 Your Booking is Confirmed!
          </h2>
          <p style="font-size: 14px; color: #1A2E22;">Dear <strong>${cleanName}</strong>,</p>
          <p style="font-size: 14px; color: #1A2E22; line-height: 1.6;">
            Great news! 🎉 Your mehendi booking has been <strong style="color: #355E3B;">confirmed</strong> by our artist. We look forward to creating beautiful designs for your special occasion! ✨
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
            <tr style="background-color: #355E3B; color: #FFFDD0;">
              <th colspan="2" style="padding: 10px; text-align: left;">Confirmed Booking Details</th>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Booking ID</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-family: monospace;">${cleanId}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Date</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${cleanDate}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Time Slot</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${cleanTimeSlot}</td>
            </tr>
            <tr style="background: #f9f9f9;">
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
            Our artist will contact you on <strong>WhatsApp at ${cleanMobile}</strong> before the appointment for final coordination. Please keep your phone available!
          </p>

          <!-- WhatsApp CTA -->
          <div style="text-align: center; margin: 24px 0;">
            <a href="https://wa.me/919840792693?text=Hi%20Shahira%20Mehandi%2C%20my%20booking%20ID%20is%20${cleanId}" 
               style="display: inline-block; background-color: #25D366; color: #ffffff; font-weight: bold; font-size: 14px; padding: 14px 28px; border-radius: 50px; text-decoration: none; letter-spacing: 0.5px;">
              💬 Chat on WhatsApp
            </a>
          </div>

          <!-- Social / Contact Links -->
          <div style="background-color: #FFF8E1; border-left: 4px solid #D4AF37; padding: 14px 16px; margin: 16px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #355E3B;">📞 Contact &amp; Follow Us</p>
            <p style="margin: 4px 0; font-size: 12px; color: #555;">💬 <strong>WhatsApp:</strong> <a href="https://wa.me/919840792693" style="color: #25D366;">+91 98407 92693</a></p>
            <p style="margin: 4px 0; font-size: 12px; color: #555;">📧 <strong>Email:</strong> <a href="mailto:${businessEmail}" style="color: #355E3B;">${businessEmail}</a></p>
            <p style="margin: 4px 0; font-size: 12px; color: #555;">📸 <strong>Instagram:</strong> <a href="https://www.instagram.com/shahira_mehandi" style="color: #C13584;">@shahira_mehandi</a></p>
          </div>

          <p style="font-size: 11px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 16px; margin-top: 24px; font-style: italic;">
            Shahira Mehandi | +91 98407 92693 | No:42/87, Angappan Naicke Street, George Town, Mannady, Chennai – 600001.
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
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error("❌ [notifyOwnerOnBooking] ADMIN_EMAIL env var is not set. Admin notification skipped.");
    return;
  }
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
            <tr><td style="padding: 8px; font-weight: bold; color: #355E3B;">Mobile</td><td style="padding: 8px;"><a href="https://wa.me/91${cleanMobile}" style="color: #25D366; font-weight: bold;">${cleanMobile} (WhatsApp)</a></td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold; color: #355E3B;">Email</td><td style="padding: 8px;"><a href="mailto:${cleanEmail}" style="color: #355E3B;">${cleanEmail}</a></td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #355E3B;">Date</td><td style="padding: 8px;">${cleanDate} @ ${cleanTimeSlot}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold; color: #355E3B;">Design</td><td style="padding: 8px;">${cleanDesign}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #355E3B;">Venue</td><td style="padding: 8px;">${cleanAddress}</td></tr>
            <tr style="background: #FFF8E1;"><td style="padding: 8px; font-weight: bold; color: #355E3B;">Amount</td><td style="padding: 8px; font-weight: bold; font-size: 15px;">₹${cleanPrice}</td></tr>
          </table>
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://wa.me/91${cleanMobile}?text=Hi%20${encodeURIComponent(cleanName)}%2C%20this%20is%20Shahira%20Mehandi.%20Regarding%20your%20booking%20ID%20${cleanId}" 
               style="display: inline-block; background: #25D366; color: #fff; font-weight: bold; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-size: 13px; margin-right: 10px;">
              💬 WhatsApp Customer
            </a>
            <a href="mailto:${cleanEmail}?subject=Your%20Booking%20at%20Shahira%20Mehandi%20(ID:%20${cleanId})" 
               style="display: inline-block; background: #355E3B; color: #fff; font-weight: bold; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-size: 13px;">
              📧 Email Customer
            </a>
          </div>
          <p style="margin-top: 16px; font-size: 13px; color: #555; text-align: center;">
            Log in to your <strong>Admin Dashboard</strong> to Accept or Reject this booking.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("❌ Admin notification email failed:", err);
  }
}

// ─── 4. Rejection Email (sent when admin rejects a booking) ──────────────────
export async function sendRejectionEmail(booking: Booking) {
  const cleanId = escapeHTML(booking.id || (booking as any)._id?.toString() || "");
  const cleanName = escapeHTML(booking.name || "");
  const cleanEmail = escapeHTML(booking.email || "");
  const cleanDate = escapeHTML(booking.date || "");
  // Used in HTML body as public-facing contact info
  const businessEmail = process.env.ADMIN_EMAIL || "";

  try {
    await sendMail({
      to: cleanEmail,
      subject: `Booking Update – Shahira Mehandi (ID: ${cleanId})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 2px solid #D4AF37; padding: 24px; border-radius: 16px; background-color: #FAF9F6;">
          <h2 style="color: #355E3B; font-family: Georgia, serif; text-align: center; border-bottom: 1px solid #D4AF37; padding-bottom: 12px; margin-top: 0;">
            ✨ Shahira Mehandi
          </h2>
          <p style="font-size: 14px; color: #1A2E22;">Dear <strong>${cleanName}</strong>,</p>
          <p style="font-size: 14px; color: #1A2E22; line-height: 1.6;">
            Thank you so much for choosing Shahira Mehandi! Unfortunately, we are unable to confirm your booking request for <strong>${cleanDate}</strong> at this time.
          </p>
          <p style="font-size: 14px; color: #1A2E22; line-height: 1.6;">
            This could be due to artist unavailability or a scheduling conflict. We sincerely apologize for any inconvenience caused.
          </p>

          <div style="background-color: #FFF8E1; border-left: 4px solid #D4AF37; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #355E3B;">Would you like to reschedule? We'd love to help! 💚</p>
            <p style="margin: 4px 0; font-size: 12px; color: #555;">💬 <strong>WhatsApp us:</strong> <a href="https://wa.me/919840792693?text=Hi%2C%20I%20would%20like%20to%20reschedule%20my%20booking%20${cleanId}" style="color: #25D366;">+91 98407 92693</a></p>
            <p style="margin: 4px 0; font-size: 12px; color: #555;">📧 <strong>Email:</strong> <a href="mailto:${businessEmail}" style="color: #355E3B;">${businessEmail}</a></p>
            <p style="margin: 4px 0; font-size: 12px; color: #555;">📸 <strong>Instagram:</strong> <a href="https://www.instagram.com/shahira_mehandi" style="color: #C13584;">@shahira_mehandi</a></p>
          </div>

          <!-- WhatsApp CTA -->
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://wa.me/919840792693?text=Hi%20Shahira%20Mehandi%2C%20I'd%20like%20to%20reschedule%20my%20booking%20(ID:%20${cleanId})" 
               style="display: inline-block; background-color: #25D366; color: #ffffff; font-weight: bold; font-size: 14px; padding: 14px 28px; border-radius: 50px; text-decoration: none; letter-spacing: 0.5px;">
              💬 Chat &amp; Reschedule on WhatsApp
            </a>
          </div>

          <p style="font-size: 13px; color: #1A2E22; line-height: 1.6;">
            We hope to have the pleasure of creating beautiful henna designs for you soon. Thank you for your understanding! 🌿
          </p>
          <p style="font-size: 11px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 16px; margin-top: 24px; font-style: italic;">
            Booking Ref: ${cleanId} | Shahira Mehandi | No:42/87, Angappan Naicke Street, George Town, Mannady, Chennai – 600001.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("❌ Rejection email failed:", err);
  }
}

// ─── 5. Admin notification on new Contact Form Inquiry ───────────────────────
export async function notifyAdminOnInquiry(inquiry: {
  id?: string;
  _id?: any;
  name: string;
  email: string;
  mobile: string;
  message: string;
  createdAt?: Date;
}) {
  const cleanId = escapeHTML(inquiry.id || inquiry._id?.toString() || "");
  const cleanName = escapeHTML(inquiry.name || "");
  const cleanEmail = escapeHTML(inquiry.email || "");
  const cleanMobile = escapeHTML(inquiry.mobile || "");
  const cleanMessage = escapeHTML(inquiry.message || "");
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error("❌ [notifyAdminOnInquiry] ADMIN_EMAIL env var is not set. Admin notification skipped.");
    return;
  }

  try {
    await sendMail({
      to: adminEmail,
      subject: `📩 New Inquiry – ${cleanName} (Contact Form)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 2px solid #355E3B; padding: 20px; border-radius: 12px; background: #FAF9F6;">
          <h2 style="color: #355E3B; margin-top: 0;">📩 New Contact Form Inquiry</h2>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold; color: #355E3B; width: 30%;">Name</td><td style="padding: 8px;">${cleanName}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold; color: #355E3B;">Mobile</td><td style="padding: 8px;"><a href="https://wa.me/91${cleanMobile}" style="color: #25D366; font-weight: bold;">${cleanMobile} (WhatsApp)</a></td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #355E3B;">Email</td><td style="padding: 8px;"><a href="mailto:${cleanEmail}" style="color: #355E3B;">${cleanEmail}</a></td></tr>
            <tr style="background: #FFF8E1;"><td style="padding: 8px; font-weight: bold; color: #355E3B; vertical-align: top;">Message</td><td style="padding: 8px; line-height: 1.6;">${cleanMessage}</td></tr>
          </table>
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://wa.me/91${cleanMobile}?text=Hi%20${encodeURIComponent(cleanName)}%2C%20this%20is%20Shahira%20Mehandi.%20Thank%20you%20for%20reaching%20out!" 
               style="display: inline-block; background: #25D366; color: #fff; font-weight: bold; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-size: 13px; margin-right: 10px;">
              💬 Reply via WhatsApp
            </a>
            <a href="mailto:${cleanEmail}?subject=Re:%20Your%20Inquiry%20to%20Shahira%20Mehandi" 
               style="display: inline-block; background: #355E3B; color: #fff; font-weight: bold; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-size: 13px;">
              📧 Reply via Email
            </a>
          </div>
          <p style="margin-top: 16px; font-size: 12px; color: #999; text-align: center;">
            View all inquiries in your <strong>Admin Dashboard → Inquiries</strong> tab.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("❌ Admin inquiry notification email failed:", err);
  }
}
