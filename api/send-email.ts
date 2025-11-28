import nodemailer from 'nodemailer';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, keyword, reportId } = req.body;

  if (!email || !keyword) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Configure Transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // 16-char App Password
    },
  });

  const dashboardLink = `https://dkogs.vercel.app/?view_report=${reportId}`;

  const mailOptions = {
    from: `"GapSpotter AI" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Market Analysis Ready: ${keyword}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5;">GapSpotter</h1>
        <h2>Your analysis for <strong>"${keyword}"</strong> is safe.</h2>
        <p>You successfully saved this report to your intelligence hub.</p>
        <br/>
        <a href="${dashboardLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Report</a>
        <br/><br/>
        <p style="color: #666; font-size: 12px;">
          Sent via GapSpotter AI
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('SMTP Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
