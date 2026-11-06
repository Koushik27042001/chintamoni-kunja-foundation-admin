import React from 'react'
import { Link } from 'react-router-dom'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  HeartHandshake,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react'

function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { to: '/', label: 'Home' },
    { to: '/about-us', label: 'About Us' },
    { to: '/art-of-living', label: 'The Art of Living' },
    { to: '/guru-pranali', label: 'Our Devotional Lineage' },
    { to: '/diksha', label: 'Diksha Tradition' },
    { to: '/gallery', label: 'Our Gallery' },
    { to: '/events', label: 'Upcoming Events' },
    { to: '/blog', label: 'Blog' },
    { to: '/contact-us', label: 'Contact Us' },
    { to: '/items', label: 'Collection Archive' },
  ]

  const socialLinks = [
    {
      label: 'Facebook',
      href: '#',
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      label: 'YouTube',
      href: '#',
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      label: 'Instagram',
      href: '#',
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
  ]

  return (
    <footer className="relative bg-[#2D1B14] text-[#EDE0C9]">
      {/* Decorative Golden Top Border */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#971010] via-[#C59A52] to-[#971010]" />

      {/* Main Footer Content */}
      <div className="mx-auto max-w-[1600px] px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          
          {/* Col 1: Brand & Heritage */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/images/chintamoni-kunja-logo.png"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = "/assets/logo/chintamoni-kunja-modern-logo.svg"
                }}
                alt="Sri Sri Chintamoni Kunja Foundation logo"
                className="h-16 w-16 shrink-0 rounded-full border-2 border-[#C59A52]/40 bg-[#FFF9ED] p-1 object-contain"
              />
              <div>
                <h3 className="font-serif text-xl font-bold italic leading-tight text-[#FFF9ED]">
                  Sri Sri Chintamoni Kunja
                </h3>
                <p className="text-sm font-medium text-[#C59A52]">Nabadwip Dham</p>
                <p className="text-[10px] uppercase tracking-wider text-[#EDE0C9]/60">
                  Est. 1809
                </p>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-[#EDE0C9]/80">
              A consecrated sanctuary of Madhva Gaudiya Vaishnav tradition in Nabadwip Dham,
              perpetuating unalloyed devotion, scriptural scholarship, and compassionate seva
              for generations.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#C59A52]/30 bg-[#39251D] text-[#C59A52] transition-all hover:border-[#C59A52] hover:bg-[#C59A52] hover:text-[#2D1B14]"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="border-b border-[#C59A52]/30 pb-2 font-serif text-lg font-bold tracking-wide text-[#FFF9ED]">
              Spiritual Navigation
            </h4>
            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {quickLinks.slice(0, 7).map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="group flex items-center text-sm text-[#EDE0C9]/80 transition-colors hover:text-[#E3B873]"
                  >
                    <ChevronRight size={14} className="mr-1.5 text-[#C59A52] transition-transform group-hover:translate-x-1" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact Details */}
          <div>
            <h4 className="border-b border-[#C59A52]/30 pb-2 font-serif text-lg font-bold tracking-wide text-[#FFF9ED]">
              Contact & Pilgrimage
            </h4>
            <ul className="mt-4 space-y-3.5 text-sm">
              <li className="flex items-start gap-3 text-[#EDE0C9]/85">
                <MapPin size={18} className="mt-1 shrink-0 text-[#C59A52]" />
                <span>
                  Sri Sri Chintamoni Kunja,
                  <br />
                  Nabadwip Dham, Nadia,
                  <br />
                  West Bengal – 741302, India
                </span>
              </li>
              <li>
                <a
                  href="tel:+919474905910"
                  className="flex items-center gap-3 whitespace-nowrap text-[#EDE0C9]/85 transition-colors hover:text-[#E3B873]"
                >
                  <Phone size={18} className="shrink-0 text-[#C59A52]" />
                  <span className="whitespace-nowrap">+91 9474905910</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@chintamonikunja.org"
                  className="flex items-center gap-3 text-[#EDE0C9]/85 transition-colors hover:text-[#E3B873]"
                >
                  <Mail size={18} className="shrink-0 text-[#C59A52]" />
                  <span>contact@chintamonikunja.org</span>
                </a>
              </li>
            </ul>

            {/* Support Seva CTA */}
            <div className="mt-5 rounded-lg border border-[#C59A52]/30 bg-[#39251D]/80 p-3.5">
              <Link
                to="/donate"
                className="group flex items-center justify-between text-sm font-semibold text-[#FFF9ED] transition-colors hover:text-[#E3B873]"
              >
                <span className="flex items-center gap-2">
                  <HeartHandshake size={18} className="text-[#E8B94F]" />
                  Donate to Foundation Seva
                </span>
                <ArrowUpRight size={15} className="text-[#C59A52] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Col 4: Darshan & Visiting Hours */}
          <div>
            <h4 className="border-b border-[#C59A52]/30 pb-2 font-serif text-lg font-bold tracking-wide text-[#FFF9ED]">
              Temple Darshan Timings
            </h4>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-[#E3B873]">
                <Clock size={16} />
                <span className="font-semibold">Daily Schedule</span>
              </div>
              <div className="rounded-lg border border-[#C59A52]/20 bg-[#39251D]/50 p-3 text-xs leading-relaxed text-[#EDE0C9]/85">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="font-medium text-[#FFF9ED]">Mangala Aarti:</span>
                  <span>4:30 AM – 5:00 AM</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="font-medium text-[#FFF9ED]">Darshan:</span>
                  <span>7:30 AM – 12:30 PM</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="font-medium text-[#FFF9ED]">Sandhya Aarti:</span>
                  <span>6:00 PM – 7:00 PM</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium text-[#FFF9ED]">Shayan Aarti:</span>
                  <span>8:30 PM</span>
                </div>
              </div>

              <p className="text-[11px] italic text-[#C59A52]/90">
                * Timings may vary during Vaishnav Mahotsavs and seasonal Utsavs.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#C59A52]/20 bg-[#23150F]">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-3 px-5 py-4 text-xs text-[#EDE0C9]/60 sm:flex-row sm:px-8">
          <p>
            &copy; {currentYear} Sri Sri Chintamoni Kunja Foundation. All rights reserved.
          </p>
          <p className="text-[11px] text-[#C59A52]">
            Nabadwip Dham • Bengal • Sri Radha Sakti Gadadhar Pandit Pariwar
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
