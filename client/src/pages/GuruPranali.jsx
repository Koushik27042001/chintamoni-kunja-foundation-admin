import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  HeartHandshake,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Users,
} from "lucide-react";

/* ==================================================================
   Guru Pranali – Sri Sri Chintamoni Kunja Foundation
   Theme: Ivory #FFF9ED · Sacred Gold #C59A52 · Maroon #78372B / #971515
================================================================== */

const asset = (n) => encodeURI(`/assets/${n}`);
const A = {
  golden: asset("Krishna’s Golden Riverside Devotion.png"),
  radhaKrishna: asset("Radha and Krishna by the Riverside.png"),
  altar: asset("Opulent Gaura-Nitai and Madan Mohan Altar.png"),
  temple: asset("Nabadwip Dham Temple in Sunshine.png"),
  kirtan: asset("Golden Kirtan by the Sacred Ghats.png"),
  separation: asset("seperation-image.png"),
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
      initial={calm ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
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

function Mandala({ className = "" }) {
  const p = Array.from({ length: 16 }, (_, i) => i * 22.5);
  return (
    <svg
      viewBox="-100 -100 200 200"
      fill="none"
      stroke="#C59A52"
      strokeWidth="0.8"
      aria-hidden="true"
      className={`pointer-events-none animate-[spin_140s_linear_infinite] motion-reduce:animate-none ${className}`}
    >
      {[95, 78, 40, 22].map((r) => (
        <circle key={r} r={r} strokeDasharray={r === 78 ? "2 3" : undefined} />
      ))}
      {p.map((d) => (
        <g key={d} transform={`rotate(${d})`}>
          <path d="M0 -40C10 -55 10 -72 0 -78C-10 -72 -10 -55 0 -40Z" />
          <path d="M0 -78C6 -86 6 -92 0 -95C-6 -92 -6 -86 0 -78Z" />
        </g>
      ))}
    </svg>
  );
}

const PARAMPARA_STAGES = [
  {
    order: "01",
    sanskrit: "श्री कृष्ण चैतन्य महाप्रभु",
    title: "Lord Sri Krishna Chaitanya Mahaprabhu",
    role: "The Supreme Source of Gaudiya Bhakti & Avatar of Prema",
    desc: "Appearing in holy Nabadwip Dham in 1486, Mahaprabhu inaugurated the Harinam Sankirtan movement and envisioned an egalitarian, caste-free society where every soul can taste pure love of God through the chanting of the Holy Names.",
    tag: "Divine Fountainhead",
  },
  {
    order: "02",
    sanskrit: "श्री गदाधर पण्डित प्रभु",
    title: "Sri Gadadhar Pandit Prabhu",
    role: "Incarnation of Sri Radha Sakti & Mahaprabhu's Inseparable Associate",
    desc: "Revered as the personification of Srimati Radharani's internal hladini potency, Gadadhar Pandit embodies unconditional surrender and devotion. Our entire Pariwar traces its spiritual identity, mood, and eternal shelter to him.",
    tag: "Radha Sakti Incarnate",
  },
  {
    order: "03",
    sanskrit: "श्री वल्लभ भट्ट ও শাখা আচার্যগণ",
    title: "Early Acharyas & Sacred Branches",
    role: "Custodians of the Gadadhar Pariwar Lineage",
    desc: "Disciples and revered spiritual successors preserved the esoteric mood of Radha-dasyam and Gaur-Gadadhar worship across Katwa, Nabadwip, and Nilachala (Puri Dham), transmitting the authentic initiation mantras through generations.",
    tag: "Unbroken Parampara",
  },
  {
    order: "04",
    sanskrit: "श्री रामसुन्दर विद्यालङ्कार (चिन्तामणि गोस्वामी)",
    title: "Sri Ramsundar Vidyalankar (Sri Chintamoni Goswami)",
    role: "Founder of Chintamoni Kunja (1809) • Vedic Scholar & Social Reformer",
    desc: "A luminous contemporary of Raja Ram Mohan Roy in 19th-century Bengal, he founded Sri Sri Chintamoni Kunja in Nabadwip Dham. He dedicated his scholarship to mass education and championed Lord Chaitanya's egalitarian mandate against medieval feudal orthodoxy.",
    tag: "Foundation Pioneer",
  },
  {
    order: "05",
    sanskrit: "ধারাবাহিক গোস্বামী সম্প্রদায়",
    title: "Succession of Revered Acharyas & Goswamis",
    role: "Guardians of Ancient Palm-Leaf Manuscripts & Deities",
    desc: "Generations of consecrated sevayats safeguarded sacred Gaudiya palm-leaf scriptures, the daily worship of Gaura-Nitai and Madan Mohan, and upheld the Zero Starvation Anna Daan tradition for traveling pilgrims.",
    tag: "Sacred Heritage",
  },
  {
    order: "06",
    sanskrit: "শ্রী শ্রী চিন্তামণি কুঞ্জ পরিষদ",
    title: "Modern Institutional Stewardship",
    role: "Section 8 Non-Profit • NITI Aayog DARPAN Verified",
    desc: "Today, under the stewardship of the Chakraborty sevayats (Smt. Shailaja Chakraborty, Sri Krishnendu Chakraborty, and Smt. Debarupa Chakraborty), the Foundation continues its spiritual teachings, student assistance, and humanitarian relief in an open and accountable framework.",
    tag: "Contemporary Seva",
  },
];

export default function GuruPranali() {
  return (
    <div className="bg-[#FFF9ED] font-[Inter] text-[#39251D] antialiased">
      {/* Hero Banner */}
      <section className="relative flex min-h-[65vh] items-center justify-center overflow-hidden bg-[#39251D] text-center text-[#FFF9ED]">
        <Parallax src={A.radhaKrishna} alt="Radha and Krishna" speed={60} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#39251D]/80 via-[#39251D]/60 to-[#39251D]/95" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 py-24">
          <p className="font-serif text-sm font-semibold tracking-widest text-[#E3B873]" style={beng}>
            শ্রী রাধা শক্তি গদাধর পণ্ডিত পরিবার • নবদ্বীপ ধাম
          </p>
          <h1 className="mt-3 font-serif text-5xl font-bold tracking-tight text-[#FFF9ED] sm:text-7xl" style={serif}>
            Our Devotional Lineage
          </h1>
          <p className="mt-3 font-serif text-2xl italic text-[#E8B94F] sm:text-3xl" style={serif}>
            The Unbroken Parampara of Divine Love & Sacred Seva
          </p>
          <p className="mx-auto mt-4 max-w-2xl font-[Inter] text-sm text-[#FFF9ED]/80 sm:text-base">
            Rooted in the eternal Madhva Gaudiya Vaishnav Sampradaya, tracing back to Lord Sri Krishna Chaitanya Mahaprabhu and His intimate associate Sri Gadadhar Pandit Prabhu.
          </p>

          <nav
            aria-label="Breadcrumb"
            className="mt-6 flex items-center justify-center gap-2 font-[Inter] text-xs font-semibold uppercase tracking-wider text-[#FFF9ED]/75"
          >
            <Link to="/" className="transition-colors hover:text-[#E3B873]">
              Home
            </Link>
            <span className="text-[#C59A52]">/</span>
            <span className="text-[#E8B94F]">Guru Pranali</span>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#971010] via-[#C59A52] to-[#971010]" />
      </section>

      {/* Overview Section */}
      <section className="relative overflow-hidden bg-[#FFF9ED] py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-2">
          <Reveal>
            <p className="font-[Inter] text-xs font-semibold tracking-[0.25em] text-[#971515]">
              SACRED FOUNDATION
            </p>
            <h2 className="mt-2 font-serif text-4xl font-bold text-[#78372B] sm:text-5xl" style={serif}>
              Sri Radha Sakti Gadadhar Pandit Pariwar
            </h2>
            <Lotus className="!justify-start my-6" />

            <p className="font-[Inter] text-base leading-relaxed text-[#39251D]/90">
              In Gaudiya Vaishnavism, spiritual initiation and spiritual knowledge (*sambandha-jnana*) do not arise in isolation; they flow down as an unbroken celestial river through bona fide spiritual succession (*guru-parampara*).
            </p>

            <p className="mt-4 font-[Inter] text-base leading-relaxed text-[#39251D]/90">
              Our sanctuary in Nabadwip Dham belongs to the venerated <strong>Sri Radha Sakti Gadadhar Pandit Pariwar</strong>, one of the foremost branches of the Madhva Gaudiya Vaishnav Sampradaya. Sri Gadadhar Pandit Prabhu is revered as the internal potency (*hladini-shakti*) of the Supreme Lord, who accompanied Lord Chaitanya to demonstrate the supreme pinnacle of divine love and surrender.
            </p>

            <p className="mt-4 font-[Inter] text-base leading-relaxed text-[#39251D]/90">
              Through Sri Ramsundar Vidyalankar (Sri Chintamoni Goswami), this sacred mood of selfless devotion was harmonized with deep scriptural scholarship and social reform, establishing Sri Sri Chintamoni Kunja in 1809.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/diksha"
                className="inline-flex items-center gap-2 rounded-lg bg-[#971515] px-6 py-3 font-[Inter] text-sm font-semibold text-white shadow-md transition-all hover:bg-[#78372B]"
              >
                <span>Learn About Diksha Tradition</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/about-us"
                className="inline-flex items-center gap-2 rounded-lg border border-[#C59A52] px-6 py-3 font-[Inter] text-sm font-semibold text-[#78372B] transition-all hover:bg-[#C59A52]/10"
              >
                Foundation History
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative">
              <Parallax
                src={A.altar}
                alt="Gaura-Nitai and Madan Mohan Altar"
                className={`aspect-[4/5] rounded-2xl ${frame}`}
              />
              <div className="absolute -bottom-6 -left-4 right-4 rounded-xl border border-[#C59A52]/60 bg-[#FFF9ED]/95 p-4 shadow-xl backdrop-blur-md sm:-bottom-8 sm:left-6">
                <p className="font-serif text-lg font-bold text-[#971515]" style={serif}>
                  Deity Heritage of Chintamoni Kunja
                </p>
                <p className="mt-1 font-[Inter] text-xs text-[#39251D]/80">
                  Sri Sri Gaura-Nitai & Sri Sri Madan Mohan worshipped with unbroken daily traditional seva since 1809.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Succession Timeline */}
      <section className="relative overflow-hidden bg-[#78372B] py-24 text-[#FFF9ED]">
        <Mandala className="absolute left-1/2 top-1/2 aspect-square h-[160%] min-h-[750px] -translate-x-1/2 -translate-y-1/2 opacity-[.12]" />

        <div className="relative mx-auto max-w-6xl px-5">
          <Reveal className="text-center">
            <p className="font-[Inter] text-xs font-semibold tracking-[0.25em] text-[#E3B873]">
              UNBROKEN SUCCESSION
            </p>
            <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl lg:text-6xl text-[#FFF9ED]" style={serif}>
              The Lineage of Acharyas
            </h2>
            <Lotus className="mt-4" />
            <p className="mx-auto mt-4 max-w-2xl font-[Inter] text-sm text-[#FFF9ED]/80 sm:text-base">
              Explore the celestial stages of our parampara connecting sacred Nabadwip Dham with the supreme source of Bhakti.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {PARAMPARA_STAGES.map((stage, idx) => (
              <Reveal key={stage.order} delay={idx * 0.08}>
                <div className="flex h-full flex-col justify-between rounded-2xl border border-[#C59A52]/50 bg-gradient-to-b from-[#FFF9ED]/10 to-[#FFF9ED]/5 p-7 backdrop-blur-sm transition-all duration-300 hover:border-[#E8B94F] hover:bg-[#FFF9ED]/15">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#C59A52]/30 pb-3">
                      <span className="font-serif text-3xl font-bold text-[#E8B94F]" style={serif}>
                        {stage.order}
                      </span>
                      <span className="rounded-full bg-[#E8B94F]/20 px-3 py-1 font-[Inter] text-xs font-semibold text-[#E8B94F]">
                        {stage.tag}
                      </span>
                    </div>

                    <p className="mt-4 text-sm font-semibold text-[#E3B873]" style={beng}>
                      {stage.sanskrit}
                    </p>
                    <h3 className="mt-1 font-serif text-2xl font-bold text-[#FFF9ED]" style={serif}>
                      {stage.title}
                    </h3>
                    <p className="mt-1 font-[Inter] text-xs font-semibold text-[#C59A52]">
                      {stage.role}
                    </p>
                    <p className="mt-3 font-[Inter] text-sm leading-relaxed text-[#FFF9ED]/85">
                      {stage.desc}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-[#C59A52]/30 pt-3 text-right">
                    <span className="font-serif text-xs italic text-[#E3B873]" style={serif}>
                      Sacred Link • Gadadhar Pandit Pariwar
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Tenets Section */}
      <section className="bg-[#EDE0C9]/50 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="text-center">
            <p className="font-[Inter] text-xs font-semibold tracking-[0.25em] text-[#971515]">
              DEVOTIONAL PRINCIPLES
            </p>
            <h2 className="mt-3 font-serif text-4xl font-bold text-[#78372B] sm:text-5xl" style={serif}>
              Core Tenets of Our Pariwar
            </h2>
            <Lotus className="mt-4" />
          </Reveal>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Radha-Dasyam",
                desc: "Cultivating pure servitude to Srimati Radharani, who personifies the topmost pinnacle of unconditional devotion to Sri Krishna.",
                icon: Sparkles,
              },
              {
                title: "Congregational Sankirtan",
                desc: "Chanting the Hare Krishna Mahamantra openly in public and in daily private japa as given by Sri Chaitanya Mahaprabhu.",
                icon: BookOpen,
              },
              {
                title: "Universal Equality",
                desc: "Upholding the casteless, racism-free vision of Shikshastakam, rejecting medieval feudal dogmas and untouchability.",
                icon: Users,
              },
              {
                title: "Compassionate Seva",
                desc: "Expressing bhakti through real action: the Zero Starvation Anna Daan, academic aid for 2,000+ students, and native health care.",
                icon: HeartHandshake,
              },
            ].map((tenet, idx) => {
              const Icon = tenet.icon;
              return (
                <Reveal key={tenet.title} delay={idx * 0.1}>
                  <div className="flex h-full flex-col justify-between rounded-2xl border border-[#C59A52]/50 bg-white p-7 text-center shadow-sm transition hover:shadow-md">
                    <div>
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF9ED] border border-[#C59A52]/50 text-[#971515]">
                        <Icon size={24} />
                      </div>
                      <h3 className="mt-5 font-serif text-2xl font-bold text-[#78372B]" style={serif}>
                        {tenet.title}
                      </h3>
                      <p className="mt-3 font-[Inter] text-sm leading-relaxed text-[#39251D]/85">
                        {tenet.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Diksha Callout */}
      <section className="relative overflow-hidden bg-[#39251D] py-20 text-center text-[#FFF9ED]">
        <Parallax src={A.golden} alt="Golden riverside devotion" speed={50} className="absolute inset-0 opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#39251D] via-transparent to-[#39251D]" />

        <Reveal className="relative mx-auto max-w-3xl px-5">
          <h2 className="font-serif text-4xl font-bold sm:text-5xl text-[#FFF9ED]" style={serif}>
            The Sacred Diksha Gateway
          </h2>
          <p className="mt-4 font-serif text-xl italic text-[#E8B94F]" style={serif}>
            “Through bona fide spiritual initiation, transcendental knowledge awakens in the heart.”
          </p>
          <p className="mx-auto mt-4 max-w-xl font-[Inter] text-sm text-[#FFF9ED]/85">
            Interested in learning about the qualifications, preparatory vows, and timeless tradition of receiving Vaishnav Diksha and Harinam under our lineage?
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 font-[Inter] text-sm font-semibold sm:flex-row">
            <Link
              to="/diksha"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E8B94F] px-8 py-3.5 text-[#54251E] shadow-xl transition-all hover:bg-[#F4D27E] hover:scale-105"
            >
              <span>Explore Diksha Tradition</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact-us"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#E8B94F] px-8 py-3 text-[#FFF9ED] transition-all hover:bg-[#E8B94F] hover:text-[#39251D]"
            >
              Contact Seva Desk
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

