export const metadata = { title: 'Cammunity DAO LLC Whitepaper' }

export default function WhitepaperPage() {
  return (
    <div className="h-[calc(100dvh-100px)]">
      <object data="/docs/CammunityDAO_Overview.pdf" type="application/pdf" width="100%" height="100%">
        <p>
          PDF preview unavailable.{' '}
          <a className="text-blue-600 underline" href="/docs/CammunityDAO_Overview.pdf">Download the whitepaper</a>.
        </p>
      </object>
    </div>
  )
}
