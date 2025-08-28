import { parseEmailHeaders } from '../../lib/emailParser';
import { analyzeUrls } from '../../lib/urlAnalyzer';
import { checkDomainAuthentication } from '../../lib/domainChecker';
import { detectHomographs } from '../../lib/homographDetector';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { emailContent } = req.body;
    
    if (!emailContent) {
      return res.status(400).json({ error: 'Email content is required' });
    }

    // Parse email headers and content
    const emailData = parseEmailHeaders(emailContent);
    
    // Extract URLs from email
    const urls = extractUrls(emailContent);
    
    // Analyze URLs
    const urlAnalysis = await analyzeUrls(urls);
    
    // Check domain authentication (SPF/DKIM)
    const authResults = await checkDomainAuthentication(emailData.fromDomain);
    
    // Check for homograph attacks
    const homographs = detectHomographs(urls);
    
    // Calculate risk score
    const riskScore = calculateRiskScore({
      authResults,
      urlAnalysis,
      homographs,
      emailData
    });
    
    // Generate recommendations
    const recommendations = generateRecommendations({
      riskScore,
      authResults,
      urlAnalysis,
      homographs
    });

    const result = {
      timestamp: new Date().toISOString(),
      riskScore,
      spfResult: authResults.spf,
      dkimResult: authResults.dkim,
      domainAge: authResults.domainAge,
      suspiciousUrls: urlAnalysis.suspicious,
      homographs: homographs,
      recommendations: recommendations,
      emailData: {
        from: emailData.from,
        subject: emailData.subject,
        timestamp: emailData.date
      }
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
}

function extractUrls(content) {
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
  return content.match(urlRegex) || [];
}

function calculateRiskScore({ authResults, urlAnalysis, homographs, emailData }) {
  let score = 0;
  
  // SPF/DKIM failures
  if (!authResults.spf?.pass) score += 25;
  if (!authResults.dkim?.pass) score += 25;
  
  // Suspicious URLs
  score += Math.min(urlAnalysis.suspicious.length * 15, 30);
  
  // Homograph attacks
  score += homographs.length * 20;
  
  // New domain (less than 30 days)
  if (authResults.domainAge && authResults.domainAge < 30) score += 15;
  
  return Math.min(score, 100);
}

function generateRecommendations({ riskScore, authResults, urlAnalysis, homographs }) {
  const recommendations = [];
  
  if (riskScore >= 70) {
    recommendations.push('HIGH RISK: Do not click any links or download attachments');
    recommendations.push('Report this email to your security team immediately');
  }
  
  if (!authResults.spf?.pass) {
    recommendations.push('SPF authentication failed - sender may be spoofed');
  }
  
  if (!authResults.dkim?.pass) {
    recommendations.push('DKIM signature missing or invalid');
  }
  
  if (homographs.length > 0) {
    recommendations.push('Homograph attack detected - verify domain names carefully');
  }
  
  if (urlAnalysis.suspicious.length > 0) {
    recommendations.push('Suspicious URLs detected - hover to verify destinations');
  }
  
  if (riskScore < 30) {
    recommendations.push('Low risk detected, but always verify sender identity');
  }
  
  return recommendations;
}
