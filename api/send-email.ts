import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const resend = new Resend(process.env.RESEND_API_KEY);

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

  // Dynamic Dashboard Link (Kept 100% same logic)
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host || 'demandowl.com';
  const origin = `${protocol}://${host}`;
  const dashboardLink = `${origin}/?view_report=${reportId}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Demand Owl <updates@demandowl.com>', // CHANGED: Uses verified domain
      to: [email],
      subject: `Your Sentiment Analysis Ready: ${keyword}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">Demand Owl Updates:</h1>
          <h2>Your analysis for <strong>"${keyword}"</strong> is safe.</h2>
          <p>You successfully saved this report to your Demand Owl Dashboard.</p>
          <br/>
          <a href="${dashboardLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Report</a>
          <br/><br/>
          <p style="color: #666; font-size: 12px;">
            Sent via DemandOwl AI
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      return res.status(400).json({ error });
    }

    console.log(`Email sent to ${email}`);
    return res.status(200).json({ success: true, data }); // Kept success: true for compat

  } catch (error: any) {
    console.error('Email API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
