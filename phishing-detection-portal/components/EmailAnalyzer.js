import { useState } from 'react';
import axios from 'axios';

export default function EmailAnalyzer({ onAnalysisComplete }) {
  const [emailContent, setEmailContent] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const analyzeEmail = async () => {
    if (!emailContent.trim()) return;
    
    setAnalyzing(true);
    try {
      const response = await axios.post('/api/analyze-email', {
        emailContent: emailContent
      });
      
      setResults(response.data);
      onAnalysisComplete(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Analysis failed:', error);
      setResults({ error: 'Analysis failed. Please try again.' });
    }
    setAnalyzing(false);
  };

  const getRiskColor = (score) => {
    if (score >= 80) return 'text-red-600 bg-red-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Email Analysis</h2>
        <p className="mt-1 text-sm text-gray-600">
          Paste the suspicious email content below for comprehensive analysis
        </p>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Content (Headers + Body)
            </label>
            <textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Paste the complete email including headers here..."
              className="w-full h-64 border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          
          <button
            onClick={analyzeEmail}
            disabled={analyzing || !emailContent.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {analyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>🔍</span>
                <span>Analyze Email</span>
              </>
            )}
          </button>
        </div>

        {results && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Results</h3>
            
            {results.error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{results.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Risk Score */}
                <div className={`${getRiskColor(results.riskScore)} p-4 rounded-md`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Risk Score</span>
                    <span className="text-xl font-bold">{results.riskScore}/100</span>
                  </div>
                </div>

                {/* Authentication Results */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="font-medium text-gray-900">SPF Check</div>
                    <div className={`text-sm ${results.spfResult?.pass ? 'text-green-600' : 'text-red-600'}`}>
                      {results.spfResult?.status || 'Not checked'}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="font-medium text-gray-900">DKIM Check</div>
                    <div className={`text-sm ${results.dkimResult?.pass ? 'text-green-600' : 'text-red-600'}`}>
                      {results.dkimResult?.status || 'Not checked'}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="font-medium text-gray-900">Domain Age</div>
                    <div className="text-sm text-gray-600">
                      {results.domainAge || 'Unknown'}
                    </div>
                  </div>
                </div>

                {/* Suspicious URLs */}
                {results.suspiciousUrls && results.suspiciousUrls.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Suspicious URLs Detected</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {results.suspiciousUrls.map((url, index) => (
                        <li key={index} className="font-mono">{url}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Homograph Detection */}
                {results.homographs && results.homographs.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <h4 className="font-medium text-red-800 mb-2">Homograph Attacks Detected</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {results.homographs.map((item, index) => (
                        <li key={index} className="font-mono">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {results.recommendations && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Recommendations</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {results.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
