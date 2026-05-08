import type { Metadata } from 'next'
import './globals.css'
import SessionExpiredModal from '@/components/SessionExpiredModal'

export const metadata: Metadata = {
  title: 'MedEd Africa Conference Abstract Submission',
  description: 'Submit and review conference abstracts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <SessionExpiredModal />
      </body>
    </html>
  )
}
