import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'
import TutorialFlow from '@/components/onboarding/TutorialFlow'
import { ThemeProvider } from '@/hooks/useTheme'
import { WebSocketProvider } from '@/providers/WebSocketProvider'
import { createWebSocketConfig } from '@/providers/WebSocketProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CurrentDao - Decentralized Energy Marketplace',
  description: 'Trade energy, participate in DAO governance, and build a sustainable future with blockchain technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Create WebSocket configuration
  const wsConfig = createWebSocketConfig(
    (typeof window !== 'undefined' && (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_WS_URL) || 'ws://localhost:8080/ws',
    {
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      enableCompression: true
    }
  );

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <WebSocketProvider config={wsConfig} autoConnect={true} enableLogging={false}>
            <Providers>
              <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                  {children}
                </main>
                <Toaster position="top-right" />
                <TutorialFlow />
              </div>
            </Providers>
          </WebSocketProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
