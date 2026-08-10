import nodemailer from "nodemailer";
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

// ─── Reusable Gmail SMTP Transporter (App Password compatible) ──────────────
function createTransporter() {
  // Gmail App Passwords may be formatted with spaces (e.g. "xxxx xxxx xxxx xxxx")
  // Strip spaces so nodemailer sends the raw 16-char token
  const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER || "",
      pass, // 16-char Gmail App Password (spaces stripped)
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

const FROM_ADDRESS = `"Shahira Mehandi" <${process.env.SMTP_FROM || "no-reply@shahiramehandi.com"}>`;

// ─── Check if SMTP is configured ────────────────────────────────────────────
function isSMTPConfigured(): boolean {
  const user = process.env.SMTP_USER || "";
  const rawPass = process.env.SMTP_PASS || "";
  // Strip spaces — Gmail App Passwords are 16 chars but displayed with spaces
  const pass = rawPass.replace(/\s+/g, "");
  const PLACEHOLDERS = [
    "your_16_char_app_password_here",
    "xxxxxxxxxxxxxxxxxxxx",
    "xxxxxxxxxxxxxxxx",
  ];
  const isPlaceholder =
    rawPass.includes("xxxx") ||
    PLACEHOLDERS.includes(pass.toLowerCase());
  return !!(user && pass && pass.length >= 16 && !isPlaceholder);
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

  const mailOptions = {
    from: FROM_ADDRESS,
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
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
              ${cleanDesign}
            </td>
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
            📧 <strong>Email:</strong> <a href="mailto:${process.env.ADMIN_EMAIL || "info@shahiramehandi.com"}" style="color: #355E3B;">${process.env.ADMIN_EMAIL || "info@shahiramehandi.com"}</a>
          </p>
        </div>

        <p style="font-size: 11px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 16px; margin-top: 24px; font-style: italic;">
          This is an automated booking confirmation. Please do not reply directly to this email.<br/>
          Shahira Mehandi | No:42/87, Angappan Naicke Street, George Town, Mannady, Chennai – 600001.
        </p>
      </div>
    `,
  };

  if (!isSMTPConfigured()) {
    console.log("=========================================");
    console.log("[SMTP NOT CONFIGURED — MOCK EMAIL LOG]");
    console.log(`To: ${cleanEmail}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log(`Booking ID: ${cleanId} | Date: ${cleanDate} | Price: ₹${cleanPrice}`);
    console.log("Add SMTP_USER and SMTP_PASS to .env.local to send real emails.");
    console.log("=========================================");
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${booking.email}`);
  } catch (err) {
    console.error("❌ Email send failed:", err);
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

  const mailOptions = {
    from: FROM_ADDRESS,
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
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
              ${cleanDesign}
            </td>
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
  };

  if (!isSMTPConfigured()) {
    console.log("[SMTP NOT CONFIGURED] Would send approval email to:", cleanEmail);
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`✅ Approval email sent to ${booking.email}`);
  } catch (err) {
    console.error("❌ Approval email failed:", err);
  }
}

// ─── 3. Owner Notification on New Booking (console log for now) ──────────────
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

  const message = `*New Booking Request!*\n\n*ID:* ${cleanId}\n*Customer:* ${cleanName}\n*Mobile:* ${cleanMobile}\n*Date:* ${cleanDate}\n*Time:* ${cleanTimeSlot}\n*Selected:* ${cleanDesign}\n*Address:* ${cleanAddress}\n*Total:* ₹${cleanPrice}\n\n_Please log in to your admin panel to accept/reject this booking._`;

  console.log("=========================================");
  console.log("[NEW BOOKING NOTIFICATION]");
  console.log(message);
  console.log("Admin Panel: /admin/dashboard");
  console.log("=========================================");

  // Also send email notification to admin
  if (isSMTPConfigured()) {
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: FROM_ADDRESS,
        to: process.env.SMTP_USER || "info@shahiramehandi.com",
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
              Please log in to your <a href="/admin/dashboard" style="color: #355E3B; font-weight: bold;">Admin Dashboard</a> to Accept or Reject this booking.
            </p>
          </div>
        `,
      });
      console.log("✅ Admin notification email sent.");
    } catch (err) {
      console.error("❌ Admin notification email failed:", err);
    }
  }
}
