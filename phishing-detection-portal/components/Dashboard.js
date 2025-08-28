import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard({ analysisResults }) {
  const [stats, setStats] = useState({
    totalAnalyzed: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    topThreats: [],
    recentAnalyses: []
  });

  useEffect(() => {
    calculateStats();
  }, [analysisResults]);

  const calculateStats = () => {
    if (!analysisResults || analysisResults.length === 0) return;

    const total = analysisResults.length;
    let high = 0, medium = 0, low = 0;
    const threats = {};

    analysisResults.forEach(result => {
      if (result.riskScore >= 70) high++;
      else if (result.riskScore >= 40) medium++;
      else low++;

      // Count threat types
      if (result.homographs?.length > 0) {
        threats['Homograph Attacks'] = (threats['Homograph Attacks'] || 0) + 1;
      }
      if (result.suspiciousUrls?.length > 0) {
        threats['Suspicious URLs'] = (threats['Suspicious URLs'] || 0) + 1;
      }
      if (!result.spfResult?.pass) {
        threats['SPF Failures'] = (threats['SPF Failures'] || 0) + 1;
      }
      if (!result.dkimResult?.pass) {
        threats['DKIM Failures'] = (threats['DKIM Failures'] || 0) + 1;
      }
    });

    const topThreats = Object.entries(threats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    setStats({
      totalAnalyzed: total,
      highRisk: high,
      mediumRisk: medium,
      lowRisk: low,
      topThreats,
      recentAnalyses: analysisResults.slice(-5).reverse()
    });
  };

  const riskDistributionData = {
    labels: ['High Risk', 'Medium Risk', 'Low Risk'],
    datasets: [{
      data: [stats.highRisk, stats.mediumRisk, stats.lowRisk],
      backgroundColor: ['#DC2626', '#D97706', '#059669'],
      borderWidth: 0
    }]
  };

  const threatTypesData = {
    labels: stats.topThreats.map(threat => threat.name),
    datasets: [{
      label: 'Threat Count',
      data: stats.topThreats.map(threat => threat.count),
      backgroundColor: '#6366F1',
      borderRadius: 4
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                📧
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Analyzed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalAnalyzed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                🚨
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Risk</p>
              <p className="text-2xl font-semibold text-red-600">{stats.highRisk}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                ⚠️
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Medium Risk</p>
              <p className="text-2xl font-semibold text-yellow-600">{stats.mediumRisk}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                ✅
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Risk</p>
              <p className="text-2xl font-semibold text-green-600">{stats.lowRisk}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Distribution</h3>
          {stats.totalAnalyzed > 0 ? (
            <Doughnut data={riskDistributionData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data to display
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Threat Types</h3>
          {stats.topThreats.length > 0 ? (
            <Bar data={threatTypesData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No threat data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Analyses Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Analyses</h3>
        </div>
        
        {stats.recentAnalyses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Threats
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentAnalyses.map((analysis, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(analysis.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {analysis.emailData?.from || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {analysis.emailData?.subject || 'No subject'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        analysis.riskScore >= 70 ? 'bg-red-100 text-red-800' :
                        analysis.riskScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {analysis.riskScore}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {!analysis.spfResult?.pass && (
                          <span className="inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                            SPF
                          </span>
                        )}
                        {!analysis.dkimResult?.pass && (
                          <span className="inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                            DKIM
                          </span>
                        )}
                        {analysis.homographs?.length > 0 && (
                          <span className="inline-flex px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                            Homograph
                          </span>
                        )}
                        {analysis.suspiciousUrls?.length > 0 && (
                          <span className="inline-flex px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                            Sus URLs
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            No analyses performed yet
          </div>
        )}
      </div>
    </div>
  );
}
