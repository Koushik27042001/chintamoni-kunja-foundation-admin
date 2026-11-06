import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/* ==================================================================
   The Art of Living – Sri Sri Chintamoni Kunja Foundation
   React + Tailwind v3 · npm i framer-motion · same fonts/palette as Home.jsx
   Images: client/public/art-of-living/*.png (served from /art-of-living/...)
   Render <ArtOfLiving /> between your Header and <Footer />.
================================================================== */
const IMG = {
  spiritual: "/art-of-living/spiritual-activity.png",
  principles: "/art-of-living/five-principal.png",
  meditation: "/art-of-living/medition.png", // file name as supplied
  food: "/art-of-living/food-donation.png",
};

const PRINCIPLES = [
  [
    "Devotion",
    "A Connection Beyond the Self",
    "Devotion is the foundation of a spiritual life. Through remembrance, prayer, chanting and contemplation, we cultivate a deeper connection with Lord Krishna and develop love, gratitude and humility.",
  ],
  [
    "Self-Awareness",
    "Understanding the Inner Self",
    "A meaningful life begins with understanding our thoughts, emotions, actions and intentions. Self-reflection helps us recognise our habits, develop patience and make conscious choices that support growth.",
  ],
  [
    "Compassion",
    "Seeing Humanity with Respect",
    "Inspired by the teachings associated with Sri Chaitanya Mahaprabhu, we believe kindness, respect and understanding should guide our interactions beyond divisions of caste, class and social background.",
  ],
  [
    "Balance",
    "Harmony in Everyday Life",
    "A balanced life attends to thoughts, responsibilities, relationships, rest and spiritual practice. The Bhagavad Gita speaks of moderation in food, recreation, work, sleep and wakefulness.",
  ],
  [
    "Seva",
    "The Spirituality of Service",
    "Service is compassion in action. Helping someone in need, supporting education, contributing to healthcare and sharing food bring spiritual values into everyday life.",
  ],
];

const MEDITATION_FOCUS = [
  "Guided meditation and reflection",
  "Awareness of thoughts and emotions",
  "Developing patience and self-discipline",
  "Spiritual contemplation and remembrance",
  "Personal growth and responsible living",
  "Access to appropriate counselling guidance",
];

const COUNSEL_FOCUS = [
  "Emotional awareness",
  "Personal reflection",
  "Positive interpersonal relationships",
  "Responsible decision-making",
  "Stress-management education",
  "Guidance towards appropriate professional support",
];

const EVERYDAY = [
  ["At Home", "Practise patience, gratitude, understanding and respect within the family."],
  ["In Society", "Treat people with dignity and contribute to a more compassionate community."],
  ["In Education", "Encourage knowledge, discipline, curiosity and character development."],
  ["At Work", "Practise honesty, responsibility, fairness and dedication."],
  ["In Personal Life", "Make time for reflection, devotion, healthy routines and continuous learning."],
];

const PRACTICES = [
  ["Nāma-Sankirtan", "Participating in the congregational chanting and singing of the Divine Names."],
  ["Japa & Remembrance", "Setting aside time for personal mantra meditation and remembrance, according to one's tradition."],
  ["Śāstra Study", "Reading and reflecting on the Bhagavad Gita, Śrīmad-Bhāgavatam and devotional teachings."],
  ["Satsang", "Learning and reflecting in the company of spiritual practitioners and teachers."],
  ["Seva", "Practising compassion through service to people and the community."],
  ["Self-Reflection", "Reviewing one's thoughts, behaviour and intentions with sincerity and humility."],
];

const INITIATIVES = [
  ["Zero Starvation Movement", "Working towards a society where access to food is not determined by caste, class or religion."],
  ["Academic Assistance", "Supporting students through educational assistance and opportunities for learning."],
  ["Healthcare Initiatives", "Encouraging access to healthcare-related support within local communities."],
  ["Humanitarian Relief", "The Foundation reports having served more than one lakh meals during COVID-19 and other natural calamities."],
];

const GUIDELINES = [
  "Chanting hymns is a mental exercise that makes you mentally strong.",
  "Telling the truth is the window of your mind that drains out the mental garbage deposited through life's journey.",
  "Respect all people regardless of caste, class or religion.",
  "Food is essential for health and survival. Prepare it for nourishment, not only to please the taste buds.",
  "Food habits are shaped by nature, by what is available and by lifestyle, so do not hate others' lifestyles or food habits.",
  "Do not live in luxury. Fulfil your necessities, because luxury makes you mentally and physically weak.",
  "Meditation is the best way to subdue physical and mental desires and to choose your life path.",
  "The keyword of our spirituality is Aadhyatma, knowledge of the inner soul, so literacy and basic education are necessary for Sanatan spirituality.",
  "Serve your society at your best level. This is the best service to your beloved God.",
  "Observe fasts such as Ekadashi, Purnima and Amavasya for fitness and health. People with existing medical conditions must consult a physician before fasting.",
];

const serif = { fontFamily: "'Cormorant Garamond','Playfair Display',serif" };
const deva = { fontFamily: "'Noto Serif Devanagari',serif" };
const frame = "border border-[#C59A52] shadow-[0_0_0_6px_#FFF9ED,0_0_0_7px_rgba(197,154,82,.6)]";
const dots = {
  backgroundImage: "radial-gradient(rgba(120,55,43,.05) 1px,transparent 1px)",
  backgroundSize: "22px 22px",
};

/* ---------- helpers ---------- */
function Reveal({ children, className = "", delay = 0 }) {
  const calm = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={calm ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: "easeOut" }}
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

const Eyebrow = ({ n, children, light }) => (
  <p
    className={`font-[Inter] text-xs font-semibold tracking-[0.25em] ${
      light ? "text-[#E3B873]" : "text-[#D98232]"
    }`}
  >
    {n} — {children.toUpperCase()}
  </p>
);

const H2 = ({ children, light }) => (
  <h2
    className={`mt-3 text-4xl font-bold sm:text-5xl ${
      light ? "text-[#FFF9ED]" : "text-[#78372B]"
    }`}
    style={serif}
  >
    {children}
  </h2>
);

const P = ({ children, light, className = "" }) => (
  <p
    className={`font-[Inter] leading-relaxed ${
      light ? "text-[#FFF9ED]/90" : "text-[#39251D]/90"
    } ${className}`}
  >
    {children}
  </p>
);

const Btn = ({ href, children, kind = "solid" }) => {
  const isInternal = href && href.startsWith("/") && !href.startsWith("/#");
  const className = `inline-block rounded-full px-7 py-3 font-[Inter] text-sm font-semibold transition-all ${
    kind === "solid"
      ? "bg-[#D98232] text-white shadow-lg shadow-black/20 hover:bg-[#BD6D22]"
      : kind === "gold"
      ? "border-2 border-[#E3B873] text-[#E3B873] hover:bg-[#E3B873] hover:text-[#39251D]"
      : "border-2 border-[#78372B] text-[#78372B] hover:bg-[#78372B] hover:text-[#FFF9ED]"
  }`;

  if (isInternal) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
};

const Check = ({ items, light }) => (
  <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
    {items.map((t) => (
      <li
        key={t}
        className={`flex gap-3 font-[Inter] text-sm ${
          light ? "text-[#FFF9ED]/90" : "text-[#39251D]/90"
        }`}
      >
        <span className="mt-0.5 text-[#C59A52]" aria-hidden="true">
          ✦
        </span>
        {t}
      </li>
    ))}
  </ul>
);

/* ---------- sections ---------- */
function Hero() {
  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-[#39251D] text-center text-[#FFF9ED]">
      <Parallax src={IMG.spiritual} alt="Spiritual Activity" speed={70} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#39251D]/75 via-[#39251D]/55 to-[#39251D]/90" />
      <div aria-hidden="true" className="absolute inset-0 motion-reduce:hidden">
        {Array.from({ length: 14 }, (_, k) => (
          <span
            key={k}
            className="absolute bottom-0 h-1.5 w-1.5 animate-[floatUp_14s_linear_infinite] rounded-full bg-[#E3B873]/70 blur-[1px]"
            style={{
              left: `${(k * 41) % 100}%`,
              animationDelay: `${(k * 1.4) % 12}s`,
              animationDuration: `${12 + (k % 5) * 3}s`,
            }}
          />
        ))}
      </div>
      <div className="relative z-10 mx-auto max-w-3xl px-5 py-20">
        <p className="animate-[fadeUp_1.4s_ease-out_both] font-[Inter] text-xs font-semibold tracking-[0.25em] text-[#E3B873] motion-reduce:animate-none">
          THE ART OF LIVING • NABADWIP DHAM
        </p>
        <h1
          className="mt-5 animate-[fadeUp_1.6s_.3s_ease-out_both] text-5xl font-bold leading-[1.05] motion-reduce:animate-none sm:text-7xl"
          style={serif}
        >
          Discover the Art of Living Through Devotion
        </h1>
        <p
          className="mt-3 animate-[fadeUp_1.6s_.6s_ease-out_both] text-xl italic text-[#E3B873] motion-reduce:animate-none sm:text-3xl"
          style={serif}
        >
          A journey towards devotion, inner peace and a meaningful life
        </p>
        <P light className="mx-auto mt-6 max-w-2xl">
          True living is not simply about what we achieve, but how we think, how we treat others and how deeply we connect with the purpose of life. We believe devotion, self-awareness, compassion and service can guide individuals towards a more meaningful and harmonious way of living.
        </P>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Btn href="#philosophy">Explore Our Philosophy</Btn>
          <Btn href="#practices" kind="gold">
            Begin Your Spiritual Journey
          </Btn>
        </div>
      </div>
    </section>
  );
}

function What() {
  return (
    <section className="relative overflow-hidden bg-[#FFF9ED] py-24">
      <Om pos="-left-10 top-0" />
      <Reveal className="relative mx-auto max-w-3xl px-5 text-center">
        <Eyebrow n="02">What is the Art of Living?</Eyebrow>
        <H2>Beyond Rituals, Towards a Meaningful Life</H2>
        <Lotus className="my-6" />
        <P>
          The Art of Living encourages us to look beyond external practices and explore the deeper meaning of existence. Rooted in the devotional philosophy of Sri Chaitanya Mahaprabhu and the Vaishnava tradition, it values inner transformation, humility, compassion, spiritual awareness and loving service.
        </P>
        <P className="mt-4">
          It encourages a balanced relationship with ourselves, our surroundings, our communities and the Divine. Spirituality is not limited to a place or an occasion. It can become part of our everyday thoughts, decisions, relationships and actions.
        </P>
      </Reveal>
    </section>
  );
}

function Principles() {
  return (
    <section id="philosophy" className="py-24" style={{ ...dots, backgroundColor: "rgba(237,224,201,.6)" }}>
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="text-center">
          <Eyebrow n="03">Our philosophy</Eyebrow>
          <H2>Five Principles for a Meaningful Life</H2>
        </Reveal>
        <div className="mt-14 grid items-start gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <Reveal className="lg:sticky lg:top-24">
            <Parallax
              src={IMG.principles}
              alt="The five principles of the Art of Living"
              speed={30}
              className={`aspect-[4/5] rounded-xl ${frame}`}
            />
          </Reveal>
          <ol className="space-y-5">
            {PRINCIPLES.map(([t, s, d], i) => (
              <Reveal key={t} delay={0.05}>
                <li className="flex gap-5 rounded-xl border border-[#C59A52]/50 bg-[#FFF9ED] p-6 shadow-sm">
                  <span className="text-5xl leading-none text-[#C59A52]" style={serif}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-2xl font-bold text-[#78372B]" style={serif}>
                      {t}
                    </h3>
                    <p className="font-[Inter] text-sm font-semibold text-[#D98232]">{s}</p>
                    <P className="mt-2 text-sm">{d}</P>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Mahaprabhu() {
  return (
    <section className="relative overflow-hidden bg-[#78372B] py-24 text-[#FFF9ED]">
      <Mandala className="absolute left-1/2 top-1/2 aspect-square h-[150%] min-h-[700px] -translate-x-1/2 -translate-y-1/2 opacity-[.12]" />
      <Reveal className="relative mx-auto max-w-3xl px-5 text-center">
        <Eyebrow n="04" light>Inspired by Sri Chaitanya Mahaprabhu</Eyebrow>
        <H2 light>The Path of Love, Humility and Sankirtan</H2>
        <P light className="mt-6">
          Sri Chaitanya Mahaprabhu's devotional teachings occupy a central place in the spiritual heritage of Nabadwip. His emphasis on Krishna-bhakti, congregational chanting and humility continues to inspire devotees across generations.
        </P>
        <P light className="mt-4">
          His Śikṣāṣṭakam, eight devotional verses, reflects on the transformative power of Krishna's holy name, humility, tolerance and unconditional devotion.
        </P>
        <blockquote
          className="mx-auto my-8 max-w-xl rounded-2xl border border-[#C59A52]/60 bg-[#FFF9ED]/5 p-8 text-2xl italic text-[#E3B873]"
          style={serif}
        >
          Be humbler than a blade of grass, more tolerant than a tree, ready to offer respect to others, and free from the desire for personal recognition.
          <footer className="mt-3 font-[Inter] text-xs not-italic tracking-wide text-[#FFF9ED]/60">
            A central teaching of the Śikṣāṣṭakam, in paraphrase
          </footer>
        </blockquote>
        <Btn href="/about-us" kind="gold">
          Explore the Teachings of Mahaprabhu
        </Btn>
      </Reveal>
    </section>
  );
}

function Meditation() {
  return (
    <section id="meditation" className="bg-[#FFF9ED] py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
        <Reveal>
          <Parallax
            src={IMG.meditation}
            alt="Meditation and inner reflection"
            className={`aspect-[4/5] rounded-t-[999px] rounded-b-xl ${frame}`}
          />
        </Reveal>
        <Reveal delay={0.1}>
          <Eyebrow n="05">Meditation & inner reflection</Eyebrow>
          <H2>Discover the Stillness Within</H2>
          <P className="mt-5">
            In the midst of everyday responsibilities, taking time for reflection can help us become more attentive to our thoughts, emotions and actions.
          </P>
          <P className="mt-4">
            The Foundation describes its recent work as exploring a distinctive approach to meditation and personal development, alongside conventional ritual-based spiritual activities, bringing together spiritual reflection and contemporary counselling perspectives.
          </P>
          <h3 className="mt-6 text-2xl font-bold text-[#78372B]" style={serif}>
            Our areas of focus
          </h3>
          <Check items={MEDITATION_FOCUS} />
          <div className="mt-8">
            <Btn href="/contact-us" kind="outline">
              Learn About Our Meditation Initiative
            </Btn>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Counselling() {
  return (
    <section className="py-24" style={{ ...dots, backgroundColor: "rgba(237,224,201,.6)" }}>
      <Reveal className="mx-auto max-w-4xl px-5">
        <div className="text-center">
          <Eyebrow n="06">Psychology & counselling</Eyebrow>
          <H2>Understanding the Mind, Supporting the Individual</H2>
        </div>
        <P className="mt-6">
          Personal growth involves understanding our thoughts, emotions, relationships and experiences. The Foundation's stated recent initiatives include working with counselling and psychology professionals as part of its approach to individual development. Through guidance, reflective practice and supportive conversation, individuals may better understand personal challenges and make more informed decisions.
        </P>
        <div className="mt-8 rounded-xl border-l-4 border-[#D98232] bg-[#FFF9ED] p-6 shadow-sm">
          <P className="text-sm">
            <strong className="text-[#78372B]">An important note:</strong> Spiritual guidance and professional mental-health care serve different but potentially complementary roles. Where clinical or psychological support is required, individuals should be guided towards appropriately qualified professionals.
          </P>
        </div>
        <h3 className="mt-8 text-2xl font-bold text-[#78372B]" style={serif}>
          Our intended areas of focus
        </h3>
        <Check items={COUNSEL_FOCUS} />
      </Reveal>
    </section>
  );
}

function Everyday() {
  return (
    <section className="bg-[#39251D] py-24 text-[#FFF9ED]">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="text-center">
          <Eyebrow n="07" light>
            Everyday life
          </Eyebrow>
          <H2 light>Let Every Action Become Meaningful</H2>
          <P light className="mx-auto mt-4 max-w-xl">
            Spiritual living is not limited to meditation or prayer. It is reflected in how we conduct our everyday lives.
          </P>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {EVERYDAY.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.08}>
              <div className="h-full rounded-xl border border-[#C59A52]/50 bg-[#FFF9ED]/5 p-6 text-center backdrop-blur-sm transition-transform hover:-translate-y-1">
                <h3 className="text-2xl font-bold text-[#E3B873]" style={serif}>
                  {t}
                </h3>
                <p className="mt-2 font-[Inter] text-sm leading-relaxed text-[#FFF9ED]/80">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Practices() {
  return (
    <section id="practices" className="relative overflow-hidden bg-[#FFF9ED] py-24">
      <Om pos="-right-10 top-6" />
      <div className="relative mx-auto max-w-6xl px-5">
        <Reveal className="text-center">
          <Eyebrow n="08">Spiritual practices</Eyebrow>
          <H2>Small Practices, Meaningful Transformation</H2>
          <P className="mx-auto mt-4 max-w-xl text-sm text-[#78372B]">
            These are devotional and reflective activities, not medical treatments or guaranteed methods of achieving specific outcomes.
          </P>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PRACTICES.map(([t, d], i) => (
            <Reveal key={t} delay={(i % 3) * 0.1}>
              <div className="h-full rounded-xl border border-[#C59A52]/60 bg-white/60 p-7 shadow-sm transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none">
                <p className="text-3xl text-[#C59A52]" style={serif}>
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1 text-2xl font-bold text-[#78372B]" style={serif}>
                  {t}
                </h3>
                <P className="mt-2 text-sm">{d}</P>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Humanity() {
  return (
    <section className="py-24" style={{ ...dots, backgroundColor: "rgba(237,224,201,.6)" }}>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
        <Reveal>
          <Eyebrow n="09">Devotion & humanity</Eyebrow>
          <H2>Where Spiritual Values Become Social Responsibility</H2>
          <P className="mt-5">
            At the Foundation, spirituality is connected with the responsibility to care for fellow human beings. Our philosophy of service is reflected in initiatives that address social needs.
          </P>
          <dl className="mt-6 space-y-4">
            {INITIATIVES.map(([t, d]) => (
              <div key={t} className="border-l-2 border-[#C59A52] pl-4">
                <dt className="text-xl font-bold text-[#78372B]" style={serif}>
                  {t}
                </dt>
                <dd className="font-[Inter] text-sm leading-relaxed text-[#39251D]/85">{d}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8">
            <Btn href="/donate">Discover Our Social Initiatives</Btn>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Parallax
            src={IMG.food}
            alt="Food donation seva"
            className={`aspect-[4/5] rounded-xl ${frame}`}
          />
        </Reveal>
      </div>
    </section>
  );
}

function Guidelines() {
  return (
    <section className="relative overflow-hidden bg-[#78372B] py-24 text-[#FFF9ED]">
      <Mandala className="absolute -right-40 top-10 h-[560px] opacity-[.14]" />
      <div className="relative mx-auto max-w-4xl px-5">
        <Reveal className="text-center">
          <Eyebrow n="10" light>
            Our living guidelines
          </Eyebrow>
          <H2 light>Ten Teachings for Daily Life</H2>
          <Lotus className="mt-6" />
        </Reveal>
        <ol className="mt-12 space-y-4">
          {GUIDELINES.map((g, i) => (
            <Reveal key={i}>
              <li className="flex gap-5 rounded-xl border border-[#C59A52]/40 bg-[#FFF9ED]/5 p-5 shadow-sm">
                <span
                  className="w-10 shrink-0 text-4xl leading-none text-[#E3B873]"
                  style={serif}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-[Inter] leading-relaxed text-[#FFF9ED]/90">{g}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Message() {
  return (
    <section className="bg-[#FFF9ED] py-24 text-center">
      <Reveal className="mx-auto max-w-3xl px-5">
        <Eyebrow n="11">A message for every individual</Eyebrow>
        <H2>Begin with Yourself. Grow Through Devotion. Serve Through Compassion.</H2>
        <Lotus className="my-6" />
        <P>
          You do not need to change everything in a single day. Begin with a kind thought. Practise patience. Take time for reflection. Develop gratitude. Respect others. Offer service wherever possible.
        </P>
        <P className="mt-4">
          A meaningful life grows through consistent actions, sincere devotion and the willingness to become a better human being. The Art of Living is a journey that continues with every thought, every decision and every act of kindness.
        </P>
      </Reveal>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-[#39251D] py-24 text-center text-[#FFF9ED]">
      <Parallax src={IMG.spiritual} alt="Spiritual journey background" speed={50} className="absolute inset-0 opacity-20" />
      <Reveal className="relative mx-auto max-w-3xl px-5">
        <H2 light>Walk the Path of Devotion and Service</H2>
        <P light className="mt-4">
          Discover a way of life inspired by devotion, wisdom, compassion and humanity. Join us in exploring the spiritual heritage of Sri Sri Chintamoni Kunja Foundation, Nabadwip Dham.
        </P>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Btn href="/about-us">Explore Our Spiritual Heritage</Btn>
          <Btn href="/donate" kind="gold">
            Discover Our Seva Initiatives
          </Btn>
          <Btn href="/contact-us" kind="gold">
            Contact the Foundation
          </Btn>
        </div>
        <p className="mx-auto mt-12 max-w-xl text-2xl italic text-[#E3B873]" style={serif}>
          “Let devotion guide the heart, wisdom guide the mind and compassion guide every action.”
        </p>
        <p className="mt-3 font-[Inter] text-xs tracking-wide text-[#FFF9ED]/60">
          Sri Sri Chintamoni Kunja Foundation • Nabadwip Dham, Nadia, West Bengal, India
        </p>
      </Reveal>
    </section>
  );
}

export default function ArtOfLiving() {
  return (
    <div className="bg-[#FFF9ED] font-[Inter] text-[#39251D] antialiased">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes floatUp {
          from { transform: translateY(0); opacity: 0; }
          15% { opacity: 1; }
          to { transform: translateY(-90vh); opacity: 0; }
        }
        html { scroll-behavior: smooth; }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
        }
      `}</style>
      <main>
        <Hero />
        <What />
        <Principles />
        <Mahaprabhu />
        <Meditation />
        <Counselling />
        <Everyday />
        <Practices />
        <Humanity />
        <Guidelines />
        <Message />
        <FinalCta />
      </main>
    </div>
  );
}

