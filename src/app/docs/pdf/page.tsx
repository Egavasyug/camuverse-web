export default function PdfViewer() {
  const pdfUrl = "/docs/CammunityDAO_Overview.pdf"
  return (
    <div className="w-full h-[80vh] border rounded">
      <object data={pdfUrl} type="application/pdf" className="w-full h-full">
        <iframe src={pdfUrl} className="w-full h-full" title="CammunityDAO Overview PDF" />
      </object>
      <div className="mt-2 text-sm">
        If the PDF does not display, <a className="text-blue-600 underline" href={pdfUrl} target="_blank" rel="noreferrer">open it in a new tab</a>.
      </div>
    </div>
  )
}
