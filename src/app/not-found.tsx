import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-start justify-center bg-ivory px-[clamp(1rem,4.5vw,4rem)]">
      <p className="kicker mb-8">Page not found</p>
      <h1 className="display display-xl max-w-[12ch] text-olive-deep">
        This moment <em>slipped away.</em>
      </h1>
      <p className="lede mt-8">The page you were looking for has moved or is no longer available.</p>
      <div className="mt-12 flex flex-wrap gap-6">
        <Link href="/" className="btn btn-solid">Go to the homepage</Link>
        <Link href="/stories" className="text-link text-olive-deep">See our stories</Link>
      </div>
    </main>
  )
}
