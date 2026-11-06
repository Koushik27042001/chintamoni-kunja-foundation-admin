import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import ArtOfLiving from './pages/ArtOfLiving.jsx'
import Items from './pages/Items.jsx'
import Donate from './pages/Donate.jsx'
import Gallery from './pages/Gallery.jsx'
import ContactUs from './pages/ContactUs.jsx'
import PagePlaceholder from './pages/PagePlaceholder.jsx'

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9ED]">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/about" element={<About />} />
          <Route path="/art-of-living" element={<ArtOfLiving />} />
          <Route path="/items" element={<Items />} />
          <Route path="/donate" element={<Donate />} />

          <Route
            path="/guru-pranali"
            element={
              <PagePlaceholder
                title="Our Devotional Lineage"
                subtitle="Sri Radha Sakti Gadadhar Pandit Pariwar"
                description="Delve into the unbroken spiritual succession tracing back to Sri Krishna Chaitanya Mahaprabhu and His intimate associate Sri Gadadhar Pandit Prabhu in sacred Nabadwip Dham."
                badge="Parampara & Heritage"
              />
            }
          />

          <Route
            path="/diksha"
            element={
              <PagePlaceholder
                title="Diksha Tradition"
                subtitle="Sacred Initiation & Harinam"
                description="Understand the principles, preparatory guidance, and solemn significance of receiving Vaishnav Diksha and Harinam initiation under qualified spiritual lineage."
                badge="Spiritual Initiation"
              />
            }
          />

          <Route path="/gallery" element={<Gallery />} />

          <Route
            path="/events"
            element={
              <PagePlaceholder
                title="Upcoming Events & Utsavs"
                subtitle="Vaishnav Festivals in Nabadwip Dham"
                description="Annual celebrations including Sri Gaur Purnima, Janmashtami, Rath Yatra, Radhashtami, and sanctified memorial gatherings in Nabadwip Dham."
                badge="Festivals & Calendar"
              />
            }
          />

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
      </main>
      <Footer />
    </div>
  )
}

export default App
