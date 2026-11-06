import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { getEventsAPI } from "../services/api";
import {
  Calendar,
  Clock,
  MapPin,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  Users,
  Utensils,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

/* ==================================================================
   Upcoming Events & Utsavs – Sri Sri Chintamoni Kunja Foundation
   Route: /events · React + Tailwind v3 · Framer Motion
================================================================== */

const asset = (n) => encodeURI(`/assets/${n}`);
const A = {
  procession: asset("Devotional Procession Before Lord Jagannath.png"),
  temple: asset("Nabadwip Dham Temple in Sunshine.png"),
  kirtan: asset("Golden Kirtan by the Sacred Ghats.png"),
  altar: asset("Opulent Gaura-Nitai and Madan Mohan Altar.png"),
  golden: asset("Krishna’s Golden Riverside Devotion.png"),
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

const FESTIVALS = [
  {
    id: "gaur-purnima",
    title: "Sri Gaur Purnima Mahotsav",
    bengali: "শ্রী গৌর পূর্ণিমা মহোৎসব",
    season: "Phalguna Purnima (Feb / March)",
    time: "All Day • Mangala to Midnight Sandhya Aarti",
    category: "Major Utsav",
    desc: "The sacred divine advent celebration of Lord Sri Krishna Chaitanya Mahaprabhu in sacred Nabadwip Dham. Features Maha Abhishek of Gaura-Nitai deities with panchamrita, 24-hour Akhanda Harinam Sankirtan, philosophical discourses, and mass distribution of sanctified Mahaprasadam.",
    seva: "Anna Daan & Altar Flowers",
    image: A.golden,
  },
  {
    id: "janmashtami",
    title: "Sri Krishna Janmashtami & Nandotsav",
    bengali: "শ্রীকৃষ্ণ জন্মাষ্টমী ও নন্দোৎসব",
    season: "Bhadra Krishna Ashtami (August / September)",
    time: "Midnight Abhishek & Next-Day Feast",
    category: "Major Utsav",
    desc: "Celebrating the divine appearance of Bhagavan Sri Krishna. Devotees observe day-long fasting, hear katha from the 10th Canto of Srimad Bhagavatam, participate in ecstatic midnight aarti, and celebrate Nandotsav the following morning with grand Annadana.",
    seva: "Midnight Bhoga & Milk Abhishek",
    image: A.altar,
  },
  {
    id: "radhashtami",
    title: "Sri Radhashtami Utsav",
    bengali: "শ্রী রাধাষ্টমী উৎসব",
    season: "Bhadra Shukla Ashtami (September)",
    time: "12:00 PM Midday Maha Abhishek",
    category: "Pariwar Seva",
    desc: "A sanctified occasion central to the Sri Radha Sakti Gadadhar Pandit Pariwar. Srimati Radharani's lotus feet are revealed for special darshan with singing of Sri Radhastakam, offerings of golden ornaments, and prayers for pure devotion (Radha-dasyam).",
    seva: "Lotus Garlands & Scented Oils",
    image: A.altar,
  },
  {
    id: "rath-yatra",
    title: "Sri Jagannath Rath Yatra & Snan Yatra",
    bengali: "শ্রী জগন্নাথ রথযাত্রা",
    season: "Ashadha Shukla Dwitiya (June / July)",
    time: "2:00 PM Chariot Pulling Procession",
    category: "Procession",
    desc: "Joyful chariot festival carrying Their Lordships through the historic streets of sacred Nabadwip Dham. Devotees pull the sacred ropes amidst thunderous mridanga rhythms and kirtan, distributing dry fruits, sweets, and cooling water to thousands of pilgrims.",
    seva: "Rath Decoration & Water Seva",
    image: A.procession,
  },
  {
    id: "annakut",
    title: "Govardhan Puja & Annakut Mahotsav",
    bengali: "গোবর্ধন পূজা ও অন্নকূট",
    season: "Kartika Shukla Pratipada (October / November)",
    time: "11:00 AM Parikrama & Feast",
    category: "Prasadam Seva",
    desc: "Commemorating Lord Krishna lifting Govardhan Hill. A magnificent hill of hundreds of vegetarian preparations is offered to Lord Madan Mohan, accompanied by sacred Gau Puja (worship of protected cows) and joyful parikrama.",
    seva: "Gau Seva & 108 Bhoga Offerings",
    image: A.kirtan,
  },
  {
    id: "founder-day",
    title: "Sri Ramsundar Vidyalankar Memorial Assembly",
    bengali: "শ্রী রামসুন্দর বিদ্যালঙ্কার তিরোভাব তিথি",
    season: "Annual Commemorative Gathering",
    time: "Morning Scholars’ Assembly",
    category: "Scholarly Gathering",
    desc: "Honouring our founder, Sri Ramsundar Vidyalankar (Sri Chintamoni Goswami), contemporary of Raja Ram Mohan Roy. Features scholastic symposium on mass literacy, casteless Gaudiya philosophy, and distribution of academic books to 500+ local students.",
    seva: "Vidyarthi Academic Help Drive",
    image: A.temple,
  },
];

const CATEGORIES = ["All Festivals", "Major Utsav", "Pariwar Seva", "Procession", "Prasadam Seva", "Scholarly Gathering"];

export default function Events() {
  const [activeCategory, setActiveCategory] = useState("All Festivals");
  const [festivalList, setFestivalList] = useState(FESTIVALS);

  useEffect(() => {
    async function loadDynamicEvents() {
      try {
        const dynamicEvents = await getEventsAPI();
        if (dynamicEvents && dynamicEvents.length > 0) {
          // Merge dynamic events with initial festivals, avoiding duplicates
          const existingIds = new Set(FESTIVALS.map((f) => f.id || f.title));
          const newOnes = dynamicEvents.filter(
            (ev) => !existingIds.has(ev.id) && !existingIds.has(ev.title)
          );
          if (newOnes.length > 0) {
            setFestivalList([...FESTIVALS, ...newOnes]);
          }
        }
      } catch (e) {}
    }
    loadDynamicEvents();
  }, []);

  const filtered = activeCategory === "All Festivals"
    ? festivalList
    : festivalList.filter((f) => f.category === activeCategory);

  return (
    <div className="bg-[#FFF9ED] font-[Inter] text-[#39251D] antialiased">
      {/* Header Banner */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-[#39251D] text-center text-[#FFF9ED]">
        <Parallax src={A.procession} alt="Festive procession" speed={60} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#39251D]/80 via-[#39251D]/60 to-[#39251D]/95" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 py-24">
          <p className="font-serif text-sm font-semibold tracking-widest text-[#E3B873]" style={deva}>
            उत्सव एवं अनुष्ठान • শ্রী শ্রী চিন্তামণি কুঞ্জ
          </p>
          <h1 className="mt-3 font-serif text-5xl font-bold tracking-tight text-[#FFF9ED] sm:text-7xl" style={serif}>
            Upcoming Events & Utsavs
          </h1>
          <p className="mt-3 font-serif text-2xl italic text-[#E8B94F] sm:text-3xl" style={serif}>
            Sacred Vaishnav Celebrations in Holy Nabadwip Dham
          </p>
          <p className="mx-auto mt-4 max-w-2xl font-[Inter] text-sm text-[#FFF9ED]/80 sm:text-base">
            Throughout the year, Sri Sri Chintamoni Kunja resonates with joyous kirtan, sacred abhishekams, and charitable Annadana seva on holy festival days.
          </p>

          <nav
            aria-label="Breadcrumb"
            className="mt-6 flex items-center justify-center gap-2 font-[Inter] text-xs font-semibold uppercase tracking-wider text-[#FFF9ED]/75"
          >
            <Link to="/" className="transition-colors hover:text-[#E3B873]">
              Home
            </Link>
            <span className="text-[#C59A52]">/</span>
            <span className="text-[#E8B94F]">Upcoming Events</span>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#971010] via-[#C59A52] to-[#971010]" />
      </section>

      {/* Main Container */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        {/* Intro */}
        <Reveal className="text-center">
          <p className="font-[Inter] text-xs font-semibold tracking-[0.25em] text-[#971515]">
            SACRED FESTIVAL CALENDAR
          </p>
          <h2 className="mt-2 font-serif text-4xl font-bold text-[#78372B] sm:text-5xl" style={serif}>
            Join Our Annual Celebrations
          </h2>
          <Lotus className="mt-4" />
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#39251D]/80">
            Pilgrims, families, and devotees from all backgrounds are warmly invited to take part in our temple rituals, hear devotional discourses, and relish sanctified prasadam.
          </p>
        </Reveal>

        {/* Category Pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
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

        {/* Festival Cards Grid */}
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, idx) => (
            <Reveal key={item.id} delay={idx * 0.08}>
              <div className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[#C59A52]/40 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#971515] hover:shadow-xl">
                <div>
                  {/* Image Header */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#39251D]">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-[#971515] px-3 py-1 font-[Inter] text-[11px] font-bold tracking-wider text-white shadow-md">
                      {item.category}
                    </span>
                    <span className="absolute bottom-3 left-4 font-serif text-sm font-semibold text-[#E8B94F]" style={beng}>
                      {item.bengali}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h3 className="font-serif text-2xl font-bold text-[#78372B] transition-colors group-hover:text-[#971515]" style={serif}>
                      {item.title}
                    </h3>

                    <div className="mt-3 space-y-1.5 text-xs text-[#39251D]/80">
                      <div className="flex items-center gap-2 text-[#971515] font-semibold">
                        <Calendar size={14} className="shrink-0" />
                        <span>{item.season}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="shrink-0 text-[#C59A52]" />
                        <span>{item.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="shrink-0 text-[#C59A52]" />
                        <span>Sri Sri Chintamoni Kunja, Nabadwip Dham</span>
                      </div>
                    </div>

                    <p className="mt-4 font-[Inter] text-sm leading-relaxed text-[#39251D]/85">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="border-t border-[#C59A52]/20 bg-[#FFF9ED]/60 p-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#78372B]">
                      Seva: <span className="font-normal text-[#39251D]/80">{item.seva}</span>
                    </span>
                    <Link
                      to="/donate"
                      className="inline-flex items-center gap-1 font-bold text-[#971515] transition-colors hover:text-[#C59A52]"
                    >
                      <span>Sponsor</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Pilgrimage Guidance Notice */}
        <div className="mt-16 rounded-3xl border border-[#C59A52]/50 bg-[#EDE0C9]/40 p-8 sm:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <span className="font-[Inter] text-xs font-bold uppercase tracking-widest text-[#971515]">
                PILGRIM ASSISTANCE & SEVA PARTICIPATION
              </span>
              <h3 className="mt-2 font-serif text-3xl font-bold text-[#78372B]" style={serif}>
                Planning to Visit During Festival Dates?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#39251D]/85">
                During festival occasions, Sri Sri Chintamoni Kunja arranges sanctified prasadam meals and devotional guidance for all visiting yatris. For inquiries regarding festival dates, volunteer participation, or travel guidelines to Nabadwip Dham, please reach our administrative desk.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3 sm:flex-row lg:flex-col justify-center">
              <Link
                to="/contact-us"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#971515] px-6 py-3.5 font-[Inter] text-sm font-semibold text-white shadow-md transition hover:bg-[#78372B]"
              >
                <span>Contact Festival Desk</span>
                <ExternalLink size={16} />
              </Link>
              <Link
                to="/donate"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#C59A52] bg-white px-6 py-3 font-[Inter] text-sm font-semibold text-[#78372B] transition hover:bg-[#FFF9ED]"
              >
                <HeartHandshake size={16} />
                <span>Sponsor Festival Bhoga</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

