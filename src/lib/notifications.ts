import nodemailer from "nodemailer";
import type { Booking } from "@/lib/db";

export async function sendEmailConfirmation(booking: Booking) {
  // Transporter setup
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email", // Sandbox fallback
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  });

  const mailOptions = {
    from: `"Chennai Mehendi Art" <${process.env.SMTP_FROM || "shahirabanu1706@gmail.com"}>`,
    to: booking.email,
    subject: `Booking Request Received - Chennai Mehendi Art (ID: ${booking.id})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 2px solid #D4AF37; padding: 24px; border-radius: 16px; background-color: #FAF9F6;">
        <h2 style="color: #355E3B; font-family: Georgia, serif; text-align: center; border-bottom: 1px solid #D4AF37; padding-bottom: 12px; margin-top: 0;">
          Chennai Mehendi Art
        </h2>
        <p style="font-size: 14px; color: #1A2E22;">Dear <strong>${booking.name}</strong>,</p>
        <p style="font-size: 14px; color: #1A2E22; line-height: 1.5;">
          Thank you for choosing Chennai Mehendi Art! We have successfully received your booking request for your upcoming event. Below is your appointment summary:
        </p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; border: 1px solid #D4AF37/20;">
          <tr style="background-color: #355E3B; color: #FFFDD0; font-family: Georgia, serif;">
            <th colspan="2" style="padding: 10px; text-align: left; border-radius: 4px 4px 0 0;">Appointment Coordinates</th>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%; color: #355E3B;">Booking ID</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-family: monospace; font-weight: bold;">${booking.id}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Event Date</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.date}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Time Slot</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.timeSlot}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Design Description</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
              ${booking.packageOrGuest === "package" ? booking.packageName : `${booking.designType} Style - ${booking.subDesignName}`}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Venue Address</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.address}</td>
          </tr>
          <tr style="font-size: 15px; font-weight: bold; color: #355E3B;">
            <td style="padding: 10px; border-top: 1px dashed #D4AF37;">Estimate Pricing</td>
            <td style="padding: 10px; border-top: 1px dashed #D4AF37;">₹${booking.price}</td>
          </tr>
        </table>
        
        <p style="font-size: 14px; color: #1A2E22; line-height: 1.5;">
          Our artist team is currently reviewing your schedule. We will reach out on WhatsApp at <strong>${booking.mobile}</strong> to align on designer dispatch and final location maps.
        </p>
        
        <p style="font-size: 11px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 16px; margin-top: 24px; font-style: italic;">
          This is an automated booking confirmation email. Please do not reply directly to this mail.<br/>
          Chennai Mehendi Art | No:42/87, Angappan Naicke Street, George Town, Mannady, Chennai - 600001.
        </p>
      </div>
    `,
  };

  // Safe fallback if SMTP auth is missing in env
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("=========================================");
    console.log("[SMTP NOTIFICATION MOCK]");
    console.log(`Recipient Email: ${mailOptions.to}`);
    console.log(`Email Subject: ${mailOptions.subject}`);
    console.log("Email Body Summary:");
    console.log(`Booking ID: ${booking.id}, Date: ${booking.date}, Price: ₹${booking.price}`);
    console.log("=========================================");
    return;
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Nodemailer confirmation sent successfully to ${booking.email}`);
  } catch (err) {
    console.error("Nodemailer Email Error:", err);
  }
}

export async function sendApprovalEmail(booking: Booking) {
  const approvalRecipient = process.env.TEST_MAIL || booking.email;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  });

  const mailOptions = {
    from: `"Chennai Mehendi Art" <${process.env.SMTP_FROM || "shahirabanu1706@gmail.com"}>`,
    to: approvalRecipient,
    subject: `Your booking is approved - Chennai Mehendi Art (ID: ${booking.id})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 2px solid #D4AF37; padding: 24px; border-radius: 16px; background-color: #FAF9F6;">
        <h2 style="color: #355E3B; font-family: Georgia, serif; text-align: center; border-bottom: 1px solid #D4AF37; padding-bottom: 12px; margin-top: 0;">
          Booking Approved
        </h2>
        <p style="font-size: 14px; color: #1A2E22;">Dear <strong>${booking.name}</strong>,</p>
        <p style="font-size: 14px; color: #1A2E22; line-height: 1.5;">
          Your booking request has been approved by our admin team. We look forward to serving you for your upcoming event.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; border: 1px solid #D4AF37/20;">
          <tr style="background-color: #355E3B; color: #FFFDD0; font-family: Georgia, serif;">
            <th colspan="2" style="padding: 10px; text-align: left; border-radius: 4px 4px 0 0;">Approved Booking Details</th>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%; color: #355E3B;">Booking ID</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-family: monospace; font-weight: bold;">${booking.id}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Event Date</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.date}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #355E3B;">Time Slot</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.timeSlot}</td>
          </tr>
        </table>
        <p style="font-size: 14px; color: #1A2E22; line-height: 1.5;">
          Please keep your phone available for any follow-up communication.
        </p>
      </div>
    `,
  };

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("[SMTP APPROVAL MOCK]");
    console.log(`Would send approval email to: ${mailOptions.to}`);
    return;
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent successfully to ${approvalRecipient}`);
  } catch (err) {
    console.error("Approval Email Error:", err);
  }
}

export async function notifyOwnerOnBooking(booking: Booking) {
  // Owner notification details
  const message = `*New Booking Request!*\n\n*ID:* ${booking.id}\n*Customer:* ${booking.name}\n*Mobile:* ${booking.mobile}\n*Date:* ${booking.date}\n*Time:* ${booking.timeSlot}\n*Selected:* ${
    booking.packageOrGuest === "package" ? booking.packageName : `${booking.designType} (${booking.subDesignName})`
  }\n*Address:* ${booking.address}\n*Total:* ₹${booking.price}\n\n_Please log in to your admin panel to accept/reject this booking._`;

  console.log("=========================================");
  console.log("[WHATSAPP NOTIFICATION MOCK (TWILIO / META Cloud API)]");
  console.log(`Recipient: +919840792693 (Artist Owner Mobile)`);
  console.log("Message Payload:\n" + message);
  console.log("=========================================");
}
