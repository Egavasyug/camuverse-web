import slidesData from './slides.json'

export const metadata = { title: 'Slides' }

export default function SlidesPage() {
  const slides = slidesData.slides || []
  return (
    <div className="space-y-8">
      <h1>Slides</h1>
      {slides.map((s) => (
        <section key={s.index} className="space-y-3">
          <h2 className="text-lg font-semibold">Slide {s.index}</h2>
          <div className="flex flex-wrap gap-3">
            {s.images?.map((src, i) => (
              <img key={i} src={src} alt={`Slide ${s.index} image ${i + 1}`} className="max-h-48 rounded border" />
            ))}
          </div>
          {s.bullets?.length ? (
            <ul className="list-disc pl-6">
              {s.bullets.map((b: string, i: number) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  )
}

