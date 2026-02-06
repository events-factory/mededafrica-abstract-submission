import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 to-primary-100">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primary-700 mb-4">
            Abstract Management System
          </h1>
          <p className="text-xl text-primary-600">
            Submit and review conference abstracts
          </p>
        </div>

        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Login Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome</h2>
              <p className="text-gray-600 mb-6">
                Sign in to access the abstract management system
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="block w-full bg-primary-500 text-white text-center py-3 rounded-lg hover:bg-primary-600 transition-colors font-semibold"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="block w-full border-2 border-primary-500 text-primary-500 text-center py-3 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Conference Registration Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Conference Registration
              </h2>
              <p className="text-gray-600 mb-6">
                Register to attend the MedEdAfrica2026
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href="/register-conference"
                className="block w-full bg-green-500 text-white text-center py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                Register for the Conference
              </Link>
              <p className="text-sm text-gray-500 text-center">
                06-08 July 2025 | Addis Ababa, Ethiopia
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
