import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: 'ef91646@gmail.com',
    pass: 'hukkfxseuezwnmyk'
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function main() {
  try {
    const verified = await transporter.verify();
    console.log('✅ SMTP Connection verified successfully:', verified);

    const info = await transporter.sendMail({
      from: '"Neuroviax AI" <ef91646@gmail.com>',
      to: 'muzammal123@yopmail.com',
      subject: 'Neuroviax AI — Email Verification OTP',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:12px;">
          <h2 style="color:#111;">🤖 Neuroviax AI</h2>
          <h4 style="color:#555;margin-top:0;">Email Verification</h4>
          <p>Hello <strong>muzammal nazeer</strong>,</p>
          <p>Thank you for signing up! Use the OTP below to verify your email address. It expires in 10 minutes.</p>
          <div style="text-align:center;margin:24px 0;">
            <span style="font-size:32px;font-weight:bold;letter-spacing:6px;background:#f3f4f6;padding:12px 24px;border-radius:8px;border:1px dashed #4f46e5;color:#4f46e5;">511047</span>
          </div>
          <p style="color:#888;font-size:12px;">If you did not create this account, please ignore this email.</p>
        </div>
      `
    });

    console.log('✅ Email successfully delivered! MessageId:', info.messageId);
    console.log('SMTP Response:', info.response);
  } catch (err) {
    console.error('❌ Error sending mail:', err);
  }
}

main();
