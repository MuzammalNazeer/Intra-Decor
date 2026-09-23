import nodemailer from 'nodemailer';

/**
 * Send an email using nodemailer.
 * Supports Gmail directly or any custom SMTP.
 * Direct zero-auth delivery for Yopmail test inboxes with Gmail fallback.
 *
 * @param {{ to: string, subject: string, html: string, text?: string, replyTo?: string }} options
 */
export const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  const emailUser = process.env.EMAIL_USER || 'ef91646@gmail.com';
  const emailPass = process.env.EMAIL_PASS || 'hukkfxseuezwnmyk';
  const from = process.env.EMAIL_FROM || `"Neuroviax AI" <${emailUser}>`;

  const mailOptions = {
    from,
    to,
    subject,
    text,
    html,
  };

  if (replyTo) {
    mailOptions.replyTo = replyTo;
  }

  // Gmail SMTP transporter with validated App Password
  const gmailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    // Deliver via authenticated Gmail SMTP (reliably delivers to yopmail.com, gmail, etc.)
    const info = await gmailTransporter.sendMail(mailOptions);
    console.log(`✉️ Email successfully delivered to: ${to} | Subject: "${subject}" | MessageId: ${info.messageId}`);
    return info;
  } catch (gmailErr) {
    console.warn(`[sendEmail] Gmail SMTP attempt notice:`, gmailErr.message);

    // Fallback direct for Yopmail if needed
    const isYopmail = to && (
      to.toLowerCase().includes('yopmail') ||
      to.toLowerCase().endsWith('@cool.fr.nf') ||
      to.toLowerCase().endsWith('@jetable.fr.nf')
    );

    if (isYopmail) {
      try {
        const yopmailTransporter = nodemailer.createTransport({
          host: 'smtp.yopmail.com',
          port: 25,
          secure: false,
          tls: { rejectUnauthorized: false }
        });
        const yopInfo = await yopmailTransporter.sendMail(mailOptions);
        console.log(`✉️ Yopmail direct delivery sent to: ${to} | MessageId: ${yopInfo.messageId}`);
        return yopInfo;
      } catch (yopErr) {
        console.error(`[sendEmail] Yopmail direct notice:`, yopErr.message);
      }
    }
    throw gmailErr;
  }
};

export default sendEmail;
