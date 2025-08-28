import { checkDomainAuthentication } from '../../lib/domainChecker';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    const results = await checkDomainAuthentication(domain);
    res.status(200).json(results);
  } catch (error) {
    console.error('SPF/DKIM check failed:', error);
    res.status(500).json({ error: 'Authentication check failed' });
  }
}
