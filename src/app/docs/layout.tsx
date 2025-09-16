import Link from 'next/link'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const nav = [
    { href: '/docs', label: 'Overview' },
    { href: '/docs/governance', label: 'Governance' },
    { href: '/docs/ecosystem', label: 'Ecosystem' },
    { href: '/docs/slides', label: 'Slides' },
    { href: '/docs/pdf', label: 'PDF' }
  ]
  return (
    <div className="md:flex min-h-[calc(100dvh-57px)]">
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
      <section className="flex-1 p-6">
        <div className="prose max-w-none dark:prose-invert">
          {children}
        </div>
      </section>
    </div>
  )
}

