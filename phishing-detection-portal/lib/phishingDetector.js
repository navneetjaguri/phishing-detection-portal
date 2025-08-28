import { EmailParser } from './emailParser';
import { DomainAnalyzer } from './domainAnalyzer';

export class PhishingDetector {
  static async analyzeEmail(emailContent) {
    const analysis = {
      timestamp: new Date(),
      riskScore: 0,
      indicators: [],
      recommendations: [],
      details: {}
    };

    try {
      // Parse email
      const parsedEmail = await EmailParser.parseEmail(emailContent);
      analysis.details.email = parsedEmail;

      // Check authentication records
      const authScore = this.checkAuthentication(parsedEmail.headers);
      analysis.riskScore += authScore.score;
      analysis.indicators.push(...authScore.indicators);

      // Analyze domains
      const domains = this.extractDomains(parsedEmail);
      const domainAnalysis = await Promise.all(
        domains.map(domain => DomainAnalyzer.analyzeDomain(domain))
      );
      
      analysis.details.domains = domainAnalysis;
      
      const domainScore = this.calculateDomainRisk(domainAnalysis);
      analysis.riskScore += domainScore.score;
      analysis.indicators.push(...domainScore.indicators);

      // Content analysis
      const contentScore = this.analyzeContent(parsedEmail);
      analysis.riskScore += contentScore.score;
      analysis.indicators.push(...contentScore.indicators);

      // URL analysis
      const urlScore = this.analyzeURLs(parsedEmail.urls);
      analysis.riskScore += urlScore.score;
      analysis.indicators.push(...urlScore.indicators);

      // Generate recommendations
      analysis.recommendations = this.generateRecommendations(analysis);
      
      // Normalize risk score (0-1)
      analysis.riskScore = Math.min(analysis.riskScore, 1.0);
      analysis.riskLevel = this.getRiskLevel(analysis.riskScore);

      return analysis;
    } catch (error) {
      throw new Error(`Phishing analysis failed: ${error.message}`);
    }
  }

  static checkAuthentication(headers) {
    const result = { score: 0, indicators: [] };
    
    if (!headers.spf || headers.spf !== 'pass') {
      result.score += 0.2;
      result.indicators.push({
        type: 'auth_failure',
        severity: 'medium',
        description: 'SPF authentication failed or missing'
      });
    }

    if (!headers.dkim || headers.dkim !== 'pass') {
      result.score += 0.2;
      result.indicators.push({
        type: 'auth_failure',
        severity: 'medium',
        description: 'DKIM authentication failed or missing'
      });
    }

    if (!headers.dmarc || headers.dmarc !== 'pass') {
      result.score += 0.15;
      result.indicators.push({
        type: 'auth_failure',
        severity: 'low',
        description: 'DMARC authentication failed or missing'
      });
    }

    return result;
  }

  static extractDomains(parsedEmail) {
    const domains = new Set();
    
    // From sender domain
    if (parsedEmail.from && parsedEmail.from.address) {
      const senderDomain = parsedEmail.from.address.split('@')[1];
      if (senderDomain) domains.add(senderDomain);
    }

    // From URLs
    parsedEmail.urls.forEach(urlObj => {
      if (urlObj.parsed.hostname) {
        domains.add(urlObj.parsed.hostname);
      }
    });

    return Array.from(domains);
  }

  static calculateDomainRisk(domainAnalysis) {
    const result = { score: 0, indicators: [] };
    
    domainAnalysis.forEach(domain => {
      if (domain.suspicious) {
        result.score += 0.3;
        result.indicators.push({
          type: 'suspicious_domain',
          severity: 'high',
          description: `Suspicious domain detected: ${domain.domain}`,
          details: domain
        });
      }

      if (domain.homograph.suspicious) {
        result.score += 0.4;
        result.indicators.push({
          type: 'homograph_attack',
          severity: 'high',
          description: `Potential homograph attack: ${domain.domain}`,
          details: domain.homograph
        });
      }

      if (domain.age.ageInDays < 30) {
        result.score += 0.2;
        result.indicators.push({
          type: 'new_domain',
          severity: 'medium',
          description: `Recently registered domain: ${domain.domain} (${domain.age.ageInDays} days old)`
        });
      }
    });

    return result;
  }

  static analyzeContent(parsedEmail) {
    const result = { score: 0, indicators: [] };
    const text = (parsedEmail.body.text || '').toLowerCase();
    
    // Urgency indicators
    const urgencyKeywords = [
      'urgent', 'immediate action', 'act now', 'expires today',
      'limited time', 'click here now', 'verify immediately'
    ];
    
    urgencyKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        result.score += 0.1;
        result.indicators.push({
          type: 'urgency_language',
          severity: 'medium',
          description: `Urgency language detected: "${keyword}"`
        });
      }
    });

    // Threat indicators
    const threatKeywords = [
      'account suspended', 'security breach', 'unauthorized access',
      'confirm identity', 'update payment', 'verify account'
    ];
    
    threatKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        result.score += 0.15;
        result.indicators.push({
          type: 'threat_language',
          severity: 'high',
          description: `Threat language detected: "${keyword}"`
        });
      }
    });

    return result;
  }

  static analyzeURLs(urls) {
    const result = { score: 0, indicators: [] };
    
    urls.forEach(urlObj => {
      if (urlObj.suspicious) {
        result.score += 0.2;
        result.indicators.push({
          type: 'suspicious_url',
          severity: 'high',
          description: `Suspicious URL detected: ${urlObj.url}`
        });
      }

      // Check for URL shorteners
      const shorteners = ['bit.ly', 'tinyurl.com', 'short.link', 't.co'];
      if (shorteners.some(shortener => urlObj.url.includes(shortener))) {
        result.score += 0.1;
        result.indicators.push({
          type: 'url_shortener',
          severity: 'medium',
          description: `URL shortener detected: ${urlObj.url}`
        });
      }
    });

    return result;
  }

  static generateRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.riskScore > 0.7) {
      recommendations.push({
        action: 'block',
        priority: 'high',
        description: 'Block this email and sender immediately'
      });
    } else if (analysis.riskScore > 0.4) {
      recommendations.push({
        action: 'quarantine',
        priority: 'medium',
        description: 'Quarantine for manual review'
      });
    }

    analysis.indicators.forEach(indicator => {
      if (indicator.type === 'homograph_attack') {
        recommendations.push({
          action: 'train',
          priority: 'high',
          description: 'Provide homograph attack training to users'
        });
      }
    });

    return recommendations;
  }

  static getRiskLevel(score) {
    if (score >= 0.7) return 'HIGH';
    if (score >= 0.4) return 'MEDIUM';
    if (score >= 0.2) return 'LOW';
    return 'MINIMAL';
  }
}
