import dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);

export async function checkDomainAuthentication(domain) {
  if (!domain) return { spf: { pass: false }, dkim: { pass: false } };
  
  try {
    // Check SPF record
    const spfResult = await checkSPF(domain);
    
    // Check DKIM (basic check for _domainkey subdomain)
    const dkimResult = await checkDKIM(domain);
    
    // Get domain age (simplified)
    const domainAge = await getDomainAge(domain);
    
    return {
      spf: spfResult,
      dkim: dkimResult,
      domainAge: domainAge
    };
  } catch (error) {
    console.error('Domain authentication check failed:', error);
    return { 
      spf: { pass: false, error: error.message }, 
      dkim: { pass: false, error: error.message } 
    };
  }
}

async function checkSPF(domain) {
  try {
    const records = await resolveTxt(domain);
    const spfRecord = records.flat().find(record => 
      record.startsWith('v=spf1')
    );
    
    return {
      pass: !!spfRecord,
      record: spfRecord,
      status: spfRecord ? 'SPF record found' : 'No SPF record'
    };
  } catch (error) {
    return {
      pass: false,
      status: 'SPF lookup failed',
      error: error.message
    };
  }
}

async function checkDKIM(domain) {
  try {
    // Check for common DKIM selectors
    const selectors = ['default', 'google', 'selector1', 'k1'];
    
    for (const selector of selectors) {
      try {
        const dkimDomain = `${selector}._domainkey.${domain}`;
        const records = await resolveTxt(dkimDomain);
        
        if (records.length > 0) {
          return {
            pass: true,
            selector: selector,
            status: 'DKIM record found'
          };
        }
      } catch (e) {
        // Continue checking other selectors
      }
    }
    
    return {
      pass: false,
      status: 'No DKIM records found'
    };
  } catch (error) {
    return {
      pass: false,
      status: 'DKIM lookup failed',
      error: error.message
    };
  }
}

async function getDomainAge(domain) {
  // Simplified domain age check
  // In production, you'd use whois data
  try {
    const creationDate = new Date('2020-01-01'); // Placeholder
    const now = new Date();
    const ageInDays = Math.floor((now - creationDate) / (1000 * 60 * 60 * 24));
    return ageInDays;
  } catch (error) {
    return null;
  }
}
