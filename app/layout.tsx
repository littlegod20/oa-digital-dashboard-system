import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { RoleProvider } from '@/lib/role-context'
import { getToken } from '@/lib/auth-server'
import { ConvexClientProvider } from './convex-client-provider'
import { THEME_INIT_SCRIPT } from '@/lib/theme-script'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'OA Digital | Command Center',
  description: 'Internal business dashboard for OA Digital Solutions',
  icons: {
    icon: '/oa-logo.jpeg',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const token = await getToken()
  return (
    <html lang="en" suppressHydrationWarning data-theme="light">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <ConvexClientProvider initialToken={token}>
          <RoleProvider>{children}</RoleProvider>
        </ConvexClientProvider>
      </body>
    </html>
  )
}
