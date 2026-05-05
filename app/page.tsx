'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { User } from '@/lib/types';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        setUser(null);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 to-primary-100">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primary-700 mb-4">
            Registration and Abstract Management Portal
          </h1>
          <p className="text-xl text-primary-600">
            Submit and review conference abstracts
          </p>
        </div>

        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
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
                06-08 July 2026 | Addis Ababa, Ethiopia
              </p>
            </div>
          </div>

          {/* Login / Dashboard Card */}
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
              {user ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Welcome back, {user.firstName}!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {user.isSuperAdmin
                      ? 'Manage the conference platform'
                      : user.isStaff
                      ? 'Manage abstracts and participants'
                      : 'Continue managing your abstracts and submissions'}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome</h2>
                  <p className="text-gray-600 mb-6">
                    Sign in to access the abstract management system
                  </p>
                </>
              )}
            </div>
            <div className="space-y-3">
              {user ? (
                <>
                  <Link
                    href={user.isSuperAdmin || user.isStaff ? '/dashboard' : '/my-submissions'}
                    className="block w-full bg-primary-500 text-white text-center py-3 rounded-lg hover:bg-primary-600 transition-colors font-semibold"
                  >
                    {user.isSuperAdmin || user.isStaff ? 'Go to Dashboard' : 'My Submissions'}
                  </Link>
                  {!user.isSuperAdmin && !user.isStaff && (
                    <Link
                      href="/submit"
                      className="block w-full border-2 border-primary-500 text-primary-500 text-center py-3 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
                    >
                      Submit Abstract
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="block w-full bg-primary-500 text-white text-center py-3 rounded-lg hover:bg-primary-600 transition-colors font-semibold"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Registration and Payment Notice */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-primary-700 mb-6">
            Registration and Payment Notice
          </h2>
          <p className="text-gray-700 mb-8">
            All registration fees are listed in USD and ETB. Early Bird rates apply to registrations completed before May 2026.
          </p>

          {/* Card Payment */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-primary-600 mb-3">Card Payment</h3>
            <p className="text-gray-700">
              This platform accepts debit or credit card payments. Once payment is confirmed, your registration will be automatically approved and a receipt will be sent to your email address.
            </p>
          </div>

          {/* Bank Transfer */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-primary-600 mb-3">Bank Transfer in Ethiopian Birr (ETB)</h3>
            <p className="text-gray-700 mb-3">
              Delegates who wish to pay in Ethiopian Birr may do so via bank transfer by scanning the barcode below. A valid Ethiopian commercial bank account is required.
            </p>
            <p className="text-gray-700 mb-6">
              <span className="font-semibold">Important:</span> After completing the bank transfer, upload your payment receipt to the form below. Your registration will be reviewed and approved once the receipt is verified.{' '}
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScQTMbmCuVOkm5Nnv24kHkwiHYVu9t_HMbmBjhpFJ8Kxk_dkw/closedform"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 underline hover:text-primary-700"
              >
                Upload your Payment receipt here!
              </a>
            </p>

            {/* Bank Transfer Barcode */}
            <h4 className="text-lg font-semibold text-primary-700 mb-4">Bank Transfer Barcode</h4>
            <div className="flex justify-center">
              <div className="border-4 border-purple-600 rounded-lg p-4 w-72 text-center bg-white shadow-md">
                <div className="bg-yellow-700 text-white text-xs font-semibold py-1 px-2 rounded mb-3">
                  WE ACCEPT QR PAYMENT
                </div>
                <div className="text-2xl font-bold mb-3 tracking-wide">
                  <span className="text-green-600">ETH</span>
                  <span className="text-red-500">Q</span>
                  <span className="text-blue-600">R</span>
                </div>
                <div className="bg-gray-100 rounded p-4 mb-3 mx-auto w-36 h-36 flex items-center justify-center border border-gray-300">
                  <p className="text-xs text-gray-500 text-center">QR Code<br />(Ethiopian Interoperable<br />Payment)</p>
                </div>
                <p className="font-bold text-sm text-gray-800 mb-1">MOH CONTR FOR HEALTH CARE RESTOR B</p>
                <p className="text-sm text-gray-600 mb-3">1****3337</p>
                <div className="border-t border-gray-300 pt-2 flex items-center justify-center gap-2">
                  <span className="text-xs text-gray-500">Acquired by</span>
                </div>
                <p className="font-semibold text-sm text-gray-700 mt-1">Commercial Bank of Ethiopia</p>
                <p className="text-xs text-gray-500">Contact us: 951 | Email: contact@cbe.com</p>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-primary-600 mb-3">Additional Notes</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Group rates apply to groups of 8 or more delegates.</li>
              <li>Registration includes access to conference sessions and conference materials. Optional activities may require separate registration.</li>
              <li>ETB amounts are indicative and subject to change based on the foreign exchange rate at the time of payment.</li>
              <li>Invoices are available on request after payment is completed.</li>
            </ul>
          </div>

          <p className="text-gray-700">
            For support or payment questions, contact:{' '}
            <a
              href="mailto:mededafrica@coms-africa.org"
              className="text-primary-600 underline hover:text-primary-700"
            >
              mededafrica@coms-africa.org
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
