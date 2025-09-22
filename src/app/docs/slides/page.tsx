export const metadata = { title: 'Slides' }

export default function SlidesPage() {
  return (
    <div>
      <h1>Slides</h1>
      <p>
        The slide viewer is temporarily simplified while we finalize MDX runtime
        compatibility with React 19. You can view the PDF version instead:
      </p>
      <p>
        <a className="text-blue-600 underline" href="/docs/CammunityDAO_Overview.pdf">
          Open CammunityDAO_Overview.pdf
        </a>
      </p>
    </div>
  )
}

