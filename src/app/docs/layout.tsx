"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const nav = [
    { href: '/docs', label: 'Overview' },
    { href: '/docs/governance', label: 'Governance' },
    { href: '/docs/ecosystem', label: 'Ecosystem' },
    { href: '/docs/pdf', label: 'PDF' }
  ]
  const hideNav = pathname === '/docs/pdf'
  return (
    <div className="md:flex min-h-[calc(100dvh-57px)]">
      {!hideNav && (
        <aside className="md:w-64 border-b md:border-b-0 md:border-r border-gray-200 p-4 space-y-2 bg-white/40 dark:bg-zinc-900/30">
          <h2 className="text-sm font-semibold text-gray-600">Docs</h2>
          <nav className="flex md:flex-col gap-3 text-sm">
            {nav.map(item => (
              <Link key={item.href} href={item.href} className="text-blue-600 hover:underline">
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
      )}
      <section className={`flex-1 ${hideNav ? 'p-0' : 'p-6'}`}>
        <div className={`dark:prose-invert ${hideNav ? '' : 'prose max-w-none'}`}>
          {children}
        </div>
      </section>
    </div>
  )
}

