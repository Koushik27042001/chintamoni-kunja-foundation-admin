import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'

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

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9ED]">
      <ScrollToTop />
      <Navbar />
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
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin-panel" element={<AdminPanel />} />

            <Route
              path="/blog"
              element={
                <PagePlaceholder
                  title="Spiritual Articles & Blog"
                  subtitle="Discourses, Katha & Vaishnav Heritage"
                  description="Read inspiring writings, discourses on Bhakti, biographical chronicles of revered saints, and announcements from Sri Sri Chintamoni Kunja Foundation."
                  badge="Knowledge & Publications"
                />
              }
            />

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
      <Footer />
    </div>
  )
}

export default App
