export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const trainingModules = [
    {
      id: 1,
      title: "Phishing Email Basics",
      description: "Learn to identify common phishing email tactics and red flags",
      duration: "15 minutes",
      content: `
        <h3>What is Phishing?</h3>
        <p>Phishing is a cybercrime where attackers impersonate legitimate organizations to steal sensitive information like passwords, credit card numbers, or personal data.</p>
        
        <h3>Common Phishing Tactics</h3>
        <ul>
          <li><strong>Urgency:</strong> "Your account will be closed in 24 hours!"</li>
          <li><strong>Authority:</strong> Pretending to be from banks, government, or IT departments</li>
          <li><strong>Fear:</strong> "Suspicious activity detected on your account"</li>
          <li><strong>Greed:</strong> "You've won a prize!" or "Limited time offer"</li>
        </ul>

        <h3>Red Flags to Watch For</h3>
        <ul>
          <li>Generic greetings ("Dear Customer" instead of your name)</li>
          <li>Poor grammar and spelling</li>
          <li>Mismatched URLs (hover over links to see real destination)</li>
          <li>Unexpected attachments</li>
          <li>Requests for sensitive information via email</li>
        </ul>

        <h3>Best Practices</h3>
        <ul>
          <li>Verify sender identity through a separate channel</li>
          <li>Never click suspicious links or download unexpected attachments</li>
          <li>Check URLs carefully for misspellings or wrong domains</li>
          <li>Use multi-factor authentication when possible</li>
          <li>Report suspicious emails to your IT security team</li>
        </ul>
      `,
      quiz: [
        {
          question: "What is the most common tactic used in phishing emails?",
          options: ["Creating urgency", "Offering discounts", "Sending attachments", "Using company logos"],
          correct: "Creating urgency"
        },
        {
          question: "How should you verify a suspicious email from your bank?",
          options: ["Click the link to check", "Reply to the email", "Call the bank directly", "Forward to friends"],
          correct: "Call the bank directly"
        },
        {
          question: "What should you do with an unexpected email attachment?",
          options: ["Open it immediately", "Scan it first", "Don't open it", "Forward it to IT"],
          correct: "Don't open it"
        }
      ]
    },
    {
      id: 2,
      title: "URL Safety & Analysis",
      description: "Master the art of identifying malicious URLs and links",
      duration: "20 minutes",
      content: `
        <h3>Understanding URLs</h3>
        <p>URLs (Uniform Resource Locators) are web addresses that can reveal a lot about a website's legitimacy and safety.</p>
        
        <h3>URL Structure</h3>
        <p>A typical URL consists of:</p>
        <ul>
          <li><strong>Protocol:</strong> http:// or https:// (https is more secure)</li>
          <li><strong>Domain:</strong> The website name (e.g., google.com)</li>
          <li><strong>Path:</strong> The specific page or resource</li>
        </ul>

        <h3>Red Flags in URLs</h3>
        <ul>
          <li>Misspelled domain names (e.g., "gooogle.com" instead of "google.com")</li>
          <li>Suspicious subdomains (e.g., "paypal.fake-site.com")</li>
          <li>IP addresses instead of domain names</li>
          <li>Unusual top-level domains (.tk, .ml for legitimate services)</li>
          <li>URL shorteners hiding the real destination</li>
        </ul>

        <h3>Homograph Attacks</h3>
        <p>Cybercriminals use characters from other alphabets that look similar to English letters:</p>
        <ul>
          <li>Cyrillic 'а' instead of Latin 'a'</li>
          <li>Greek characters that resemble English ones</li>
          <li>Unicode characters that display similarly</li>
        </ul>

        <h3>Safe Browsing Tips</h3>
        <ul>
          <li>Always hover over links before clicking</li>
          <li>Type URLs manually for important sites</li>
          <li>Use bookmarks for frequently visited sites</li>
          <li>Check for HTTPS on sensitive pages</li>
          <li>Verify certificates for financial sites</li>
        </ul>
      `,
      quiz: [
        {
          question: "Which protocol is more secure for sensitive transactions?",
          options: ["HTTP", "HTTPS", "FTP", "SMTP"],
          correct: "HTTPS"
        },
        {
          question: "What is a homograph attack?",
          options: ["Using similar-looking characters from different alphabets", "Creating fake websites", "Sending spam emails", "Hacking databases"],
          correct: "Using similar-looking characters from different alphabets"
        },
        {
          question: "What should you do before clicking a link in an email?",
          options: ["Click immediately", "Hover to see the real URL", "Forward to friends", "Delete the email"],
          correct: "Hover to see the real URL"
        }
      ]
    },
    {
      id: 3,
      title: "Email Authentication",
      description: "Understanding SPF, DKIM, and DMARC security protocols",
      duration: "25 minutes",
      content: `
        <h3>Email Authentication Protocols</h3>
        <p>Email authentication helps verify that emails are actually from the claimed sender and haven't been tampered with.</p>
        
        <h3>SPF (Sender Policy Framework)</h3>
        <p>SPF allows domain owners to specify which mail servers are authorized to send emails on their behalf.</p>
        <ul>
          <li>Published as DNS TXT records</li>
          <li>Prevents basic email spoofing</li>
          <li>Receiving servers can check if the email came from an authorized server</li>
        </ul>

        <h3>DKIM (DomainKeys Identified Mail)</h3>
        <p>DKIM adds a digital signature to emails that can be verified by the recipient.</p>
        <ul>
          <li>Uses public-key cryptography</li>
          <li>Ensures the email hasn't been modified in transit</li>
          <li>Signature is added to email headers</li>
        </ul>

        <h3>DMARC (Domain-based Message Authentication)</h3>
        <p>DMARC builds on SPF and DKIM to provide policy guidance for handling failed authentication.</p>
        <ul>
          <li>Specifies what to do with unauthenticated emails</li>
          <li>Provides reporting on email authentication results</li>
          <li>Helps protect against email spoofing and phishing</li>
        </ul>

        <h3>Why This Matters</h3>
        <ul>
          <li>Emails without proper authentication are more likely to be fake</li>
          <li>Legitimate organizations implement these protocols</li>
          <li>Missing authentication is a red flag for phishing</li>
        </ul>
      `,
      quiz: [
        {
          question: "What does SPF help prevent?",
          options: ["Virus infections", "Email spoofing", "Spam folders", "Slow email delivery"],
          correct: "Email spoofing"
        },
        {
          question: "What does DKIM provide to emails?",
          options: ["Encryption", "Digital signature", "Spam filtering", "Virus scanning"],
          correct: "Digital signature"
        },
        {
          question: "If an email fails authentication checks, it might be:",
          options: ["Delayed", "Legitimate", "Fake or spoofed", "From a new sender"],
          correct: "Fake or spoofed"
        }
      ]
    }
  ];

  res.status(200).json(trainingModules);
}
