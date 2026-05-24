import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/presentation/components/common/Toast'
import { AppShell } from '@/presentation/components/layout/AppShell'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PromptSocial - Share and Discover AI Prompts',
  description: 'A social platform for AI prompt engineers to share, discover, and remix the best prompts.',
  keywords: ['AI prompts', 'ChatGPT prompts', 'prompt engineering', 'AI tools'],
  openGraph: {
    title: 'PromptSocial',
    description: 'Share and discover AI prompts with the community',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <ToastProvider />
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  )
}
