import punycode from 'punycode/';

export function detectHomographs(urls) {
  const homographs = [];
  
  for (const url of urls) {
    try {
      const domain = extractDomainFromUrl(url);
      
      // Check for punycode (xn--)
      if (domain.includes('xn--')) {
        const decoded = punycode.toUnicode(domain);
        homographs.push({
          original: domain,
          decoded: decoded,
          type: 'punycode',
          risk: 'high'
        });
      }
      
      // Check for common homograph patterns
      const suspiciousPatterns = [
        /[а-я]/i, // Cyrillic characters
        /[αβγδεζηθικλμνξοπρστυφχψω]/i, // Greek characters
        /[０-９]/i, // Full-width digits
      ];
      
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(domain)) {
          homographs.push({
            original: domain,
            type: 'unicode_homograph',
            risk: 'medium'
          });
          break;
        }
      }
      
      // Check for common typosquatting patterns
      const legitDomains = [
        'paypal.com', 'amazon.com', 'google.com', 'microsoft.com',
        'apple.com', 'facebook.com', 'twitter.com', 'linkedin.com'
      ];
      
      for (const legitDomain of legitDomains) {
        const similarity = calculateSimilarity(domain, legitDomain);
        if (similarity > 0.8 && similarity < 1.0) {
          homographs.push({
            original: domain,
            suspicious_of: legitDomain,
            similarity: similarity,
            type: 'typosquatting',
            risk: 'high'
          });
        }
      }
      
    } catch (error) {
      console.error('Homograph detection error:', error);
    }
  }
  
  return homographs;
}

function extractDomainFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return '';
  }
}

function calculateSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
  const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[len1][len2];
  return 1 - distance / Math.max(len1, len2);
}
