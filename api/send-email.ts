import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, keyword, reportId } = req.body;

    if (!email || !keyword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const dashboardLink = `https://dkogs.vercel.app/?view_report=${reportId}`;

    const { data, error } = await resend.emails.send({
      from: 'GapSpotter <onboarding@resend.dev>', // Verify domain later for custom from
      to: [email], // Only works for your own email in test mode
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
            GapSpotter Intelligence Platform
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      return res.status(400).json({ error });
    }

    return res.status(200).json({ data });
  } catch (error: any) {
    console.error('Email Server Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
