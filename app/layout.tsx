import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CV Genius - Transformez votre CV avec l\'IA',
  description: 'Application web qui transforme votre brouillon de CV en document professionnel grâce à l\'intelligence artificielle.',
  keywords: ['CV', 'IA', 'Intelligence Artificielle', 'Carrière', 'Emploi'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
} 