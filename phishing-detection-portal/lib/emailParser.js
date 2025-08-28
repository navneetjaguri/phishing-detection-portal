export function parseEmailHeaders(emailContent) {
  const lines = emailContent.split('\n');
  const headers = {};
  let bodyStart = 0;
  
  // Find headers
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') {
      bodyStart = i + 1;
      break;
    }
    
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).toLowerCase();
      const value = line.substring(colonIndex + 1).trim();
      headers[key] = value;
    }
  }
  
  const body = lines.slice(bodyStart).join('\n');
  
  return {
    from: headers['from'] || '',
    to: headers['to'] || '',
    subject: headers['subject'] || '',
    date: headers['date'] || '',
    fromDomain: extractDomain(headers['from'] || ''),
    returnPath: headers['return-path'] || '',
    receivedSpf: headers['received-spf'] || '',
    authenticationResults: headers['authentication-results'] || '',
    body: body,
    headers: headers
  };
}

function extractDomain(email) {
  const match = email.match(/@([^>]+)/);
  return match ? match[1].trim() : '';
}
