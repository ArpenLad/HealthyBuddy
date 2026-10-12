'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[HealthyBuddy] Web app error:', error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f6f2] px-6 text-[#24313b]">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
        <p className="mb-3 text-xs font-extrabold tracking-[0.18em] text-[#e86f51]">HEALTHYBUDDY</p>
        <h1 className="mb-3 text-2xl font-bold">Something went wrong</h1>
        <p className="mb-6 text-sm leading-6 text-[#7a878d]">Your progress is safe. Try loading this screen again.</p>
        <button onClick={() => reset()} className="rounded-xl bg-[#e86f51] px-5 py-3 text-sm font-bold text-white hover:bg-[#d96147]">Try again</button>
      </section>
    </main>
  )
}
