import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'HypeCTR - YouTube Channel Analyzer',
  description: 'Paste any YouTube channel URL. Get 5 ranked video ideas with AI performance predictions and thumbnail concepts. Free to try — no account needed.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://hypectr.com'),
  openGraph: {
    title: 'HypeCTR - YouTube Channel Analyzer',
    description: 'Paste any YouTube channel URL. Get 5 ranked video ideas with AI performance predictions and thumbnail concepts.',
    type: 'website',
    siteName: 'HypeCTR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HypeCTR - YouTube Channel Analyzer',
    description: 'Paste any YouTube channel URL. Get 5 ranked video ideas with AI performance predictions and thumbnail concepts.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
