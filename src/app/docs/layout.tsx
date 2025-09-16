export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="p-6">
      <div className="prose max-w-none dark:prose-invert">
        {children}
      </div>
    </section>
  )
}

