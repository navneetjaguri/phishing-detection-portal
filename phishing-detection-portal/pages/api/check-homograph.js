import { detectHomographs } from '../../lib/homographDetector';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { urls } = req.body;
    
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'URLs array is required' });
    }

    const homographs = detectHomographs(urls);
    res.status(200).json({ homographs });
  } catch (error) {
    console.error('Homograph detection failed:', error);
    res.status(500).json({ error: 'Homograph detection failed' });
  }
}
