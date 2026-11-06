import React from 'react'
import { Link } from 'react-router-dom'
import { HeartHandshake, Phone, ArrowLeft } from 'lucide-react'

export default function PagePlaceholder({
  title = 'Page Title',
  subtitle = 'Sri Sri Chintamoni Kunja Foundation',
  description = 'Welcome to Sri Sri Chintamoni Kunja in Nabadwip Dham. This section is currently being enriched with historical records, sacred discourses, and archival documentation.',
  badge = 'Spiritual Heritage',
}) {
  return (
    <div className="min-h-[75vh] bg-[#FFF9ED] text-[#39251D]">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#39251D] via-[#4A2D23] to-[#39251D] py-20 text-center text-[#FFF9ED]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C59A52_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 mx-auto max-w-4xl px-4">
          <span className="inline-block rounded-full border border-[#C59A52]/40 bg-[#C59A52]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[2px] text-[#E3B873]">
            {badge}
          </span>
          <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-[#FFF9ED] sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-3 font-serif text-xl italic text-[#C59A52] sm:text-2xl">
            {subtitle}
          </p>
        </div>

        {/* Decorative Wave / Border */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#971010] via-[#C59A52] to-[#971010]" />
      </section>

      {/* Content Section */}
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <div className="rounded-2xl border border-[#EDE0C9] bg-white p-8 shadow-sm sm:p-12">
          <p className="text-base leading-relaxed text-[#54382B] sm:text-lg">
            {description}
          </p>

          <div className="my-8 h-px bg-gradient-to-r from-transparent via-[#C59A52]/40 to-transparent" />

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#78372B]/30 px-6 py-2.5 text-sm font-semibold text-[#78372B] transition-colors hover:bg-[#78372B] hover:text-[#FFF9ED]"
            >
              <ArrowLeft size={16} />
              Return Home
            </Link>

            <div className="flex items-center gap-3">
              <a
                href="tel:+919474905910"
                className="inline-flex items-center gap-2 rounded-full border border-[#C59A52]/40 bg-[#FFF9ED] px-5 py-2.5 text-sm font-semibold text-[#971515] transition-colors hover:bg-[#FBEEC8]"
              >
                <Phone size={15} />
                Contact Temple
              </a>

              <Link
                to="/donate"
                className="inline-flex items-center gap-2 rounded-full bg-[#D98232] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#BD6D22]"
              >
                <HeartHandshake size={16} />
                Support Seva
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

