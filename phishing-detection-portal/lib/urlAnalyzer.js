export async function analyzeUrls(urls) {
  const suspicious = [];
  const analysis = [];

  for (const url of urls) {
    try {
      const urlAnalysis = await analyzeIndividualUrl(url);
      analysis.push(urlAnalysis);
      
      if (urlAnalysis.isSuspicious) {
        suspicious.push(url);
      }
    } catch (error) {
      console.error('URL analysis error:', error);
    }
  }

  return { suspicious, analysis };
}

async function analyzeIndividualUrl(url) {
  const result = {
    url,
    isSuspicious: false,
    reasons: [],
    riskScore: 0
  };

  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Check for suspicious patterns
    if (checkSuspiciousDomain(domain)) {
      result.isSuspicious = true;
      result.reasons.push('Suspicious domain pattern');
      result.riskScore += 25;
    }

    // Check for URL shorteners
    if (isUrlShortener(domain)) {
      result.reasons.push('URL shortener detected');
      result.riskScore += 15;
    }

    // Check for IP address instead of domain
    if (isIpAddress(domain)) {
      result.isSuspicious = true;
      result.reasons.push('Using IP address instead of domain name');
      result.riskScore += 30;
    }

    // Check for suspicious TLDs
    if (hasSuspiciousTLD(domain)) {
      result.reasons.push('Suspicious top-level domain');
      result.riskScore += 10;
    }

    // Check for excessive subdomains
    if (hasExcessiveSubdomains(domain)) {
      result.reasons.push('Excessive subdomains');
      result.riskScore += 15;
    }

    // Check URL length
    if (url.length > 200) {
      result.reasons.push('Unusually long URL');
      result.riskScore += 10;
    }

    if (result.riskScore >= 50) {
      result.isSuspicious = true;
    }

  } catch (error) {
    result.reasons.push('Invalid URL format');
    result.isSuspicious = true;
    result.riskScore = 100;
  }

  return result;
}

function checkSuspiciousDomain(domain) {
  const suspiciousPatterns = [
    /secure.*update/i,
    /account.*verification/i,
    /urgent.*action/i,
    /suspend.*account/i,
    /click.*here/i,
    /limited.*time/i
  ];

  return suspiciousPatterns.some(pattern => pattern.test(domain));
}

function isUrlShortener(domain) {
  const shorteners = [
    'bit.ly', 'tinyurl.com', 'short.link', 'ow.ly', 't.co',
    'goo.gl', 'tiny.cc', 'is.gd', 'buff.ly', 'adf.ly'
  ];
  return shorteners.includes(domain.toLowerCase());
}

function isIpAddress(domain) {
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Pattern = /^([0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}$/i;
  return ipv4Pattern.test(domain) || ipv6Pattern.test(domain);
}

function hasSuspiciousTLD(domain) {
  const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.click', '.download', '.work'];
  return suspiciousTlds.some(tld => domain.toLowerCase().endsWith(tld));
}

function hasExcessiveSubdomains(domain) {
  return domain.split('.').length > 4;
}
