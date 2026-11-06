import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useInView, useReducedMotion, animate } from "framer-motion";
import { getGalleryAPI } from "../services/api";

/* ==================================================================
   Sri Sri Chintamoni Kunja Foundation – Cinematic Heritage Home Page
   Needs:  npm i framer-motion      (React 18 + Tailwind v3)
   Images: client/public/assets/*.png  (served from /assets/...)
   Fonts (index.html <head>):
   <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600&family=Noto+Serif+Devanagari:wght@500;600&family=Noto+Serif+Bengali:wght@500;600&display=swap" rel="stylesheet">
   Palette: Ivory #FFF9ED · Gold #C59A52 · Maroon #78372B · Saffron #D98232 · Brown #39251D · Sand #EDE0C9
================================================================== */
const asset = (n) => encodeURI(`/assets/${n}`); // handles spaces + the ’ in file names
const A = {
  golden: asset("Krishna’s Golden Riverside Devotion.png"),
  radhaKrishna: asset("Radha and Krishna by the Riverside.png"),
  altar: asset("Opulent Gaura-Nitai and Madan Mohan Altar.png"),
  temple: asset("Nabadwip Dham Temple in Sunshine.png"),
  kirtan: asset("Golden Kirtan by the Sacred Ghats.png"),
  procession: asset("Devotional Procession Before Lord Jagannath.png"),
  separation: asset("seperation-image.png"),
  work: asset("work-image.png"),
  students: asset("students.png"),
};

/* Editable content – confirm every figure and name with the Foundation */
const STATS = [[100000, "+", "Meals served"], [2000, "+", "Students supported"]]; // foundation-provided figures
const LINEAGE = [
  { name: "Sri Krishna Chaitanya", role: "Mahaprabhu of Nabadwip", img: A.golden },
  { name: "Sri Gadadhar Pandit Prabhu", role: "Beloved associate of Mahaprabhu", img: A.altar },
  { name: "Sri Ramsundar Vidyalankar", role: "Sri Chintamoni Goswami, founder (1809)", img: A.temple },
  { name: "Succession of Revered Acharyas", role: "Sacred Lineage & Gurus of the Pariwar", img: "" },
];
const EVENTS = [["Janmashtami", "Date to be announced"], ["Gaur Purnima", "Date to be announced"], ["Rath Yatra", "Date to be announced"]];

const serif = { fontFamily: "'Cormorant Garamond','Playfair Display',serif" };
const deva = { fontFamily: "'Noto Serif Devanagari',serif" };
const beng = { fontFamily: "'Noto Serif Bengali',serif" };

/* ---------- motion helpers ---------- */
function Reveal({ children, className = "", delay = 0 }) {
  const calm = useReducedMotion();
  return (
    <motion.div className={className} initial={calm ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.9, delay, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}

function Parallax({ src, alt, speed = 50, className = "", objectPosition = "object-center", imgClassName = "" }) {
  const ref = useRef(null);
  const calm = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    calm ? [0, 0] : objectPosition.includes("top") ? [0, Math.min(speed, 30)] : [-Math.min(speed, 30), Math.min(speed, 30)]
  );
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        style={{ y }}
        className={`absolute inset-0 h-full w-full ${objectPosition} ${imgClassName || "scale-[1.05] object-cover"}`}
      />
    </div>
  );
}

function Counter({ to, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 2.2, ease: "easeOut", onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref}>{n.toLocaleString("en-IN")}{suffix}</span>;
}

/* ---------- ornaments (low opacity) ---------- */
function Mandala({ className = "", spin }) {
  const p = Array.from({ length: 16 }, (_, i) => i * 22.5);
  return (
    <svg viewBox="-100 -100 200 200" fill="none" stroke="#C59A52" strokeWidth="0.8" aria-hidden="true"
      className={`pointer-events-none ${className} ${spin ? "animate-[spin_140s_linear_infinite] motion-reduce:animate-none" : ""}`}>
      {[95, 78, 40, 22].map((r) => <circle key={r} r={r} strokeDasharray={r === 78 ? "2 3" : undefined} />)}
      {p.map((d) => (
        <g key={d} transform={`rotate(${d})`}>
          <path d="M0 -40C10 -55 10 -72 0 -78C-10 -72 -10 -55 0 -40Z" /><path d="M0 -78C6 -86 6 -92 0 -95C-6 -92 -6 -86 0 -78Z" />
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
        <path d="M30 4C38 12 38 24 30 32C22 24 22 12 30 4Z" /><path d="M30 32C22 30 12 24 10 12C18 12 26 18 30 32Z" />
        <path d="M30 32C38 30 48 24 50 12C42 12 34 18 30 32Z" /><path d="M30 32C18 34 6 30 2 22C10 20 22 24 30 32Z" />
        <path d="M30 32C42 34 54 30 58 22C50 20 38 24 30 32Z" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#C59A52] sm:w-28" />
    </div>
  );
}
const Om = ({ pos, tone = "text-[#C59A52]/10" }) => (
  <span aria-hidden="true" style={deva} className={`pointer-events-none absolute select-none text-[16rem] leading-none ${tone} ${pos}`}>ॐ</span>
);
const Frame = ({ children, className = "" }) => (
  <div className={`rounded-t-[999px] rounded-b-lg border border-[#C59A52] p-2 shadow-[0_0_0_6px_#FFF9ED,0_0_0_7px_rgba(197,154,82,.6)] ${className}`}>{children}</div>
);
const Eyebrow = ({ n, children, light }) => (
  <p className={`font-[Inter] text-xs font-semibold tracking-[0.25em] ${light ? "text-[#E3B873]" : "text-[#D98232]"}`}>{n} — {children.toUpperCase()}</p>
);
const Cta = ({ href, children, solid }) => (
  <a href={href} className={`inline-block rounded-full px-7 py-3 font-[Inter] text-sm font-semibold transition-colors ${solid ? "bg-[#D98232] text-white shadow-lg shadow-[#D98232]/30 hover:bg-[#BD6D22]" : "border-2 border-[#78372B] text-[#78372B] hover:bg-[#78372B] hover:text-[#FFF9ED]"}`}>{children}</a>
);

/* ---------- 01 cinematic opening ---------- */
function Hero() {
  const slides = [A.golden, A.temple, A.radhaKrishna];
  const [i, setI] = useState(0);
  const calm = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], calm ? [0, 0] : ["0%", "25%"]);
  useEffect(() => {
    if (calm) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [calm]);
  return (
    <section id="top" ref={ref} className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-[#39251D] text-center text-[#FFF9ED]">
      <motion.div style={{ y }} className="absolute inset-0">
        {slides.map((s, k) => (
          <img key={s} src={s} alt="" className={`absolute inset-0 h-full w-full scale-110 object-cover transition-opacity duration-[2000ms] ${k === i ? "opacity-100" : "opacity-0"}`} />
        ))}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#39251D]/70 via-[#39251D]/45 to-[#39251D]/85" />
      <div aria-hidden="true" className="absolute inset-0 motion-reduce:hidden">
        {Array.from({ length: 16 }, (_, k) => (
          <span key={k} className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-[#E3B873]/70 blur-[1px] animate-[floatUp_14s_linear_infinite]"
            style={{ left: `${(k * 37) % 100}%`, animationDelay: `${(k * 1.3) % 12}s`, animationDuration: `${12 + (k % 5) * 3}s` }} />
        ))}
      </div>
      <div className="relative z-10 mx-auto max-w-3xl px-5 py-20">
        <p className="animate-[fadeUp_1.4s_ease-out_both] text-base text-[#E3B873] sm:text-lg motion-reduce:animate-none" style={deva}>हरे कृष्ण • श्री चैतन्य महाप्रभु • नवद्वीप धाम</p>
        <h1 className="mt-6 animate-[fadeUp_1.6s_.3s_ease-out_both] text-5xl font-bold leading-[1.05] sm:text-7xl motion-reduce:animate-none" style={serif}>Sri Sri Chintamoni Kunja</h1>
        <p className="mt-3 animate-[fadeUp_1.6s_.6s_ease-out_both] text-2xl italic text-[#E3B873] sm:text-4xl motion-reduce:animate-none" style={serif}>Discover the Journey of Divine Love</p>
        <p className="mx-auto mt-6 max-w-xl animate-[fadeUp_1.6s_.9s_ease-out_both] font-[Inter] leading-relaxed text-[#FFF9ED]/85 motion-reduce:animate-none">
          A spiritual heritage experience where history, devotion, knowledge and service come together.
        </p>
        <div className="mt-9 animate-[fadeUp_1.6s_1.2s_ease-out_both] motion-reduce:animate-none">
          <a href="#history" className="inline-block rounded-full bg-[#D98232] px-8 py-3.5 font-[Inter] text-sm font-semibold text-white shadow-lg shadow-black/30 hover:bg-[#BD6D22]">Explore Our Spiritual Heritage</a>
        </div>
      </div>
    </section>
  );
}

/* ---------- 02 history since 1809 ---------- */
function History() {
  const steps = [
    {
      badge: "ESTABLISHED",
      num: "01",
      title: "1809",
      desc: "Sri Chintamoni Kunja is established by Sri Ramsundar Vidyalankar",
    },
    {
      badge: "SOCIAL REFORM",
      num: "02",
      title: "An age of reform",
      desc: "A contemporary of Raja Ram Mohan Roy, the renowned social reformer of Bengal",
    },
    {
      badge: "GAUDIYA LINEAGE",
      num: "03",
      title: "The Pariwar",
      desc: "The Sri Radha Sakti Gadadhar Pandit Pariwar, of the Madhva Gaudiya Vaishnav Sampradaya",
    },
    {
      badge: "LIVING SEVA",
      num: "04",
      title: "Today",
      desc: "The Foundation carries devotion, learning and seva forward",
    },
  ];

  return (
    <section id="history" className="relative overflow-hidden bg-[#EDE0C9]/60 py-24" style={{ backgroundImage: "radial-gradient(rgba(120,55,43,.05) 1px,transparent 1px)", backgroundSize: "22px 22px" }}>
      <Om pos="-left-10 top-0" />
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal><Parallax src={A.temple} alt="Nabadwip Dham temple in sunshine" className="aspect-[4/5] rounded-xl border border-[#C59A52] shadow-[0_0_0_6px_#FFF9ED,0_0_0_7px_rgba(197,154,82,.6)]" /></Reveal>
          <Reveal delay={0.1}>
            <Eyebrow n="02">Our history</Eyebrow>
            <h2 className="mt-3 text-4xl font-bold text-[#78372B] sm:text-5xl" style={serif}>A Journey Since 1809</h2>
            <Lotus className="!justify-start my-6" />
            <p className="font-[Inter] leading-relaxed text-[#39251D]/90">Sri Sri Chintamoni Kunja was established in 1809 by Sri Ramsundar Vidyalankar (Sri Chintamoni Goswami), an eminent academic personality and a contemporary of Raja Ram Mohan Roy, the renowned social reformer of Bengal.</p>
            <p className="mt-4 font-[Inter] leading-relaxed text-[#39251D]/90">We are a unique Sri Radha Sakti Gadadhar Pandit Pariwar sect that belongs to the Madhva Gaudiya Vaishnav Sampradaya. We also admire Lord Srikrishna Chaitanya and Lord Gadadhar Pandit Prabhu.</p>
            <div className="mt-7"><Cta href="/about-us">Discover Our History</Cta></div>
          </Reveal>
        </div>

        {/* ==============================================================
            Responsive Timeline Presentation
        ============================================================== */}

        {/* 1. Mobile-Specific Vertical Sacred Stepper (< md screens) */}
        <div className="mt-14 block md:hidden">
          <div className="relative space-y-6">
            {/* Connecting Vertical Sacred Line */}
            <div className="absolute bottom-4 left-5 top-4 w-0.5 bg-gradient-to-b from-[#D98232] via-[#C59A52] to-[#78372B]" />

            {steps.map((step, k) => (
              <Reveal key={step.title} delay={k * 0.12} className="relative flex items-start">
                {/* Stepper Node Icon */}
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#D98232] bg-[#FFF9ED] shadow-md">
                  <span className="font-serif text-xs font-bold text-[#78372B]">{step.num}</span>
                </div>

                {/* Mobile Content Card */}
                <div className="ml-4 flex-1 rounded-2xl border border-[#C59A52]/40 bg-gradient-to-br from-[#FFF9ED] via-white to-[#FFF9ED] p-4.5 shadow-sm transition-all hover:border-[#D98232] hover:shadow-md">
                  <div className="flex items-center justify-between border-b border-[#C59A52]/20 pb-2">
                    <span className="font-[Inter] text-[10px] font-bold uppercase tracking-widest text-[#D98232]">
                      {step.badge}
                    </span>
                    <span className="font-serif text-xs italic text-[#78372B]/70">Pariwar Heritage</span>
                  </div>

                  <h3 className="mt-2.5 font-serif text-2xl font-bold text-[#78372B]" style={serif}>
                    {step.title}
                  </h3>

                  <p className="mt-1.5 font-[Inter] text-sm leading-relaxed text-[#39251D]/85">
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* 2. Desktop / Tablet Responsive Grid (>= md screens) */}
        <div className="mt-20 hidden md:block">
          <div className="relative grid grid-cols-2 gap-6 pt-8 lg:grid-cols-4">
            {/* Horizontal Line across columns */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
              className="absolute left-0 right-0 top-[15px] h-0.5 origin-left bg-gradient-to-r from-[#D98232] via-[#C59A52] to-[#78372B]"
            />

            {steps.map((step, k) => (
              <Reveal key={step.title} delay={k * 0.15} className="group relative flex flex-col justify-between rounded-2xl border border-[#C59A52]/40 bg-white/60 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D98232] hover:bg-white hover:shadow-lg">
                <div>
                  {/* Timeline Node Marker */}
                  <div className="absolute -top-[23px] left-5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#D98232] bg-[#FFF9ED] shadow-sm transition-transform group-hover:scale-125">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D98232]" />
                  </div>

                  <span className="inline-block rounded-full bg-[#EDE0C9]/60 px-2.5 py-0.5 font-[Inter] text-[10px] font-bold tracking-wider text-[#D98232]">
                    {step.badge}
                  </span>

                  <h3 className="mt-3 font-serif text-2xl font-bold text-[#78372B]" style={serif}>
                    {step.title}
                  </h3>

                  <p className="mt-2 font-[Inter] text-sm leading-relaxed text-[#39251D]/85">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 border-t border-[#C59A52]/20 pt-2 text-right">
                  <span className="font-serif text-xs italic text-[#C59A52]">{step.num}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 03 philosophy ---------- */
function Philosophy() {
  return (
    <section id="philosophy" className="relative overflow-hidden bg-[#78372B] py-24 text-[#FFF9ED]">
      <Mandala spin className="absolute left-1/2 top-1/2 aspect-square h-[150%] min-h-[700px] -translate-x-1/2 -translate-y-1/2 opacity-[.12]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
        <Reveal className="order-2 lg:order-1">
          <Eyebrow n="03" light>The spiritual philosophy</Eyebrow>
          <h2 className="mt-3 text-4xl font-bold sm:text-5xl" style={serif}>What does “Chintamoni” mean?</h2>
          <p className="mt-2 text-2xl text-[#E3B873]" style={beng}>চিন্তামণি</p>
          <p className="mt-5 font-[Inter] leading-relaxed text-[#FFF9ED]/90">Chintamani, or Cintamani, is a wish-fulfilling jewel in Hindu traditions. For disciples of Vaishnavism, it is personified as Lord Krishna.</p>
          <p className="mt-4 font-[Inter] leading-relaxed text-[#FFF9ED]/90">Chintamoni also denotes Sri Radharani, who is part of Lord Krishna himself and who delivers divine love to him.</p>
          <div className="mt-7"><a href="#art" className="inline-block rounded-full border-2 border-[#E3B873] px-7 py-3 font-[Inter] text-sm font-semibold text-[#E3B873] hover:bg-[#E3B873] hover:text-[#39251D]">Explore Our Philosophy</a></div>
        </Reveal>
        <Reveal delay={0.1} className="order-1 lg:order-2">
          <Frame className="mx-auto max-w-sm bg-[#78372B]"><Parallax src={A.radhaKrishna} alt="Radha and Krishna by the riverside" speed={30} className="aspect-[4/5] rounded-t-[999px] rounded-b-md" /></Frame>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- 04 spiritual aspects ---------- */
function SpiritualAspects() {
  return (
    <section id="spiritual-aspects" className="relative overflow-hidden bg-[#FFF9ED] py-24 text-[#39251D]">
      <Om pos="-right-12 top-1/4 opacity-[.06]" />
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Text */}
          <Reveal className="lg:col-span-7">
            <Eyebrow n="04">Our Spiritual Aspects</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-[#78372B] sm:text-4xl lg:text-5xl" style={serif}>
              The Heritage of Social Equality & Mass Education
            </h2>
            <p className="mt-2 text-lg text-[#D98232]" style={deva}>
              तृणादपि सुनीचेन तरोरपि सहिष्णुना • अमानिना मानदेन कीर्तनीयः सदा हरिः
            </p>

            <div className="mt-6 space-y-4 font-[Inter] text-sm leading-relaxed text-[#39251D]/90 sm:text-base">
              <p>
                Apart from this, the spiritual aspect of <strong>Ramsundar Vidyalankar</strong> is that he devoted himself to mass education through his preaching. That is why our prime focus is education. We believe that <strong>Lord Srikrishna Chaitanya</strong> was a Social Activist and Reformist of his contemporary era who visualised a caste-free, racism-free society. Ramsunder also followed the path of Sri Krishna Chaitanya throughout his entire life. We are also fighting deliberately to maintain the legacy.
              </p>

              <div className="rounded-xl border-l-4 border-[#C59A52] bg-[#EDE0C9]/40 p-4 pl-5">
                <p className="font-serif text-base italic leading-relaxed text-[#78372B] sm:text-lg">
                  “Pravu Chintamoni Goswami, a.k.a Ramsundar Vidyalankar, pioneered the social equality movement inaugurated by Lord Srikrishna Chaitanya Dev. To date, we are following the legacy. This is the only mainstream religious organisation strictly following the rule of equality Srikrishna Chaitanyadev.”
                </p>
              </div>

              <p>
                Presently, the viral effect of the Untouchability and Racism of mediaeval Brahmanism is contaminating Gaudiya Vaishnavism, while we are struggling and fighting hard to survive this feudal mindset by following the principles stated in <strong>SHIKSHASTAKAM</strong> by Lord Srikrishna Chaitanya Dev.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#movements" className="inline-block rounded-full bg-[#D98232] px-7 py-3 font-[Inter] text-sm font-semibold text-white shadow-lg shadow-[#D98232]/30 hover:bg-[#BD6D22]">
                Explore Our Movements
              </a>
              <Link to="/about-us" className="inline-block rounded-full border-2 border-[#78372B] px-7 py-3 font-[Inter] text-sm font-semibold text-[#78372B] hover:bg-[#78372B] hover:text-[#FFF9ED]">
                Read Foundation History
              </Link>
            </div>
          </Reveal>

          {/* Right Image */}
          <Reveal delay={0.15} className="lg:col-span-5">
            <div className="relative mx-auto max-w-md">
              <div className="overflow-hidden rounded-2xl border border-[#C59A52] bg-white p-2 shadow-[0_0_0_6px_#FFF9ED,0_0_0_8px_rgba(197,154,82,.6)]">
                <img
                  src={A.separation}
                  alt="Our spiritual aspects - social equality and mass education"
                  loading="lazy"
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
              </div>
              <p className="mt-3 text-center font-serif text-xs italic text-[#78372B]">
                Sacred assembly depicting unity, non-sectarian devotion & universal equality
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- 05 guru pranali ---------- */
function Guru() {
  return (
    <section id="guru" className="bg-[#FFF9ED] py-24">
      <div className="mx-auto max-w-6xl px-5 text-center">
        <Reveal>
          <Eyebrow n="04">Our devotional lineage</Eyebrow>
          <h2 className="mt-3 text-4xl font-bold text-[#78372B] sm:text-5xl" style={serif}>Guru Pranali</h2>
          <p className="mx-auto mt-4 max-w-xl font-[Inter] text-[#39251D]/80">Scroll sideways through the line of teachers. Only foundation-approved lineage information is to be published here.</p>
        </Reveal>
      </div>
      <div className="mt-12 flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth px-[max(1.25rem,calc((100vw-72rem)/2))] pb-6">
        {LINEAGE.map((g, k) => (
          <Reveal key={g.name} delay={k * 0.1} className="w-64 shrink-0 snap-center text-center">
            <Frame>
              <div className="relative aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-md bg-[#EDE0C9]">
                {g.img ? <img src={g.img} alt={g.name} loading="lazy" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-5xl text-[#C59A52]/60" style={deva}>ॐ</span>}
              </div>
            </Frame>
            <p className="mt-6 text-sm font-semibold text-[#D98232]">{String(k + 1).padStart(2, "0")}</p>
            <h3 className="mt-1 text-2xl font-bold text-[#78372B]" style={serif}>{g.name}</h3>
            <p className="mt-1 font-[Inter] text-sm text-[#39251D]/75">{g.role}</p>
          </Reveal>
        ))}
      </div>
      <div className="mt-8 text-center"><Cta href="#contact">Explore Guru Parampara</Cta></div>
    </section>
  );
}

/* ---------- 05 art of living ---------- */
function ArtOfLiving() {
  const pillars = [["Meditation & Kirtan", "Chanting the holy name and quiet reflection to settle the mind."], ["Compassion & Equality", "Devotion open to every person, without distinction."], ["Counselling & Wellbeing", "Modern counselling and psychology initiatives, grounded in spiritual care."]];
  return (
    <section id="art" className="relative overflow-hidden bg-[#EDE0C9]/60 py-24">
      <Mandala spin className="absolute -right-40 top-10 h-[520px] opacity-[.15]" />
      <div className="relative mx-auto max-w-6xl px-5">
        <Parallax
          src={A.kirtan}
          alt="Golden kirtan by the sacred ghats"
          speed={20}
          objectPosition="object-top"
          className="mb-14 h-[340px] sm:h-[460px] md:h-[540px] lg:h-[600px] w-full rounded-2xl border border-[#C59A52] shadow-[0_0_0_6px_#FFF9ED,0_0_0_7px_rgba(197,154,82,.6)]"
        />
        <Reveal className="text-center">
          <Eyebrow n="05">Art of living</Eyebrow>
          <h2 className="mt-3 text-4xl font-bold text-[#78372B] sm:text-5xl" style={serif}>A Spiritual Way of Life</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {pillars.map(([t, d], k) => (
            <Reveal key={t} delay={k * 0.12}>
              <div className="h-full rounded-xl border border-[#C59A52]/60 bg-[#FFF9ED] p-7 text-center">
                <h3 className="text-2xl font-bold text-[#78372B]" style={serif}>{t}</h3>
                <p className="mt-3 font-[Inter] text-sm leading-relaxed text-[#39251D]/85">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 text-center"><Cta href="#movements">Discover the Art of Living</Cta></div>
      </div>
    </section>
  );
}

/* ---------- our movements ---------- */
function Movements() {
  const slides = [
    {
      id: "starvation",
      tag: "Movement 01 • Hunger Relief & Healthcare",
      title: "Zero Starvation Movement",
      subtitle: "Universal Food Security & Healthcare Regardless of Caste, Class, or Religion",
      desc: "We work hard through the Zero Starvation Movement to ensure that no neighbour goes hungry, completely regardless of Caste, Class, or Religion. Along with daily food relief and prasadam distribution, we also work actively for the native healthcare and academic sectors to bring healing, medicines, and dignity to every family.",
      img: A.work,
      caption: "Community relief seva & healthcare distribution by our dedicated volunteers",
      statNumber: 100000,
      statSuffix: "+",
      statLabel: "Meals Served to Date",
    },
    {
      id: "academic",
      tag: "Movement 02 • Mass Education",
      title: "Academic Help for Students",
      subtitle: "Mass Education as Sacred Sadhana & Youth Upliftment",
      desc: "To date, we have served more than 2,000 students with academic help. Inspired by founder Ramsundar Vidyalankar's mission of mass education, our educational outreach provides books, scholarship assistance, mentorship, and free learning centers so every child can thrive.",
      img: A.students,
      caption: "Distributing books, study kits & academic assistance to rural students",
      statNumber: 2000,
      statSuffix: "+",
      statLabel: "Students Supported with Academic Help",
    },
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const calm = useReducedMotion();

  // Auto-cycle every 5 seconds so images disappear and transition
  useEffect(() => {
    if (calm || paused) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [calm, paused, slides.length]);

  const active = slides[activeIdx];

  return (
    <section id="movements" className="relative overflow-hidden bg-[#EDE0C9]/60 py-24 text-[#39251D]">
      <Mandala spin className="absolute -left-36 top-1/4 h-[500px] opacity-[.12]" />

      <div className="relative mx-auto max-w-6xl px-5">
        <Reveal className="text-center">
          <Eyebrow n="06">Our Movements</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold text-[#78372B] sm:text-4xl lg:text-5xl" style={serif}>
            Compassion in Action
          </h2>
          <Lotus className="mt-4" />
          <p className="mx-auto mt-4 max-w-2xl font-[Inter] text-sm text-[#39251D]/80 sm:text-base">
            We work hard through the Zero Starvation Movement, regardless of Caste, Class, or Religion, alongside native healthcare and dedicated academic support.
          </p>
        </Reveal>

        {/* Tab Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveIdx(idx)}
              className={`rounded-full px-6 py-2.5 font-[Inter] text-xs font-semibold tracking-wide transition-all sm:text-sm ${
                activeIdx === idx
                  ? "bg-[#78372B] text-[#FFF9ED] shadow-md shadow-[#78372B]/30"
                  : "border border-[#C59A52]/70 bg-white/80 text-[#78372B] hover:bg-[#FFF9ED]"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Interactive Showcase with Disappear & Appear Image Transition */}
        <div
          className="mt-10 grid items-center gap-10 rounded-3xl border border-[#C59A52]/60 bg-[#FFF9ED] p-6 shadow-xl lg:grid-cols-12 lg:p-10"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Animated Cross-Fade Image Area */}
          <div className="relative lg:col-span-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#C59A52] bg-[#39251D] p-2 shadow-[0_0_0_6px_#FFF9ED,0_0_0_8px_rgba(197,154,82,.6)]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={active.img}
                  src={active.img}
                  alt={active.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.65, ease: "easeInOut" }}
                  className="h-full w-full rounded-xl object-cover"
                />
              </AnimatePresence>
            </div>

            <p className="mt-3 text-center font-serif text-xs italic text-[#78372B]">
              {active.caption}
            </p>
          </div>

          {/* Description Content */}
          <div className="lg:col-span-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <span className="inline-block rounded-full border border-[#D98232]/30 bg-[#D98232]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#D98232]">
                  {active.tag}
                </span>

                <h3 className="mt-3 text-2xl font-bold text-[#78372B] sm:text-3xl lg:text-4xl" style={serif}>
                  {active.title}
                </h3>

                <p className="mt-1 font-serif text-lg italic text-[#C59A52]">
                  {active.subtitle}
                </p>

                <p className="mt-4 font-[Inter] text-sm leading-relaxed text-[#39251D]/90 sm:text-base">
                  {active.desc}
                </p>

                {/* Counter Metric */}
                <div className="mt-6 rounded-xl border border-[#C59A52]/40 bg-[#EDE0C9]/45 p-4">
                  <p className="font-serif text-4xl font-bold text-[#78372B]">
                    <Counter to={active.statNumber} suffix={active.statSuffix} />
                  </p>
                  <p className="mt-1 font-[Inter] text-xs font-medium uppercase tracking-wider text-[#54382B]">
                    {active.statLabel}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link
                    to="/donate"
                    className="inline-block rounded-full bg-[#D98232] px-7 py-3 font-[Inter] text-sm font-semibold text-white shadow-lg shadow-[#D98232]/30 hover:bg-[#BD6D22]"
                  >
                    Support This Movement
                  </Link>

                  <a
                    href="#contact"
                    className="inline-block rounded-full border border-[#78372B] px-6 py-2.5 font-[Inter] text-sm font-semibold text-[#78372B] hover:bg-[#78372B] hover:text-[#FFF9ED]"
                  >
                    Volunteer With Us
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Indicator dots */}
        <div className="mt-6 flex justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`h-2 rounded-full transition-all ${
                activeIdx === idx ? "w-8 bg-[#78372B]" : "w-2 bg-[#C59A52]/40"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 07 seva ---------- */
function Seva() {
  const items = [["Zero Starvation Movement", "Prasadam and food relief so that no neighbour goes hungry."], ["Education Assistance", "Books, fees and mentoring for children and students."], ["Healthcare Initiatives", "Health support and awareness for families in need."], ["COVID-19 Relief Work", "Food, supplies and care offered during the pandemic."]];
  return (
    <section id="seva" className="bg-[#39251D] py-24 text-[#FFF9ED]">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="text-center">
          <Eyebrow n="06" light>Seva</Eyebrow>
          <h2 className="mt-3 text-4xl font-bold sm:text-5xl" style={serif}>Serving Humanity</h2>
          <Lotus className="mt-6" />
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(([t, d], k) => (
            <Reveal key={t} delay={k * 0.1}>
              <div className="h-full rounded-xl border border-[#C59A52]/50 bg-[#FFF9ED]/5 p-6 transition-colors hover:bg-[#FFF9ED]/10">
                <p className="text-3xl text-[#C59A52]" style={serif}>{String(k + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 text-xl font-bold" style={serif}>{t}</h3>
                <p className="mt-2 font-[Inter] text-sm leading-relaxed text-[#FFF9ED]/80">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-14 grid gap-8 text-center sm:grid-cols-2">
          {STATS.map(([n, s, l]) => (
            <div key={l}>
              <p className="text-6xl font-bold text-[#E3B873]" style={serif}><Counter to={n} suffix={s} /></p>
              <p className="mt-1 font-[Inter] text-sm tracking-wide">{l}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center font-[Inter] text-xs text-[#FFF9ED]/50">Figures provided by the Foundation.</p>
      </div>
    </section>
  );
}

/* ---------- 07 devotional life & festivals ---------- */
function Events() {
  const defaultGallery = [
    [A.procession, "Procession before Lord Jagannath"],
    [A.altar, "Gaura-Nitai & Madan Mohan altar"],
    [A.kirtan, "Kirtan by the ghats"],
    [A.golden, "Golden riverside devotion"],
    [A.radhaKrishna, "Radha and Krishna"],
    [A.temple, "Nabadwip Dham temple"]
  ];
  const [gallery, setGallery] = useState(defaultGallery);

  useEffect(() => {
    let isMounted = true;
    async function loadDynamicGallery() {
      try {
        const dynamicItems = await getGalleryAPI();
        if (isMounted && dynamicItems && dynamicItems.length > 0) {
          const formatted = dynamicItems
            .filter((item) => !item.image?.endsWith(".mp4") && !item.src?.endsWith(".mp4"))
            .map((item) => [item.image || item.src, item.title]);

          // Take latest photos from admin, filling remaining slots up to 6 from defaults
          const existingSrcs = new Set(formatted.map(([s]) => s));
          const fillDefaults = defaultGallery.filter(([s]) => !existingSrcs.has(s));
          const combined = [...formatted, ...fillDefaults].slice(0, 6);
          setGallery(combined);
        }
      } catch (e) {}
    }
    loadDynamicGallery();

    const handleUpdate = () => loadDynamicGallery();
    window.addEventListener("ckf_gallery_updated", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("ckf_gallery_updated", handleUpdate);
    };
  }, []);
  return (
    <section id="events" className="relative overflow-hidden bg-[#FFF9ED] py-24">
      <Om pos="-right-10 top-10" />
      <div className="relative mx-auto max-w-6xl px-5">
        <Reveal className="text-center">
          <Eyebrow n="07">Devotional life & festivals</Eyebrow>
          <h2 className="mt-3 text-4xl font-bold text-[#78372B] sm:text-5xl" style={serif}>Kirtan, Festivals & Gatherings</h2>
        </Reveal>
        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1.2fr_.8fr]">
          <Reveal><Parallax src={A.procession} alt="Devotional procession before Lord Jagannath" speed={40} className="aspect-[4/3] rounded-xl border border-[#C59A52] shadow-[0_0_0_6px_#FFF9ED,0_0_0_7px_rgba(197,154,82,.6)]" /></Reveal>
          <Reveal delay={0.1}>
            <h3 className="text-3xl font-bold text-[#78372B]" style={serif}>Upcoming Events</h3>
            <ul className="mt-4 divide-y divide-[#C59A52]/40 border-y border-[#C59A52]/40">
              {EVENTS.map(([n, d]) => (
                <li key={n} className="flex items-center justify-between py-4"><span className="text-xl font-semibold text-[#39251D]" style={serif}>{n}</span><span className="font-[Inter] text-xs text-[#D98232]">{d}</span></li>
              ))}
            </ul>
            <div className="mt-5 overflow-hidden rounded-xl border border-[#C59A52] bg-black shadow-[0_0_0_6px_#FFF9ED,0_0_0_7px_rgba(197,154,82,.6)]">
              <video
                controls
                playsInline
                preload="metadata"
                className="aspect-video w-full object-cover"
                src="/assets/interaction-video.mp4"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </Reveal>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3">
          {gallery.map(([s, c], k) => (
            <Reveal key={c} delay={k * 0.07}>
              <figure className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-[#C59A52]/60">
                <img src={s} alt={c} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 motion-reduce:transition-none" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#39251D]/85 to-transparent p-3 font-[Inter] text-xs text-[#FFF9ED]">{c}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 08 final invitation + footer ---------- */
function Invitation() {
  const amounts = [500, 1100, 2100, 5100];
  const [amt, setAmt] = useState(1100);
  return (
    <section id="donate" className="relative overflow-hidden bg-[#78372B] py-24 text-[#FFF9ED]">
      <Parallax src={A.golden} alt="" speed={60} className="absolute inset-0 opacity-20" />
      <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-5 md:grid-cols-2">
        <Reveal>
          <Eyebrow n="08" light>Final spiritual invitation</Eyebrow>
          <h2 className="mt-3 text-4xl font-bold sm:text-5xl" style={serif}>Walk This Path With Us</h2>
          <p className="mt-4 text-xl italic text-[#E3B873]" style={serif}>Every act of compassion can make a difference.</p>
          <p className="mt-5 font-[Inter] leading-relaxed text-[#FFF9ED]/85">You are warmly invited to visit the Foundation in Nabadwip, take part in seva, and support the mission that has served devotion and humanity since 1809.</p>
          <div className="mt-6 flex flex-wrap gap-3 font-[Inter] text-sm"><Cta href="#contact">Visit the Foundation</Cta></div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="rounded-2xl border border-[#C59A52]/70 bg-[#FFF9ED] p-6 text-[#39251D] shadow-2xl">
            <p className="font-[Inter] text-sm font-semibold">Support the mission (₹)</p>
            <div className="mt-3 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Donation amount">
              {amounts.map((a) => (
                <button key={a} role="radio" aria-checked={amt === a} onClick={() => setAmt(a)} className={`rounded-lg border py-3 font-[Inter] text-sm font-semibold transition-colors ${amt === a ? "border-[#D98232] bg-[#D98232] text-white" : "border-[#C59A52]/60 hover:border-[#D98232]"}`}>{a.toLocaleString("en-IN")}</button>
              ))}
            </div>
            <Link to="/donate" className="mt-5 block rounded-full bg-[#78372B] py-3 text-center font-[Inter] text-sm font-semibold text-[#FFF9ED] hover:bg-[#39251D]">Donate ₹{amt.toLocaleString("en-IN")}</Link>
            <p className="mt-3 text-center font-[Inter] text-xs text-[#39251D]/60">Payment gateway connects here.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="bg-[#FFF9ED] font-[Inter] text-[#39251D] antialiased">
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
        @keyframes floatUp{from{transform:translateY(0);opacity:0}15%{opacity:1}to{transform:translateY(-95vh);opacity:0}}
        html{scroll-behavior:smooth}@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}`}</style>
      <main><Hero /><History /><Philosophy /><SpiritualAspects /><Guru /><ArtOfLiving /><Movements /><Seva /><Events /><Invitation /></main>
    </div>
  );
}