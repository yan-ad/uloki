import './globals.css'
import { RootProvider } from 'fumadocs-ui/provider/next'
import type { ReactNode } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'

interface LayoutProps {
  readonly children: ReactNode
}

const Layout = ({ children }: LayoutProps) => (
  <html lang="en" suppressHydrationWarning>
    <body className="flex min-h-screen flex-col">
      <RootProvider
        theme={{
          defaultTheme: undefined,
          enableSystem: true,
        }}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </RootProvider>
    </body>
  </html>
)

export default Layout
