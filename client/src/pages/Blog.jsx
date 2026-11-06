import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from "framer-motion";
import { getBlogsAPI } from "../services/api";
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Share2,
  Bookmark,
  Sparkles,
  X,
  HeartHandshake,
  Search,
} from "lucide-react";

/* ==================================================================
   Spiritual Articles & Blog – Sri Sri Chintamoni Kunja Foundation
   Route: /blog · React + Tailwind v3 · Framer Motion
================================================================== */

const asset = (n) => encodeURI(`/assets/${n}`);
const A = {
  golden: asset("Krishna’s Golden Riverside Devotion.png"),
  temple: asset("Nabadwip Dham Temple in Sunshine.png"),
  kirtan: asset("Golden Kirtan by the Sacred Ghats.png"),
  altar: asset("Opulent Gaura-Nitai and Madan Mohan Altar.png"),
  radhaKrishna: asset("Radha and Krishna by the Riverside.png"),
  procession: asset("Devotional Procession Before Lord Jagannath.png"),
};

const serif = { fontFamily: "'Cormorant Garamond','Playfair Display',serif" };
const deva = { fontFamily: "'Noto Serif Devanagari',serif" };
const beng = { fontFamily: "'Noto Serif Bengali',serif" };
const frame = "border border-[#C59A52] shadow-[0_0_0_6px_#FFF9ED,0_0_0_7px_rgba(197,154,82,.6)]";

function Reveal({ children, className = "", delay = 0 }) {
  const calm = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={calm ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function Parallax({ src, alt, speed = 40, className = "" }) {
  const ref = useRef(null);
  const calm = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], calm ? [0, 0] : [-speed, speed]);
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        style={{ y }}
        className="absolute inset-0 h-full w-full scale-[1.18] object-cover"
      />
    </div>
  );
}

function Lotus({ className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#C59A52] sm:w-28" />
      <svg viewBox="0 0 60 36" className="h-7 w-12" fill="none" stroke="#C59A52" strokeWidth="1.2">
        <path d="M30 4C38 12 38 24 30 32C22 24 22 12 30 4Z" />
        <path d="M30 32C22 30 12 24 10 12C18 12 26 18 30 32Z" />
        <path d="M30 32C38 30 48 24 50 12C42 12 34 18 30 32Z" />
        <path d="M30 32C18 34 6 30 2 22C10 20 22 24 30 32Z" />
        <path d="M30 32C42 34 54 30 58 22C50 20 38 24 30 32Z" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#C59A52] sm:w-28" />
    </div>
  );
}

const ARTICLES = [
  {
    id: "ramsundar-vidyalankar-reformer",
    title: "Sri Ramsundar Vidyalankar: Academic Pioneer & Social Reformer of 19th-Century Bengal",
    bengali: "শ্রী রামসুন্দর বিদ্যালঙ্কার ও সমাজ সংস্কার",
    category: "Heritage & History",
    date: "14 April 2026",
    readTime: "7 min read",
    author: "Seva Research Desk",
    image: A.temple,
    summary:
      "A contemporary of Raja Ram Mohan Roy, Sri Ramsundar Vidyalankar established Sri Sri Chintamoni Kunja in 1809. Discover how he used Gaudiya Vaishnav philosophy to advocate for mass literacy and oppose medieval caste discrimination.",
    content: `
      Sri Ramsundar Vidyalankar, affectionately and reverently known as Sri Chintamoni Goswami by the Vaishnav assembly, stands as one of the most luminous yet humble personalities of the Bengal Renaissance. While Raja Ram Mohan Roy worked through institutional and socio-legal frameworks in Calcutta, Vidyalankar focused on grassroots transformation in the holy town of Nabadwip Dham.

      In 1809, he established Sri Sri Chintamoni Kunja as an academic and spiritual center. Believing firmly that Lord Sri Krishna Chaitanya Dev was the greatest social reformer of his era, Vidyalankar preached that true devotion cannot coexist with untouchability, racism, or caste prejudice. 

      He opened the doors of scriptural learning to students from all social backgrounds, initiating educational drives that continue today through our Foundation's Academic Help initiative, which has supported over 2,000 students.
    `,
  },
  {
    id: "secret-of-radha-sakti",
    title: "The Mystery of Sri Radha Sakti & Gadadhar Pandit: The Pinnacle of Radha-Dasyam",
    bengali: "শ্রী রাধা শক্তি ও গদাধর পণ্ডিত প্রভুর তত্ত্ব",
    category: "Vaishnav Philosophy",
    date: "28 March 2026",
    readTime: "9 min read",
    author: "Acharya Pariwar Desk",
    image: A.radhaKrishna,
    summary:
      "In the Madhva Gaudiya Sampradaya, Sri Gadadhar Pandit Prabhu is revered as the internal hladini potency (Sri Radha Sakti) of the Supreme Lord. An insightful dive into the mood of unconditional devotional servitude.",
    content: `
      Among the Pancha Tattva, Lord Sri Gadadhar Pandit Prabhu holds an esoteric, intimate position. Classical Gaudiya texts describe him as the avatar of Srimati Radharani's transcendental devotional mood and internal pleasure potency (hladini-shakti).

      In sacred Nabadwip Dham, Mahaprabhu and Gadadhar Pandit demonstrated the inseparable harmony of divine love. The Sri Radha Sakti Gadadhar Pandit Pariwar maintains this unbroken mood of 'Radha-dasyam'—the humble desire to serve the divine pleasure of Srimati Radharani and Sri Krishna through sincere Harinam Sankirtan and self-effacing compassion for all living beings.
    `,
  },
  {
    id: "shikshastakam-social-equality",
    title: "Beyond Caste & Feudal Mindset: How Lord Chaitanya’s Shikshastakam Redefined Humanity",
    bengali: "শিক্ষ অষ্টকম ও সার্বজনীন সাম্য",
    category: "Social Reform",
    date: "12 March 2026",
    readTime: "6 min read",
    author: "Spiritual Council",
    image: A.kirtan,
    summary:
      "Tṛṇād api sunīcena taror api sahiṣṇunā—unpacking how Lord Chaitanya's eight verses dismantled centuries of feudal orthodoxy and restored spiritual equality to every soul regardless of birth.",
    content: `
      Lord Sri Krishna Chaitanya Mahaprabhu left behind eight verses of sublime spiritual instruction known as the Shikshastakam. These verses are not mere poetic devotion; they form the manifesto of a spiritual revolution.

      The third verse instructs one to become humbler than a blade of grass, more tolerant than a tree, and ready to offer all respect to others without expecting prestige. In an era marked by rigid caste hierarchies, Mahaprabhu embraced Haridas Thakur, appointed Ramananda Raya as an exalted teacher, and declared that anyone who knows the science of Krishna is a bona fide spiritual guide.

      At Sri Sri Chintamoni Kunja, we guard this egalitarian mandate fiercely, rejecting medieval feudal prejudice and maintaining unconditional service for every pilgrim.
    `,
  },
  {
    id: "zero-starvation-movement",
    title: "Zero Starvation as Divine Seva: The Sacred Science of Anna Daan in Nabadwip Dham",
    bengali: "ক্ষুধামুক্ত সমাজের ব্রত ও প্রসাদ সেবা",
    category: "Humanitarian Seva",
    date: "20 February 2026",
    readTime: "5 min read",
    author: "Foundation Seva Desk",
    image: A.procession,
    summary:
      "Why sanctified food distribution (prasadam) is considered the highest form of compassion in Vedic culture, and how our Zero Starvation Movement feeds pilgrims daily without distinction.",
    content: `
      In Vaishnav tradition, food is not merely caloric fuel; it is prasad—the sanctified mercy of the Divine. By offering nutritious, vegetarian foodstuffs prepared with devotion to Lord Madan Mohan and distributing them freely, we nourish both body and spirit.

      During pandemics, floods, and natural calamities, Sri Sri Chintamoni Kunja has distributed over one lakh meals across Nadia district. Today, our Zero Starvation Movement continues daily, ensuring that no visitor, student, or pilgrim leaves Nabadwip Dham with an empty stomach.
    `,
  },
  {
    id: "art-of-sattvic-living",
    title: "The Art of Sattvic Living: Ancient Dinacharya for Modern Peace of Mind",
    bengali: "সাত্ত্বিক জীবনধারা ও মানসিক প্রশান্তি",
    category: "Art of Living",
    date: "05 February 2026",
    readTime: "8 min read",
    author: "Dr. K. Chakraborty",
    image: A.golden,
    summary:
      "Harmonizing daily routines, dietary discipline, mindful breathing, and personal mantra meditation to cultivate emotional equanimity in a fast-paced world.",
    content: `
      Modern life is inundated with cognitive overload, sensory distraction, and chronic stress. The Vaishnav science of 'Dinacharya' (daily sacred rhythm) provides a timeless sanctuary for mental balance.

      Beginning with early morning reflection (Brahma Muhurta), cultivating mindful breathing during mantra japa, partaking of wholesome sattvic nutrition, and dedicating at least one action every day to selfless service (seva) creates psychological resilience and inner stillness.
    `,
  },
];

const CATEGORIES = ["All Articles", "Heritage & History", "Vaishnav Philosophy", "Social Reform", "Humanitarian Seva", "Art of Living"];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All Articles");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleList, setArticleList] = useState(ARTICLES);

  useEffect(() => {
    async function loadDynamicBlogs() {
      try {
        const dynamicBlogs = await getBlogsAPI();
        if (dynamicBlogs && dynamicBlogs.length > 0) {
          const existingIds = new Set(ARTICLES.map((a) => a.id || a.title));
          const newOnes = dynamicBlogs
            .filter((b) => !existingIds.has(b._id) && !existingIds.has(b.title))
            .map((b) => ({
              id: b._id,
              title: b.title,
              bengali: b.bengali,
              category: b.category,
              date: new Date(b.createdAt || Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
              readTime: b.readTime || "5 min read",
              author: b.author || "Sri Sri Chintamoni Kunja",
              image: b.image || A.altar,
              summary: b.excerpt || (b.content ? b.content.slice(0, 160) + "..." : ""),
              content: b.content,
            }));
          if (newOnes.length > 0) {
            setArticleList([...newOnes, ...ARTICLES]);
          }
        }
      } catch (e) {}
    }
    loadDynamicBlogs();
  }, []);

  const filtered = articleList.filter((art) => {
    const matchesCat = activeCategory === "All Articles" || art.category === activeCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.summary && art.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-[#FFF9ED] font-[Inter] text-[#39251D] antialiased">
      {/* Header Banner */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-[#39251D] text-center text-[#FFF9ED]">
        <Parallax src={A.kirtan} alt="Spiritual articles background" speed={60} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#39251D]/80 via-[#39251D]/60 to-[#39251D]/95" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 py-24">
          <p className="font-serif text-sm font-semibold tracking-widest text-[#E3B873]" style={beng}>
            জ্ঞান ও ভক্তি সাধনা • নবদ্বীপ ধাম
          </p>
          <h1 className="mt-3 font-serif text-5xl font-bold tracking-tight text-[#FFF9ED] sm:text-7xl" style={serif}>
            Spiritual Articles & Blog
          </h1>
          <p className="mt-3 font-serif text-2xl italic text-[#E8B94F] sm:text-3xl" style={serif}>
            Discourses, Heritage Chronicles & Vaishnav Wisdom
          </p>
          <p className="mx-auto mt-4 max-w-2xl font-[Inter] text-sm text-[#FFF9ED]/80 sm:text-base">
            Delve into sacred essays on Gaudiya philosophy, the social equality movement of Lord Chaitanya, and the historical records of Sri Sri Chintamoni Kunja.
          </p>

          <nav
            aria-label="Breadcrumb"
            className="mt-6 flex items-center justify-center gap-2 font-[Inter] text-xs font-semibold uppercase tracking-wider text-[#FFF9ED]/75"
          >
            <Link to="/" className="transition-colors hover:text-[#E3B873]">
              Home
            </Link>
            <span className="text-[#C59A52]">/</span>
            <span className="text-[#E8B94F]">Blog</span>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#971010] via-[#C59A52] to-[#971010]" />
      </section>

      {/* Main Container */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        {/* Intro & Search Bar */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-[#C59A52]/30 pb-8">
          <div>
            <p className="font-[Inter] text-xs font-semibold tracking-[0.25em] text-[#971515]">
              SACRED PUBLICATIONS
            </p>
            <h2 className="mt-1 font-serif text-3xl font-bold text-[#78372B] sm:text-4xl" style={serif}>
              Words of Bhakti, History & Seva
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search articles by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#C59A52]/40 bg-white px-4 py-2.5 text-xs text-[#39251D] placeholder-[#39251D]/50 focus:border-[#971515] focus:outline-none focus:ring-1 focus:ring-[#971515]"
            />
            <Search size={16} className="absolute right-3.5 top-3 text-[#C59A52]" />
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-[#971515] text-white shadow-md"
                  : "border border-[#C59A52]/40 bg-white text-[#78372B] hover:bg-[#FFF9ED]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Article Banner */}
        {activeCategory === "All Articles" && searchQuery === "" && ARTICLES.length > 0 && (
          <Reveal className="mt-12">
            <div className="grid overflow-hidden rounded-3xl border-2 border-[#C59A52]/50 bg-white shadow-md lg:grid-cols-12 transition-all hover:border-[#971515] hover:shadow-xl">
              <div className="lg:col-span-6 relative aspect-[16/10] lg:aspect-auto">
                <img
                  src={ARTICLES[0].image}
                  alt={ARTICLES[0].title}
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-4 top-4 rounded-full bg-[#971515] px-3.5 py-1 text-xs font-bold text-white shadow-md">
                  FEATURED DISCOURSE
                </span>
              </div>
              <div className="lg:col-span-6 flex flex-col justify-between p-8 sm:p-12">
                <div>
                  <div className="flex items-center gap-3 text-xs text-[#C59A52] font-semibold">
                    <span>{ARTICLES[0].category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {ARTICLES[0].readTime}</span>
                  </div>
                  <h3 className="mt-3 font-serif text-3xl font-bold text-[#78372B] hover:text-[#971515] cursor-pointer" style={serif} onClick={() => setSelectedArticle(ARTICLES[0])}>
                    {ARTICLES[0].title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#39251D]/85">
                    {ARTICLES[0].summary}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#C59A52]/20 flex items-center justify-between">
                  <span className="text-xs text-[#39251D]/70">{ARTICLES[0].date}</span>
                  <button
                    onClick={() => setSelectedArticle(ARTICLES[0])}
                    className="inline-flex items-center gap-2 font-bold text-sm text-[#971515] hover:text-[#C59A52]"
                  >
                    <span>Read Full Article</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* Articles Grid */}
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((art, idx) => (
            <Reveal key={art.id} delay={idx * 0.08}>
              <div className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[#C59A52]/40 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#971515] hover:shadow-xl">
                <div>
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#39251D]">
                    <img
                      src={art.image}
                      alt={art.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute left-3.5 top-3.5 rounded-full bg-[#971515] px-3 py-1 font-[Inter] text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                      {art.category}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-[11px] text-[#A88955] font-semibold">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {art.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {art.readTime}</span>
                    </div>

                    <h3
                      onClick={() => setSelectedArticle(art)}
                      className="mt-3 font-serif text-2xl font-bold text-[#78372B] transition-colors group-hover:text-[#971515] cursor-pointer"
                      style={serif}
                    >
                      {art.title}
                    </h3>

                    <p className="mt-3 font-[Inter] text-xs leading-relaxed text-[#39251D]/80 line-clamp-3">
                      {art.summary}
                    </p>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="border-t border-[#C59A52]/20 bg-[#FFF9ED]/50 p-4 px-6">
                  <button
                    onClick={() => setSelectedArticle(art)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#971515] transition-colors group-hover:text-[#C59A52]"
                  >
                    <span>Read Full Discourse</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Modal / Reader View for full article */}
        <AnimatePresence>
          {selectedArticle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
              onClick={() => setSelectedArticle(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#C59A52] bg-[#FFF9ED] p-7 sm:p-10 shadow-2xl text-[#39251D]"
              >
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="absolute right-5 top-5 rounded-full border border-[#C59A52]/40 bg-white p-2 text-[#78372B] hover:bg-[#971515] hover:text-white transition"
                >
                  <X size={18} />
                </button>

                <span className="rounded-full bg-[#971515] px-3.5 py-1 text-xs font-bold text-white uppercase tracking-wider">
                  {selectedArticle.category}
                </span>

                <h2 className="mt-4 font-serif text-3xl sm:text-4xl font-bold text-[#78372B]" style={serif}>
                  {selectedArticle.title}
                </h2>

                <div className="mt-3 flex items-center gap-4 text-xs text-[#A88955] border-b border-[#C59A52]/30 pb-4">
                  <span>Published: {selectedArticle.date}</span>
                  <span>•</span>
                  <span>By: {selectedArticle.author}</span>
                  <span>•</span>
                  <span>{selectedArticle.readTime}</span>
                </div>

                <div className="mt-6 space-y-4 font-[Inter] text-sm leading-relaxed text-[#39251D]/90 whitespace-pre-line">
                  {selectedArticle.content}
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-[#C59A52]/30 pt-4">
                  <Link
                    to="/donate"
                    className="inline-flex items-center gap-2 rounded-full bg-[#E8B94F] px-6 py-2.5 font-[Inter] text-xs font-bold text-[#54251E] hover:bg-[#F4D27E] transition"
                  >
                    <HeartHandshake size={15} />
                    <span>Support This Seva</span>
                  </Link>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="text-xs font-semibold text-[#78372B] hover:underline"
                  >
                    Close Reader
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
