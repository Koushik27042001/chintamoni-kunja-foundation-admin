import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import {
  ShieldCheck,
  FileText,
  Download,
  ExternalLink,
  Award,
  Users,
  HeartHandshake,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  MapPin,
  Mail,
  Phone,
  Globe,
  Clock,
  Sparkles,
  BookOpen,
  GraduationCap,
  Utensils,
  Landmark,
} from "lucide-react";

/* ==================================================================
   About Us – Sri Sri Chintamoni Kunja Foundation (React + Tailwind v3)
   Needs: npm i framer-motion. Same fonts/palette as Home.jsx.
   Images: client/public/assets/*.png   Certificate: client/public/images/*.pdf
================================================================== */

const asset = (n) => encodeURI(`/assets/${n}`);
const A = {
  golden: asset("Krishna’s Golden Riverside Devotion.png"),
  radhaKrishna: asset("Radha and Krishna by the Riverside.png"),
  altar: asset("Opulent Gaura-Nitai and Madan Mohan Altar.png"),
  temple: asset("Nabadwip Dham Temple in Sunshine.png"),
  kirtan: asset("Golden Kirtan by the Sacred Ghats.png"),
  students: asset("students.png"),
  work: asset("work-image.png"),
  separation: asset("seperation-image.png"),
};

const CERT = "/images/Darpan-certificate_SRI-SRI-CHINTAMONI-KUNJA-FOUNDATION-1.pdf";

const REGISTRATION = [
  ["Registered With", "Registrar of Companies"],
  ["Type of NPO", "Section 8 Company"],
  ["Registration No.", "253219"],
  ["Act Name", "Companies Act 2013"],
  ["City of Registration", "Nadia"],
  ["State of Registration", "West Bengal"],
  ["Date of Registration", "21-04-2022"],
  ["DARPAN ID", "WB/2025/0513262"],
  ["DARPAN Registration Date", "10-02-2025"],
];

const BEARERS = [
  {
    name: "Shailaja Chakraborty",
    role: "President",
    desc: "Overseeing the spiritual stewardship, institutional heritage, and social outreach of the Foundation in Nabadwip Dham.",
  },
  {
    name: "Krishnendu Chakraborty",
    role: "Vice President",
    desc: "Leading daily administration, legal governance under Section 8, academic programs, and regional charitable seva.",
  },
  {
    name: "Debarupa Chakraborty",
    role: "Treasurer",
    desc: "Directing ethical financial auditing, transparent donor accountability, and equitable resource allocation for community aid.",
  },
];

const ADDRESS = "C/O Krishnendu Chakraborty, Bowbazar Road, P.O. Nabadwip, Nadia, West Bengal – 741302, India";

const VALUES = [
  {
    title: "Devotion",
    desc: "Everything begins with the holy name and loving service to Sri Sri Radha-Krishna, Gaura-Nitai, and Sri Chaitanya Mahaprabhu.",
    icon: Sparkles,
  },
  {
    title: "Compassion",
    desc: "We serve every person who comes to us, without distinction of caste, class, gender, or religious background.",
    icon: HeartHandshake,
  },
  {
    title: "Learning",
    desc: "From our founder's scholarship we inherit deep reverence for sacred scripture, teaching, and rational, thoughtful inquiry.",
    icon: BookOpen,
  },
  {
    title: "Transparency",
    desc: "As a registered Section 8 non-profit on NITI Aayog DARPAN, we keep every ledger open and our service fully accountable.",
    icon: ShieldCheck,
  },
];

const TIMELINE = [
  {
    year: "1809",
    era: "The Divine Genesis",
    title: "Foundation by Sri Ramsundar Vidyalankar",
    desc: "Eminent scholar, philosopher, and social reformer Sri Ramsundar Vidyalankar (revered as Sri Chintamoni Goswami) establishes the Kunja in Nabadwip Dham. A contemporary of Raja Ram Mohan Roy, he dedicated his life to mass education and spiritual revival.",
  },
  {
    year: "1830s – 1890s",
    era: "The Egalitarian Movement",
    title: "Eradicating Untouchability & Feudal Casteism",
    desc: "Inspired by the Shikshastakam of Lord Sri Krishna Chaitanya Dev, the Kunja pioneered the social equality movement across Bengal. Vidyalankar used Gaudiya Vaishnav philosophy to dismantle caste boundaries and open devotional education to all.",
  },
  {
    year: "1900s – 2010s",
    era: "Heritage Preservation",
    title: "Guarding Deities, Palm-Leaves & Daily Seva",
    desc: "Through decades of shifting social landscapes, generations of Gadadhar Pandit Pariwar sevayats preserved ancient palm-leaf manuscripts, sacred Gaura-Nitai and Madan Mohan worship, and continuous Annadana seva for travelling pilgrims.",
  },
  {
    year: "2022",
    era: "Modern Governance",
    title: "Section 8 Company Incorporation",
    desc: "To guarantee transparent, democratic, and institutional continuity, Sri Sri Chintamoni Kunja was formally incorporated under Section 8 of the Companies Act 2013 (Reg. No. 253219) on April 21, 2022.",
  },
  {
    year: "2025",
    era: "National Accreditation",
    title: "NITI Aayog DARPAN Registration",
    desc: "Formally registered on the Government of India NGO DARPAN portal (DARPAN ID: WB/2025/0513262) on February 10, 2025, ensuring public compliance, open auditing, and nationwide charitable eligibility.",
  },
  {
    year: "Present Day",
    era: "Continuous Action",
    title: "Zero Starvation & Academic Upliftment",
    desc: "Over 2,000 underprivileged students supported with educational materials and guidance, paired with the Zero Starvation Movement and native healthcare relief across the sacred towns of Nadia.",
  },
];

const FAQS = [
  {
    q: "Where is Sri Sri Chintamoni Kunja located?",
    a: "The Foundation and its heritage sanctuary are situated on Bowbazar Road, in the holy pilgrimage town of Nabadwip Dham, Nadia District, West Bengal (PIN: 741302), just a short distance from the sacred banks of the Ganges (Bhagirathi).",
  },
  {
    q: "What is the relation between Chintamoni Kunja and Raja Ram Mohan Roy?",
    a: "Our founder, Sri Ramsundar Vidyalankar (Sri Chintamoni Goswami), was a direct contemporary of Raja Ram Mohan Roy in 19th-century Bengal. While Ram Mohan Roy advocated social reform through administrative channels, Vidyalankar spearheaded reform through Vaishnav spirituality, mass education, and eradicating casteism.",
  },
  {
    q: "Is Sri Sri Chintamoni Kunja Foundation an officially registered NGO?",
    a: "Yes. The Foundation is a legally incorporated Section 8 Non-Profit Company under the Companies Act 2013 (Registration No: 253219, ROC West Bengal) and registered on the Government of India's NITI Aayog NGO-DARPAN portal (DARPAN ID: WB/2025/0513262).",
  },
  {
    q: "How can pilgrims or visitors visit and attend Darshan?",
    a: "Visitors are always welcome. Morning Darshan and Mangal Aarti take place from 6:00 AM to 12:30 PM, and Evening Sandhya Aarti from 4:30 PM to 8:30 PM daily. For group visits, accommodation inquiries, or special pujas, please call our desk at +91 9474905910 or email us in advance.",
  },
  {
    q: "How does the Foundation support students and pilgrims?",
    a: "Through our Academic Help initiative, we have served over 2,000 meritorious and underprivileged students with textbooks, stationary, and mentoring. Our Zero Starvation Movement offers nutritious sanctified prasadam meals to pilgrims and locals daily without discrimination.",
  },
];

const serif = { fontFamily: "'Cormorant Garamond','Playfair Display',serif" };
const deva = { fontFamily: "'Noto Serif Devanagari',serif" };
const beng = { fontFamily: "'Noto Serif Bengali',serif" };

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
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
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

const Om = ({ pos }) => (
  <span
    aria-hidden="true"
    style={deva}
    className={`pointer-events-none absolute select-none text-[16rem] leading-none text-[#C59A52]/10 ${pos}`}
  >
    ॐ
  </span>
);

const Eyebrow = ({ children, light = false }) => (
  <p
    className={`font-[Inter] text-xs font-semibold tracking-[0.25em] ${
      light ? "text-[#E3B873]" : "text-[#971515]"
    }`}
  >
    {children.toUpperCase()}
  </p>
);

const frame = "border border-[#C59A52] shadow-[0_0_0_6px_#FFF9ED,0_0_0_7px_rgba(197,154,82,.6)]";

/* ==================================================================
   Subcomponents / Sections
================================================================== */

function Banner() {
  return (
    <section className="relative flex min-h-[64vh] items-center justify-center overflow-hidden bg-[#39251D] text-center text-[#FFF9ED]">
      <Parallax src={A.temple} alt="Nabadwip Dham Temple" speed={60} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#39251D]/80 via-[#39251D]/60 to-[#39251D]/95" />

      {/* Decorative Golden Aura */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E8B94F]/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-24">
        <p
          className="animate-[fadeUp_1.2s_ease-out_both] text-lg font-medium text-[#E3B873] sm:text-xl motion-reduce:animate-none"
          style={deva}
        >
          श्री श्री चिन्तामणि कुञ्ज • নবদ্বীপ ধাম
        </p>

        <h1
          className="mt-4 animate-[fadeUp_1.4s_.2s_ease-out_both] text-5xl font-bold sm:text-7xl lg:text-8xl motion-reduce:animate-none text-[#FFF9ED] drop-shadow-md"
          style={serif}
        >
          About Us
        </h1>

        <p
          className="mt-4 animate-[fadeUp_1.5s_.4s_ease-out_both] text-2xl italic text-[#E8B94F] sm:text-3xl motion-reduce:animate-none"
          style={serif}
        >
          Over two centuries of devotion, social reform & selfless seva
        </p>

        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mt-8 flex items-center justify-center gap-2 font-[Inter] text-xs font-semibold uppercase tracking-wider text-[#FFF9ED]/75"
        >
          <Link to="/" className="transition-colors hover:text-[#E3B873]">
            Home
          </Link>
          <span className="text-[#C59A52]">/</span>
          <span className="text-[#E8B94F]">About Us</span>
        </nav>

        {/* Quick Nav Anchor Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {[
            { label: "Our Story", id: "our-story" },
            { label: "Why Chintamoni?", id: "why-chintamoni" },
            { label: "Values", id: "values" },
            { label: "215-Year Timeline", id: "timeline" },
            { label: "Social Reform", id: "social-reform" },
            { label: "DARPAN & Legal", id: "registration" },
            { label: "Office Bearers", id: "office-bearers" },
            { label: "Pilgrimage", id: "contact" },
          ].map((pill) => (
            <a
              key={pill.id}
              href={`#${pill.id}`}
              className="rounded-full border border-[#C59A52]/40 bg-[#FFF9ED]/10 px-3.5 py-1 text-xs font-medium text-[#FFF9ED]/90 backdrop-blur-sm transition-all hover:border-[#E8B94F] hover:bg-[#E8B94F]/20 hover:text-white"
            >
              {pill.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImpactMetrics() {
  const metrics = [
    { value: "1809", label: "Founded in Nabadwip Dham", sub: "215+ Years of Devotional Heritage" },
    { value: "2,000+", label: "Students Empowered", sub: "Academic books, tuition & guidance" },
    { value: "Section 8", label: "Registered Non-Profit", sub: "Companies Act 2013 (ROC West Bengal)" },
    { value: "DARPAN", label: "WB/2025/0513262", sub: "Government of India NITI Aayog Verified" },
  ];

  return (
    <section className="relative z-20 -mt-10 mx-auto max-w-6xl px-5">
      <div className="grid grid-cols-1 divide-y divide-[#C59A52]/20 rounded-2xl border border-[#C59A52]/40 bg-[#FFF9ED] p-2 shadow-2xl sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="flex flex-col items-center justify-center p-6 text-center">
            <span className="font-serif text-3xl font-bold text-[#971515] sm:text-4xl" style={serif}>
              {m.value}
            </span>
            <span className="mt-1 font-[Inter] text-sm font-bold text-[#39251D]">
              {m.label}
            </span>
            <span className="mt-0.5 font-[Inter] text-xs text-[#78372B]/80">
              {m.sub}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Story() {
  return (
    <section id="our-story" className="relative overflow-hidden bg-[#FFF9ED] py-24">
      <Om pos="-left-10 top-0" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>Who we are</Eyebrow>
          <h2 className="mt-3 text-4xl font-bold text-[#78372B] sm:text-5xl" style={serif}>
            Sri Sri Chintamoni Kunja Foundation
          </h2>
          <Lotus className="!justify-start my-6" />

          <p className="font-[Inter] text-base leading-relaxed text-[#39251D]/90">
            Sri Sri Chintamoni Kunja was established in <strong>1809</strong> by{" "}
            <strong className="text-[#971515]">Sri Ramsundar Vidyalankar</strong> (Sri Chintamoni
            Goswami), an eminent academic personality, Vedic philosopher, and a contemporary of
            Raja Ram Mohan Roy, the renowned pioneer of Bengal’s Renaissance.
          </p>

          <p className="mt-4 font-[Inter] text-base leading-relaxed text-[#39251D]/90">
            We are a unique <strong>Sri Radha Sakti Gadadhar Pandit Pariwar</strong> sanctuary
            belonging to the unbroken Madhva Gaudiya Vaishnav Sampradaya. In sacred Nabadwip Dham, we
            revere Lord Sri Krishna Chaitanya Mahaprabhu and Lord Gadadhar Pandit Prabhu as the
            fountainheads of divine love, selfless surrender, and universal brotherhood.
          </p>

          <p className="mt-4 font-[Inter] text-base leading-relaxed text-[#39251D]/90">
            Today, the Kunja is legally formalized as a Section 8 non-profit company under the
            Companies Act 2013, ensuring that its age-old worship, scholarship, food distribution,
            and educational programs continue in an open, auditable, and accountable manner.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/guru-pranali"
              className="inline-flex items-center gap-2 rounded-lg bg-[#971515] px-6 py-3 font-[Inter] text-sm font-semibold text-white shadow-md transition-all hover:bg-[#78372B]"
            >
              Explore Devotional Lineage
              <ExternalLink size={16} />
            </Link>
            <a
              href="#registration"
              className="inline-flex items-center gap-2 rounded-lg border border-[#C59A52] px-6 py-3 font-[Inter] text-sm font-semibold text-[#78372B] transition-all hover:bg-[#C59A52]/10"
            >
              Verify Legal Credentials
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative">
            <Parallax
              src={A.altar}
              alt="Gaura-Nitai and Madan Mohan altar"
              className={`aspect-[4/5] rounded-2xl ${frame}`}
            />
            {/* Devotional Overlay Card */}
            <div className="absolute -bottom-6 -left-4 right-4 sm:-bottom-8 sm:left-6 rounded-xl border border-[#C59A52]/60 bg-[#FFF9ED]/95 p-4 shadow-xl backdrop-blur-md">
              <p className="font-serif text-lg font-bold text-[#971515]" style={serif}>
                Sacred Sanctum of Gaura-Nitai & Madan Mohan
              </p>
              <p className="mt-1 font-[Inter] text-xs leading-relaxed text-[#39251D]/80">
                Worshipped with unbroken traditional Gaudiya rites since 1809 in the holy abode of Nabadwip Dham.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Name() {
  const cards = [
    {
      title: "The Wish-Fulfilling Jewel",
      bengali: "চিন্তামণি",
      desc: "In Vedic scriptures, Chintamani is the transcendent, wish-fulfilling jewel that bestows spiritual awakening. For Gaudiya Vaishnavas, it symbolizes Lord Sri Krishna Himself, whose divine holy name fulfills the deepest yearning of every soul.",
    },
    {
      title: "Sri Radharani’s Prema",
      bengali: "শ্রী রাধারানী",
      desc: "Chintamoni specifically denotes Srimati Radharani, the supreme hladini-shakti (internal potency of divine love). She is inseparable from Lord Krishna and delivers boundless unconditional mercy to every seeker on this path.",
    },
    {
      title: "The Scholar’s Title",
      bengali: "শ্রী চিন্তামণি গোস্বামী",
      desc: "It was also the honorific title conferred upon Sri Ramsundar Vidyalankar by the Vaishnav acharyas in recognition of his deep scriptural learning, unyielding humility, and ceaseless dedication to social education.",
    },
  ];

  return (
    <section id="why-chintamoni" className="relative overflow-hidden bg-[#78372B] py-24 text-[#FFF9ED]">
      <Mandala className="absolute left-1/2 top-1/2 aspect-square h-[160%] min-h-[750px] -translate-x-1/2 -translate-y-1/2 opacity-[.12]" />

      <div className="relative mx-auto max-w-6xl px-5">
        <Reveal className="text-center">
          <Eyebrow light>The sacred meaning of our name</Eyebrow>
          <h2 className="mt-3 text-4xl font-bold sm:text-5xl lg:text-6xl" style={serif}>
            Why “Chintamoni”?
          </h2>
          <Lotus className="mt-4" />
          <p className="mx-auto mt-4 max-w-2xl font-[Inter] text-sm text-[#FFF9ED]/80 sm:text-base">
            Every syllable of our name carries centuries of philosophical depth, devotion, and compassion.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.12}>
              <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-[#C59A52]/50 bg-gradient-to-b from-[#FFF9ED]/10 to-[#FFF9ED]/5 p-8 text-center backdrop-blur-sm transition-all duration-300 hover:border-[#E8B94F] hover:bg-[#FFF9ED]/15">
                <div>
                  <p className="text-4xl font-bold text-[#E8B94F] transition-transform duration-300 group-hover:scale-110" style={beng}>
                    {c.bengali}
                  </p>
                  <h3 className="mt-4 text-2xl font-bold text-[#FFF9ED]" style={serif}>
                    {c.title}
                  </h3>
                  <p className="mt-3 font-[Inter] text-sm leading-relaxed text-[#FFF9ED]/85">
                    {c.desc}
                  </p>
                </div>
                <div className="mt-6 border-t border-[#C59A52]/30 pt-4">
                  <span className="font-serif text-xs uppercase tracking-widest text-[#E3B873]">
                    Sacred Epithet
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialReform() {
  return (
    <section id="social-reform" className="relative overflow-hidden bg-[#FFF9ED] py-24">
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <Eyebrow>Our Spiritual & Social Aspects</Eyebrow>
            <h2 className="mt-3 text-4xl font-bold text-[#78372B] sm:text-5xl" style={serif}>
              A Casteless, Racism-Free Vision for Society
            </h2>
            <Lotus className="!justify-start my-6" />

            <p className="font-[Inter] leading-relaxed text-[#39251D]/90">
              Apart from scholastic devotion, the spiritual aspect of <strong>Sri Ramsundar Vidyalankar</strong> was that he devoted himself to mass education through his preaching. That is why our prime focus has always remained education.
            </p>

            <p className="mt-4 font-[Inter] leading-relaxed text-[#39251D]/90">
              We firmly hold that <strong>Lord Srikrishna Chaitanya</strong> was a transformative Social Activist and Reformist of his contemporary era who visualized a caste-free, racism-free society. Ramsunder followed this path of Sri Krishna Chaitanya throughout his entire life. Today, we continue fighting deliberately to maintain this precious legacy.
            </p>

            <p className="mt-4 font-[Inter] leading-relaxed text-[#39251D]/90">
              Pravu Chintamoni Goswami, a.k.a Ramsundar Vidyalankar, pioneered this social equality movement. While feudal prejudice, untouchability, and mediaeval orthodoxies at times contaminated parts of religious society, we struggle and fight hard to overcome this feudal mindset by strictly upholding the principles stated in the <strong>SHIKSHASTAKAM</strong> by Lord Srikrishna Chaitanya Dev.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            {/* Sacred Shikshastakam Verse Card */}
            <div className="relative rounded-2xl border-2 border-[#C59A52] bg-gradient-to-br from-[#EDE0C9] via-[#FFF9ED] to-[#EDE0C9] p-8 shadow-xl">
              <div className="absolute right-6 top-6 text-5xl text-[#C59A52]/20" style={deva}>
                ॐ
              </div>
              <p className="font-[Inter] text-xs font-bold uppercase tracking-widest text-[#971515]">
                Lord Chaitanya’s Eternal Shikshastakam Mandate
              </p>

              <blockquote className="mt-5 border-l-4 border-[#971515] pl-4 italic text-[#78372B]">
                <p className="text-xl font-semibold sm:text-2xl" style={deva}>
                  “तृणादपि सुनीचेन तरोरपि सहिष्णुना ।<br />
                  अमानिना मानदेन कीर्तनीयः सदा हरिः ॥”
                </p>
              </blockquote>

              <p className="mt-5 font-[Inter] text-sm leading-relaxed text-[#39251D]/85">
                <em>
                  “One should chant the holy name of the Lord in a humble state of mind, thinking oneself lower than the straw in the street; one should be more tolerant than a tree, devoid of all sense of false prestige, and ready to offer all respect to others. In such a state of mind one can chant the holy name of the Lord constantly.”
                </em>
              </p>

              <div className="mt-6 flex flex-col gap-3 rounded-lg border border-[#C59A52]/40 bg-white/70 p-4 font-[Inter] text-xs text-[#39251D]/90">
                <div className="flex items-center gap-2 text-[#971515] font-semibold">
                  <Check size={16} />
                  <span>Unconditional Zero Starvation Anna Daan regardless of creed</span>
                </div>
                <div className="flex items-center gap-2 text-[#971515] font-semibold">
                  <Check size={16} />
                  <span>Mass educational support for students across all communities</span>
                </div>
                <div className="flex items-center gap-2 text-[#971515] font-semibold">
                  <Check size={16} />
                  <span>Equal spiritual initiation rights under Gaudiya Vaishnav lineage</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function TimelineSection() {
  return (
    <section id="timeline" className="relative bg-[#EDE0C9]/50 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="text-center">
          <Eyebrow>Chronicles of Service</Eyebrow>
          <h2 className="mt-3 text-4xl font-bold text-[#78372B] sm:text-5xl" style={serif}>
            215+ Years of Devotion (1809 – Present)
          </h2>
          <Lotus className="mt-4" />
          <p className="mx-auto mt-4 max-w-2xl font-[Inter] text-sm text-[#39251D]/80 sm:text-base">
            From 19th-century manuscript scholarship to 21st-century non-profit governance, explore our enduring milestones.
          </p>
        </Reveal>

        <div className="relative mt-16">
          {/* Vertical Center Line for desktop */}
          <div className="absolute bottom-4 left-6 top-4 w-0.5 bg-gradient-to-b from-[#C59A52] via-[#971515] to-[#C59A52] md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-12">
            {TIMELINE.map((item, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={item.year}
                  className={`relative flex flex-col md:flex-row ${
                    isEven ? "md:flex-row-reverse" : ""
                  } items-start md:items-center`}
                >
                  {/* Content Box */}
                  <div className="ml-14 w-[calc(100%-3.5rem)] md:ml-0 md:w-1/2 md:px-8">
                    <Reveal delay={idx * 0.08}>
                      <div className="rounded-2xl border border-[#C59A52]/40 bg-[#FFF9ED] p-6 shadow-md transition-shadow hover:shadow-xl sm:p-7">
                        <div className="flex items-center justify-between gap-2 border-b border-[#C59A52]/30 pb-3">
                          <span className="font-serif text-2xl font-bold text-[#971515]" style={serif}>
                            {item.year}
                          </span>
                          <span className="rounded-full bg-[#E8B94F]/20 px-3 py-1 font-[Inter] text-xs font-semibold text-[#78372B]">
                            {item.era}
                          </span>
                        </div>
                        <h3 className="mt-3 text-xl font-bold text-[#39251D]" style={serif}>
                          {item.title}
                        </h3>
                        <p className="mt-2 font-[Inter] text-sm leading-relaxed text-[#39251D]/85">
                          {item.desc}
                        </p>
                      </div>
                    </Reveal>
                  </div>

                  {/* Marker Dot */}
                  <div className="absolute left-6 top-6 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[#971515] bg-[#FFF9ED] shadow-md md:left-1/2 md:top-1/2 md:-translate-y-1/2">
                    <span className="h-3 w-3 rounded-full bg-[#E8B94F]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function MissionValues() {
  return (
    <section
      id="values"
      className="bg-[#FFF9ED] py-24"
      style={{
        backgroundImage:
          "radial-gradient(rgba(120,55,43,.04) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-8 md:grid-cols-2">
          {[
            {
              title: "Our Mission",
              bengali: "আমাদের উদ্দেশ্য",
              desc: "To preserve and share the unadulterated Gaudiya Vaishnava tradition of Sri Chaitanya Mahaprabhu and Gadadhar Pandit Prabhu, transforming inner devotion into practical, loving service for the spiritual and educational upliftment of Nabadwip and the world.",
            },
            {
              title: "Our Vision",
              bengali: "আমাদের স্বপ্ন",
              desc: "A harmonious society where bhakti, education, and universal compassion go hand in hand; where medieval caste discrimination is thoroughly dismantled, and where every soul is embraced with dignity and spiritual equality.",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.12}>
              <div className="relative h-full rounded-2xl border-2 border-[#C59A52]/60 bg-white/70 p-8 shadow-sm transition-all hover:border-[#971515] hover:shadow-lg">
                <span className="font-serif text-sm font-semibold text-[#A88955]" style={beng}>
                  {item.bengali}
                </span>
                <h2 className="mt-2 text-3xl font-bold text-[#78372B]" style={serif}>
                  {item.title}
                </h2>
                <p className="mt-4 font-[Inter] leading-relaxed text-[#39251D]/90">
                  {item.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20 text-center">
          <Eyebrow>What guides our every action</Eyebrow>
          <h2 className="mt-3 text-4xl font-bold text-[#78372B] sm:text-5xl" style={serif}>
            Our Core Values
          </h2>
          <Lotus className="mt-4" />
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={i * 0.1}>
                <div className="group flex h-full flex-col justify-between rounded-xl border border-[#C59A52]/50 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#971515] hover:shadow-md">
                  <div>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF9ED] border border-[#C59A52]/50 text-[#971515] transition-colors group-hover:bg-[#971515] group-hover:text-white">
                      <Icon size={24} />
                    </div>
                    <p className="mt-4 text-xs font-bold tracking-widest text-[#A88955]" style={serif}>
                      0{i + 1}
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-[#78372B]" style={serif}>
                      {item.title}
                    </h3>
                    <p className="mt-3 font-[Inter] text-sm leading-relaxed text-[#39251D]/85">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Registration() {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <section id="registration" className="relative overflow-hidden bg-[#FFF9ED] py-24">
      <Om pos="-right-10 top-10" />

      <div className="relative mx-auto max-w-5xl px-5">
        <Reveal className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C59A52]/50 bg-[#E8B94F]/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[#78372B]">
            <ShieldCheck size={16} className="text-[#971515]" />
            NITI Aayog DARPAN & Section 8 Certified
          </div>
          <h2 className="mt-4 text-4xl font-bold text-[#78372B] sm:text-5xl" style={serif}>
            Registration & Transparency
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-[Inter] text-[#39251D]/80">
            Sri Sri Chintamoni Kunja Foundation is a legally recognized, registered non-profit organization (Section 8 Company) accredited on the official Government of India NITI Aayog NGO-DARPAN portal.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className={`mt-12 overflow-hidden rounded-2xl bg-white shadow-xl ${frame}`}>
            {/* Header banner */}
            <div className="flex flex-wrap items-center justify-between border-b border-[#C59A52]/30 bg-gradient-to-r from-[#78372B] to-[#971515] px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <Landmark size={22} className="text-[#E8B94F]" />
                <span className="font-serif text-lg font-bold" style={serif}>
                  Government Registered Credentials
                </span>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 border border-emerald-400/30 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Active & Verified
              </span>
            </div>

            {/* Grid of details */}
            <dl className="grid sm:grid-cols-2">
              {REGISTRATION.map(([k, v], i) => {
                const isCopyable = k === "Registration No." || k === "DARPAN ID";
                return (
                  <div
                    key={k}
                    className={`flex items-center justify-between gap-4 border-b border-[#C59A52]/20 px-6 py-4.5 ${
                      i % 2 === 0 ? "sm:border-r" : ""
                    } transition-colors hover:bg-[#FFF9ED]/60`}
                  >
                    <div>
                      <dt className="font-[Inter] text-xs font-semibold tracking-wider text-[#A88955]">
                        {k.toUpperCase()}
                      </dt>
                      <dd className="mt-0.5 text-lg font-bold text-[#39251D]" style={serif}>
                        {v}
                      </dd>
                    </div>

                    {isCopyable && (
                      <button
                        onClick={() => copyToClipboard(v, k)}
                        className="rounded-lg border border-[#C59A52]/40 bg-[#FFF9ED] p-2 text-[#78372B] transition-colors hover:bg-[#C59A52]/20"
                        title={`Copy ${k}`}
                      >
                        {copiedKey === k ? (
                          <Check size={16} className="text-emerald-600" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </dl>

            {/* Verification Footer Note */}
            <div className="border-t border-[#C59A52]/30 bg-[#FFF9ED]/60 px-6 py-4">
              <p className="font-[Inter] text-xs leading-relaxed text-[#39251D]/75">
                * All donations and operations are strictly overseen in accordance with the Companies Act 2013 and Section 8 non-profit guidelines. Official DARPAN certificate issued by the Government of India is available for public download below.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={CERT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#971515] px-8 py-3.5 font-[Inter] text-sm font-semibold text-white shadow-lg shadow-[#971515]/25 transition-all hover:bg-[#78372B]"
            >
              <FileText size={18} />
              View DARPAN Certificate
              <ExternalLink size={16} className="opacity-80" />
            </a>

            <a
              href={CERT}
              download="SRI-SRI-CHINTAMONI-KUNJA-FOUNDATION-DARPAN-CERTIFICATE.pdf"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#78372B] px-8 py-3 font-[Inter] text-sm font-semibold text-[#78372B] transition-all hover:bg-[#78372B] hover:text-[#FFF9ED]"
            >
              <Download size={18} />
              Download Official PDF
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Bearers() {
  return (
    <section id="office-bearers" className="relative bg-[#39251D] py-24 text-[#FFF9ED]">
      <div className="mx-auto max-w-5xl px-5">
        <Reveal className="text-center">
          <Eyebrow light>Governance & Stewardship</Eyebrow>
          <h2 className="mt-3 text-4xl font-bold sm:text-5xl" style={serif}>
            Office Bearers
          </h2>
          <Lotus className="mt-4" />
          <p className="mx-auto mt-4 max-w-xl font-[Inter] text-sm text-[#FFF9ED]/80">
            Dedicated trustees committed to institutional integrity, spiritual lineage, and transparent service to humanity.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {BEARERS.map((b, i) => (
            <Reveal key={b.name} delay={i * 0.12}>
              <div className="flex h-full flex-col justify-between rounded-t-[999px] rounded-b-2xl border border-[#C59A52]/60 bg-gradient-to-b from-[#FFF9ED]/10 via-[#FFF9ED]/5 to-transparent px-6 pb-8 pt-12 text-center backdrop-blur-sm transition-all duration-300 hover:border-[#E8B94F] hover:shadow-xl">
                <div>
                  <div
                    className="mx-auto grid h-20 w-20 place-items-center rounded-full border-2 border-[#C59A52] bg-[#39251D] text-4xl text-[#E8B94F] shadow-inner"
                    style={deva}
                    aria-hidden="true"
                  >
                    ॐ
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-[#FFF9ED]" style={serif}>
                    {b.name}
                  </h3>
                  <p className="mt-1 font-[Inter] text-sm font-semibold text-[#E8B94F]">
                    {b.role}
                  </p>
                  <p className="mt-3 font-[Inter] text-xs leading-relaxed text-[#FFF9ED]/80">
                    {b.desc}
                  </p>
                </div>

                <div className="mt-6 border-t border-[#C59A52]/30 pt-4">
                  <span className="font-[Inter] text-[11px] uppercase tracking-wider text-[#E3B873]">
                    Board of Directors
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const rows = [
    {
      label: "Address",
      value: ADDRESS,
      icon: MapPin,
      href: null,
    },
    {
      label: "Helpline 1",
      value: "947-490-5910",
      icon: Phone,
      href: "tel:+919474905910",
      nowrap: true,
    },
    {
      label: "Helpline 2",
      value: "96790 14230",
      icon: Phone,
      href: "tel:+919679014230",
      nowrap: true,
    },
    {
      label: "Email",
      value: "krishnendu04091985@gmail.com",
      icon: Mail,
      href: "mailto:krishnendu04091985@gmail.com",
    },
    {
      label: "Website",
      value: "chintamonikunja.org",
      icon: Globe,
      href: "https://chintamonikunja.org/",
    },
    {
      label: "Temple Darshan",
      value: "6:00 AM – 12:30 PM & 4:30 PM – 8:30 PM Daily",
      icon: Clock,
      href: null,
    },
  ];

  return (
    <section id="contact" className="bg-[#EDE0C9]/60 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
        <Reveal>
          <div className="relative">
            <Parallax
              src={A.kirtan}
              alt="Kirtan by the sacred ghats"
              className={`aspect-[4/3] rounded-2xl ${frame}`}
            />
            <div className="absolute -bottom-4 right-4 rounded-xl border border-[#C59A52] bg-[#FFF9ED]/95 px-5 py-3 shadow-lg">
              <p className="font-serif text-sm font-bold text-[#971515]" style={serif}>
                Sacred Pilgrimage to Nabadwip Dham
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <Eyebrow>Pilgrimage & Outreach</Eyebrow>
          <h2 className="mt-3 text-4xl font-bold text-[#78372B] sm:text-5xl" style={serif}>
            Visit & Connect
          </h2>
          <Lotus className="!justify-start my-4" />

          <p className="font-[Inter] text-sm text-[#39251D]/80">
            Whether you are visiting Nabadwip Dham as a pilgrim, inquiring about our academic programs, or seeking spiritual guidance, our doors are always open.
          </p>

          <dl className="mt-6 divide-y divide-[#C59A52]/40 border-y border-[#C59A52]/40">
            {rows.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="grid items-center gap-2 py-3.5 sm:grid-cols-[130px_1fr]">
                  <dt className="flex items-center gap-2 font-[Inter] text-xs font-semibold tracking-wide text-[#971515]">
                    <Icon size={15} className="shrink-0 text-[#C59A52]" />
                    <span>{row.label.toUpperCase()}</span>
                  </dt>
                  <dd className={`font-[Inter] text-sm text-[#39251D] ${row.nowrap ? "whitespace-nowrap" : "break-words"}`}>
                    {row.href ? (
                      <a
                        href={row.href}
                        {...(row.href.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className={`font-semibold underline decoration-[#C59A52] underline-offset-4 transition-colors hover:text-[#971515] ${
                          row.nowrap ? "whitespace-nowrap" : ""
                        }`}
                      >
                        {row.value}
                      </a>
                    ) : (
                      <span>{row.value}</span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-[#FFF9ED] py-24">
      <div className="mx-auto max-w-4xl px-5">
        <Reveal className="text-center">
          <Eyebrow>Pilgrim & Seva Inquiries</Eyebrow>
          <h2 className="mt-3 text-4xl font-bold text-[#78372B] sm:text-5xl" style={serif}>
            Frequently Asked Questions
          </h2>
          <Lotus className="mt-4" />
        </Reveal>

        <div className="mt-12 space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Reveal key={faq.q} delay={idx * 0.05}>
                <div className="overflow-hidden rounded-xl border border-[#C59A52]/50 bg-white shadow-sm transition-all">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left font-serif text-lg font-bold text-[#78372B] transition-colors hover:text-[#971515]"
                    style={serif}
                  >
                    <span>{faq.q}</span>
                    <span className="shrink-0 text-[#C59A52]">
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="border-t border-[#C59A52]/20 bg-[#FFF9ED]/50 p-5 font-[Inter] text-sm leading-relaxed text-[#39251D]/90">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Invite() {
  return (
    <section className="relative overflow-hidden bg-[#78372B] py-24 text-center text-[#FFF9ED]">
      <Parallax src={A.golden} alt="Golden riverside devotion" speed={50} className="absolute inset-0 opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#78372B] via-transparent to-[#78372B]" />

      <Reveal className="relative mx-auto max-w-3xl px-5">
        <h2 className="text-4xl font-bold sm:text-5xl lg:text-6xl" style={serif}>
          Walk This Path With Us
        </h2>
        <p className="mt-4 text-xl italic text-[#E8B94F] sm:text-2xl" style={serif}>
          “Every act of compassion turns the wheel of divine devotion.”
        </p>
        <p className="mx-auto mt-4 max-w-xl font-[Inter] text-sm text-[#FFF9ED]/85">
          Join our Zero Starvation Movement, support underprivileged students in Nabadwip Dham, or participate in our daily temple seva.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 font-[Inter] text-sm font-semibold sm:flex-row">
          <Link
            to="/donate"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E8B94F] px-8 py-3.5 text-[#54251E] shadow-xl shadow-black/30 transition-all hover:bg-[#F4D27E] hover:scale-105"
          >
            <HeartHandshake size={18} />
            Support Our Seva
          </Link>
          <Link
            to="/gallery"
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#E8B94F] px-8 py-3 text-[#FFF9ED] transition-all hover:bg-[#E8B94F] hover:text-[#39251D]"
          >
            Explore Sacred Gallery
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

/* ==================================================================
   Main Export: About Page
================================================================== */

export default function About() {
  return (
    <div className="bg-[#FFF9ED] font-[Inter] text-[#39251D] antialiased selection:bg-[#E8B94F] selection:text-[#39251D]">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: none; }
        }
        html { scroll-behavior: smooth; }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
        }
      `}</style>
      <main>
        <Banner />
        <ImpactMetrics />
        <Story />
        <Name />
        <SocialReform />
        <TimelineSection />
        <MissionValues />
        <Registration />
        <Bearers />
        <Contact />
        <FaqSection />
        <Invite />
      </main>
    </div>
  );
}

