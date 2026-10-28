'use client'

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-[100svh] flex-col items-start justify-center bg-ivory px-[clamp(1rem,4.5vw,4rem)]">
      <p className="kicker mb-8">Something went wrong</p>
      <h1 className="display display-lg max-w-[14ch] text-olive-deep">This page didn&rsquo;t load.</h1>
      <p className="lede mt-8">Please try again in a moment.</p>
      <button type="button" onClick={reset} className="btn btn-solid mt-12">Try again</button>
    </main>
  )
}
