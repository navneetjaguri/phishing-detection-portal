import Head from 'next/head';

export default function Layout({ children }) {
  return (
    <div>
      <Head>
        <title>Phishing Detection & Training Portal</title>
        <meta name="description" content="Advanced phishing detection and security training platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🛡️</div>
              <h1 className="text-xl font-semibold text-gray-900">
                Phishing Detection Portal
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              Secure Email Analysis & Training
            </div>
          </div>
        </div>
      </header>
      
      <main>
        {children}
      </main>
      
      <footer className="bg-gray-50 border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2025 Phishing Detection Portal. Built for cybersecurity awareness.
          </p>
        </div>
      </footer>
    </div>
  );
}
