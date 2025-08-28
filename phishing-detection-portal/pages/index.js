import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import EmailAnalyzer from '../components/EmailAnalyzer';
import Dashboard from '../components/Dashboard';
import TrainingModule from '../components/TrainingModule';

export default function Home() {
  const [activeTab, setActiveTab] = useState('analyzer');
  const [analysisResults, setAnalysisResults] = useState([]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'analyzer', name: 'Email Analyzer', icon: '🔍' },
                  { id: 'training', name: 'Training Modules', icon: '🎓' },
                  { id: 'dashboard', name: 'Analytics Dashboard', icon: '📊' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-6">
              {activeTab === 'analyzer' && (
                <EmailAnalyzer onAnalysisComplete={setAnalysisResults} />
              )}
              {activeTab === 'training' && <TrainingModule />}
              {activeTab === 'dashboard' && (
                <Dashboard analysisResults={analysisResults} />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
