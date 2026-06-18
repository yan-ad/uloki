import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { Icons } from '@/components/icons'

export const baseOptions = (): BaseLayoutProps => ({
  nav: {
    title: (
      <span className="flex items-center gap-2">
        <Icons.logo className="size-5" />
        <span className="font-semibold text-lg tracking-tight">uloki</span>
      </span>
    ),
    url: '/',
  },
  links: [
    {
      text: 'Docs',
      url: '/introduction',
      active: 'nested-url',
    },
    {
      text: 'GitHub',
      url: 'https://github.com/yan-ad/uloki',
      active: 'none',
    },
  ],
  githubUrl: 'https://github.com/yan-ad/uloki',
  themeSwitch: {
    mode: 'light-dark-system',
  },
})
