import React, { Suspense, lazy, useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import { recordPageStay } from './services/analyticsTracker.js'

// Static initial route for maximum First Contentful Paint speed
import Home from './pages/Home.jsx'
import PagePlaceholder from './pages/PagePlaceholder.jsx'

// Lazy-loaded routes for optimal chunk splitting and fast page transitions
const About = lazy(() => import('./pages/About.jsx'))
const ArtOfLiving = lazy(() => import('./pages/ArtOfLiving.jsx'))
const ContactUs = lazy(() => import('./pages/ContactUs.jsx'))
const Donate = lazy(() => import('./pages/Donate.jsx'))
const Gallery = lazy(() => import('./pages/Gallery.jsx'))
const GuruPranali = lazy(() => import('./pages/GuruPranali.jsx'))
const Diksha = lazy(() => import('./pages/Diksha.jsx'))
const Events = lazy(() => import('./pages/Events.jsx'))
const Blog = lazy(() => import('./pages/Blog.jsx'))
const Items = lazy(() => import('./pages/Items.jsx'))
const AdminPanel = lazy(() => import('./pages/AdminPanel.jsx'))

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FFF9ED] px-4 text-center">
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-2 border-[#C59A52]/30 border-t-[#971515]" />
        <span
          className="absolute select-none font-serif text-2xl text-[#C59A52]"
          style={{ fontFamily: "'Noto Serif Devanagari', serif" }}
          aria-hidden="true"
        >
          ॐ
        </span>
      </div>
      <p className="mt-4 font-serif text-sm tracking-widest text-[#78372B]">
        LOADING SACRED PAGES...
      </p>
    </div>
  )
}

// Confidential Admin Route: Defaults to obfuscated slug, configurable via VITE_ADMIN_PATH
export const ADMIN_ROUTE_PATH = (
  (import.meta.env.VITE_ADMIN_PATH || '/ckf-portal-seva-control-2026')
    .trim()
    .replace(/\/+$/, '') || '/ckf-portal-seva-control-2026'
)

function App() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith(ADMIN_ROUTE_PATH)

  // Real-time user page stay & connectivity tracker
  const startTimeRef = useRef(Date.now())
  const prevPathRef = useRef(location.pathname)

  useEffect(() => {
    const prevPath = prevPathRef.current
    const duration = (Date.now() - startTimeRef.current) / 1000

    if (prevPath && duration > 0.5) {
      recordPageStay(prevPath, duration, location.pathname)
    }

    startTimeRef.current = Date.now()
    prevPathRef.current = location.pathname

    const handleBeforeUnload = () => {
      const exitDuration = (Date.now() - startTimeRef.current) / 1000
      if (exitDuration > 0.5) {
        recordPageStay(location.pathname, exitDuration)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [location.pathname])

  return (
    <div className={`flex flex-col min-h-screen ${isAdmin ? 'bg-[#0E0A09] text-[#FFF9ED]' : 'bg-[#FFF9ED]'}`}>
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/about" element={<About />} />
            <Route path="/art-of-living" element={<ArtOfLiving />} />
            <Route path="/items" element={<Items />} />
            <Route path="/donate" element={<Donate />} />

            <Route path="/guru-pranali" element={<GuruPranali />} />

            <Route path="/diksha" element={<Diksha />} />

            <Route path="/gallery" element={<Gallery />} />

            <Route path="/events" element={<Events />} />

            {/* Secure Confidential Admin Control Portal */}
            <Route path={ADMIN_ROUTE_PATH} element={<AdminPanel />} />
            <Route path={`${ADMIN_ROUTE_PATH}/*`} element={<AdminPanel />} />

            {/* Decoy 404 for obsolete / public /admin endpoints to deceive scanners & crawlers */}
            <Route
              path="/admin"
              element={
                <PagePlaceholder
                  title="Page Not Found"
                  subtitle="404 — Sacred Path Not Located"
                  description="The page you requested could not be found. Please use the navigation links above or return to our homepage."
                  badge="Navigation"
                />
              }
            />
            <Route
              path="/admin-panel"
              element={
                <PagePlaceholder
                  title="Page Not Found"
                  subtitle="404 — Sacred Path Not Located"
                  description="The page you requested could not be found. Please use the navigation links above or return to our homepage."
                  badge="Navigation"
                />
              }
            />

            <Route path="/blog" element={<Blog />} />

            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/contact" element={<ContactUs />} />

            {/* Catch-all 404 */}
            <Route
              path="*"
              element={
                <PagePlaceholder
                  title="Page Not Found"
                  subtitle="404 — Sacred Path Not Located"
                  description="The page you requested could not be found. Please use the navigation links above or return to our homepage."
                  badge="Navigation"
                />
              }
            />
          </Routes>
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
      <Analytics />
    </div>
  )
}

export default App
