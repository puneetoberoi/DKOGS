import { YoutubeTranscript } from 'youtube-transcript';
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

  const { videoId } = req.body;

  if (!videoId) {
    return res.status(400).json({ error: 'Missing videoId' });
  }

  try {
    // Fetch transcript
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    
    // Join text (limit to ~1000 chars to save tokens/latency if needed, or full text)
    // Let's take the first 2000 characters for MVP speed/cost balance
    const fullText = transcriptItems.map(item => item.text).join(' ');
    const snippet = fullText.substring(0, 2000) + (fullText.length > 2000 ? '...' : '');

    return res.status(200).json({ transcript: snippet });
  } catch (error: any) {
    console.error('Transcript Error:', error);
    // Return success false but don't 500, just empty text
    return res.status(200).json({ transcript: '' }); 
  }
}
