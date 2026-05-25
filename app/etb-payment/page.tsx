'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const RECEIPT_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScQTMbmCuVOkm5Nnv24kHkwiHYVu9t_HMbmBjhpFJ8Kxk_dkw/closedform';

const STEPS: React.ReactNode[] = [
  'Scan the QR code below.',
  'Make the payment through the Commercial Bank of Ethiopia platform.',
  'Download or save the payment receipt.',
  <>
    Attach the receipt and submit it via our{' '}
    <a
      href="https://forms.gle/SjebGkwEiWf8itDw5"
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary-600 underline hover:text-primary-700"
    >
      payment upload form
    </a>
    .
  </>,
  'If the payment was made for a group, kindly include the full names of all participants covered under the group payment, as indicated in the form.',
  'The MedEdAfrica2026 organizing committee will review and approve the payment.',
  'Once the payment is confirmed, the committee will send the official conference registration confirmation to the participant(s).',
];

export default function EtbPaymentPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 to-primary-100">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to home
            </Link>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-700 mb-3">
              Local Delegate (ETB) Payment
            </h1>
            <p className="text-lg text-primary-600">
              For Ethiopian residents paying in Ethiopian Birr via Commercial Bank of Ethiopia
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-primary-700 mb-4">
              Registration Fees (ETB)
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-primary-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold border border-primary-700">
                      Registration Type
                    </th>
                    <th className="px-4 py-3 text-left font-semibold border border-primary-700">
                      Early Bird – Individual
                    </th>
                    <th className="px-4 py-3 text-left font-semibold border border-primary-700">
                      Early Bird – Group of 8
                    </th>
                    <th className="px-4 py-3 text-left font-semibold border border-primary-700">
                      Regular – Individual
                    </th>
                    <th className="px-4 py-3 text-left font-semibold border border-primary-700">
                      Regular – Group of 8
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr>
                    <td className="px-4 py-3 border border-gray-200 font-medium">
                      Delegate (Member)
                    </td>
                    <td className="px-4 py-3 border border-gray-200">ETB 4,660</td>
                    <td className="px-4 py-3 border border-gray-200">ETB 23,280</td>
                    <td className="px-4 py-3 border border-gray-200">ETB 7,760</td>
                    <td className="px-4 py-3 border border-gray-200">ETB 46,557</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 border border-gray-200 font-medium">
                      Delegate (Non-Member)
                    </td>
                    <td className="px-4 py-3 border border-gray-200">ETB 9,315</td>
                    <td className="px-4 py-3 border border-gray-200">ETB 54,316</td>
                    <td className="px-4 py-3 border border-gray-200">ETB 12,415</td>
                    <td className="px-4 py-3 border border-gray-200">ETB 69,835</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 border border-gray-200 font-medium">Student</td>
                    <td className="px-4 py-3 border border-gray-200">ETB 2,327</td>
                    <td className="px-4 py-3 border border-gray-200">ETB 2,327</td>
                    <td className="px-4 py-3 border border-gray-200">ETB 2,328</td>
                    <td className="px-4 py-3 border border-gray-200">ETB 2,327</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-primary-700 mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed">
              This page is intended for Ethiopian residents who wish to pay the MedEdAfrica2026
              conference registration fee in Ethiopian Birr. Participants must have access to a
              Commercial Bank of Ethiopia account or payment platform to complete the payment
              process.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-primary-700 mb-4">
              Steps to Complete the Process
            </h2>
            <ol className="list-decimal list-outside ml-5 space-y-2 text-gray-700 leading-relaxed">
              {STEPS.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-primary-700 mb-6 text-center">
              Bank Transfer Barcode
            </h2>
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
                  <p className="text-xs text-gray-500 text-center">
                    QR Code
                    <br />
                    (Ethiopian Interoperable
                    <br />
                    Payment)
                  </p>
                </div>
                <p className="font-bold text-sm text-gray-800 mb-1">
                  MOH CONTR FOR HEALTH CARE RESTOR B
                </p>
                <p className="text-sm text-gray-600 mb-3">1****3337</p>
                <div className="border-t border-gray-300 pt-2 flex items-center justify-center gap-2">
                  <span className="text-xs text-gray-500">Acquired by</span>
                </div>
                <p className="font-semibold text-sm text-gray-700 mt-1">
                  Commercial Bank of Ethiopia
                </p>
                <p className="text-xs text-gray-500">Contact us: 951 | Email: contact@cbe.com</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-8 mb-8 text-center">
            <h2 className="text-2xl font-semibold text-amber-900 mb-3">
              Already paid? Upload your receipt
            </h2>
            <p className="text-amber-900 mb-6">
              After completing the bank transfer, submit your payment receipt through the form
              below. Your registration will be reviewed and approved once the receipt is verified.
            </p>
            <a
              href={RECEIPT_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Upload Your Payment Receipt
            </a>
          </div>

          <p className="text-center text-gray-700">
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
