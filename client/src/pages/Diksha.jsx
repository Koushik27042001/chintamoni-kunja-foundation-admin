import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/* ==================================================================
   Diksha Tradition – the spiritual succession  (route: /diksha)
   React + Tailwind v3 · npm i framer-motion · images in /public/assets
   Render <Diksha /> between your Header and <Footer />.
================================================================== */
const serif = { fontFamily: "'Cormorant Garamond','Playfair Display',serif" };
const deva = { fontFamily: "'Noto Serif Devanagari',serif" };
const beng = { fontFamily: "'Noto Serif Bengali',serif" };
const frame = "border border-[#C59A52] shadow-[0_0_0_6px_#FFF9ED,0_0_0_7px_rgba(197,154,82,.6)]";
const dots = {
  backgroundImage: "radial-gradient(rgba(120,55,43,.05) 1px,transparent 1px)",
  backgroundSize: "22px 22px",
  backgroundColor: "rgba(237,224,201,.6)",
};
const asset = (n) => encodeURI(`/assets/${n}`);

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

const Eyebrow = ({ children, light }) => (
  <p
    className={`font-[Inter] text-xs font-semibold tracking-[0.25em] ${
      light ? "text-[#E3B873]" : "text-[#D98232]"
    }`}
  >
    {children.toUpperCase()}
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
  const className = `inline-block rounded-full px-7 py-3 text-center font-[Inter] text-sm font-semibold transition-all ${
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

function PageHero({ img, sk, bn, title, sub, crumb }) {
  return (
    <section className="relative flex min-h-[62vh] items-center justify-center overflow-hidden bg-[#39251D] text-center text-[#FFF9ED]">
      <Parallax src={img} alt="" speed={60} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#39251D]/75 via-[#39251D]/55 to-[#39251D]/90" />
      <div className="relative z-10 mx-auto max-w-3xl px-5 py-20">
        <p className="animate-[fadeUp_1.4s_ease-out_both] text-[#E3B873] motion-reduce:animate-none">
          <span style={deva}>{sk}</span> • <span style={beng}>{bn}</span>
        </p>
        <h1
          className="mt-5 animate-[fadeUp_1.6s_.3s_ease-out_both] text-5xl font-bold leading-[1.05] motion-reduce:animate-none sm:text-7xl"
          style={serif}
        >
          {title}
        </h1>
        <p
          className="mt-3 animate-[fadeUp_1.6s_.6s_ease-out_both] text-xl italic text-[#E3B873] motion-reduce:animate-none sm:text-3xl"
          style={serif}
        >
          {sub}
        </p>
        <nav aria-label="Breadcrumb" className="mt-6 font-[Inter] text-xs text-[#FFF9ED]/70">
          <Link to="/" className="hover:text-[#E3B873]">
            Home
          </Link>{" "}
          / {crumb}
        </nav>
      </div>
    </section>
  );
}

const KEYFRAMES = `@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}html{scroll-behavior:smooth}@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}`;
const IDENT = [
  ["Sampradaya", "Madhbacharya"],
  ["Sect", "Gaudiya"],
  ["Pariwar", "Gadadhar"],
  ["Sub-Sect", "Chintamoni"],
];

const A = {
  altar: asset("Opulent Gaura-Nitai and Madan Mohan Altar.png"),
  golden: asset("Krishna’s Golden Riverside Devotion.png"),
  radhaKrishna: asset("Radha and Krishna by the Riverside.png"),
  kirtan: asset("Golden Kirtan by the Sacred Ghats.png"),
};

/* Diksha Guru Pranali – names as supplied by the Foundation (29 in order).
   Spellings are kept as given; edit here to standardise. */
const CHAIN = [
  "Sri Krishna Narayan",
  "Sri Bramha",
  "Sri Narada",
  "Sri Vayasdeb",
  "Sri Madhbacharya",
  "Sri Padmanabhacharya",
  "Sri Narahari",
  "Sri Madhab",
  "Sri Aakshov",
  "Sri Joytirth",
  "Sri Gayansindhu",
  "Sri Dayanidhi",
  "Sri Vidyanidhi",
  "Sri Rajendra",
  "Sri Jaydharma",
  "Sri Purusottam",
  "Sri Bramhnya",
  "Sri Vayastirtha",
  "Sri Laxmipati",
  "Sri Madhabendra Puri",
  "Sri Iswar Puri",
  "Sri Srikrishna Chaitanya Mahaprabhu",
  "Sri Gadadhar Pandit",
  "Sri Ballav Chaitanya Goswami",
  "Sri Shibananda Goswami",
  "Sri Krishnanda Goswami",
  "Sri Ghaneswar Goswami",
  "Sri Krishnaballav Goswami",
  "Sri Ram Narasingha Goswami",
];
const STAR = new Set(["Sri Srikrishna Chaitanya Mahaprabhu", "Sri Gadadhar Pandit"]);

/* [title, subtitle, first index, last index (inclusive)] */
const ERAS = [
  [
    "The Divine Origin",
    "The tradition begins from the Supreme and descends through the great sages.",
    0,
    3,
  ],
  [
    "The Madhva Lineage",
    "Sri Madhbacharya and the teachers of his Sampradaya.",
    4,
    20,
  ],
  [
    "Sri Chaitanya Mahaprabhu",
    "The golden avatar of Nabadwip, who opened the path of the holy name to all.",
    21,
    21,
  ],
  [
    "The Gadadhar Pariwar",
    "The line of Sri Gadadhar Pandit, to which Sri Sri Chintamoni Kunja belongs.",
    22,
    CHAIN.length - 1,
  ],
];

function Intro() {
  return (
    <section className="relative overflow-hidden bg-[#FFF9ED] py-24">
      <Om pos="-right-10 top-0" />
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <Parallax
              src={A.radhaKrishna}
              alt="Radha and Krishna by the riverside"
              className={`aspect-[4/5] rounded-t-[999px] rounded-b-xl ${frame}`}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <Eyebrow>Diksha tradition</Eyebrow>
            <H2>Initiation Through an Unbroken Line</H2>
            <Lotus className="!justify-start my-6" />
            <P>
              Diksha is the sacred initiation in which a disciple receives the holy name and spiritual
              guidance from a guru. That guru in turn stands in a line of teachers, a parampara, reaching back
              through the generations.
            </P>
            <P className="mt-4">
              Sri Sri Chintamoni Kunja belongs to the Madhva Gaudiya Vaishnav Sampradaya. The succession
              recorded here, as maintained by the Foundation, passes from Sri Krishna Narayan through Sri
              Chaitanya Mahaprabhu and Sri Gadadhar Pandit to the Gadadhar Pariwar.
            </P>
          </Reveal>
        </div>
        <dl className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {IDENT.map(([k, v], i) => (
            <Reveal key={k} delay={i * 0.08}>
              <div className="rounded-xl border border-[#C59A52]/60 bg-white/60 p-5 text-center shadow-sm">
                <dt className="font-[Inter] text-xs font-semibold tracking-wide text-[#D98232]">
                  {k.toUpperCase()}
                </dt>
                <dd className="mt-1 text-2xl font-bold text-[#78372B]" style={serif}>
                  {v}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Chain() {
  return (
    <section className="relative overflow-hidden bg-[#78372B] py-24 text-[#FFF9ED]">
      <Mandala className="absolute -left-40 top-20 h-[560px] opacity-[.12]" />
      <div className="relative mx-auto max-w-3xl px-5">
        <Reveal className="text-center">
          <Eyebrow light>Guru pranali (Diksha)</Eyebrow>
          <H2 light>The Spiritual Succession</H2>
          <P light className="mx-auto mt-4 max-w-xl text-sm">
            {CHAIN.length} teachers in sequence. Read from the top, in the order recorded by the Foundation.
          </P>
        </Reveal>
        <div className="mt-14 space-y-16">
          {ERAS.map(([t, s, from, to]) => (
            <div key={t}>
              <Reveal className="text-center">
                <h3 className="text-3xl font-bold text-[#E3B873]" style={serif}>
                  {t}
                </h3>
                <p className="mx-auto mt-1 max-w-md font-[Inter] text-sm text-[#FFF9ED]/75">{s}</p>
              </Reveal>
              <ol className="relative ml-4 mt-8 space-y-4 border-l border-[#C59A52]/60 pl-8 md:ml-6">
                {CHAIN.slice(from, to + 1).map((n, i) => (
                  <li key={n} className="relative">
                    <span
                      className={`absolute -left-[41px] top-4 grid h-5 w-5 place-items-center rounded-full border-2 border-[#C59A52] md:-left-[41px] ${
                        STAR.has(n) ? "bg-[#E3B873]" : "bg-[#78372B]"
                      }`}
                      aria-hidden="true"
                    />
                    <Reveal delay={Math.min(i, 4) * 0.05}>
                      <div
                        className={`flex items-center gap-4 rounded-xl border px-5 py-3 ${
                          STAR.has(n)
                            ? "border-[#E3B873] bg-[#FFF9ED]/15"
                            : "border-[#C59A52]/40 bg-[#FFF9ED]/5"
                        }`}
                      >
                        <span className="w-9 shrink-0 text-3xl leading-none text-[#E3B873]" style={serif}>
                          {String(from + i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={`font-bold ${STAR.has(n) ? "text-2xl text-[#FFF9ED]" : "text-xl"}`}
                          style={serif}
                        >
                          {n}
                        </span>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        <Reveal className="mt-14 text-center">
          <P light className="text-xs text-[#FFF9ED]/60">
            Lineage information is published as maintained by Sri Sri Chintamoni Kunja Foundation.
          </P>
        </Reveal>
      </div>
    </section>
  );
}

function Meaning() {
  return (
    <section className="py-24" style={dots}>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>The path of the holy name</Eyebrow>
          <H2>Why the Lineage Matters</H2>
          <P className="mt-5">
            A parampara keeps the teaching of Sri Chaitanya Mahaprabhu intact: devotion to Sri Krishna,
            congregational chanting of the holy name, humility and loving service.
          </P>
          <P className="mt-4">
            For the devotees of the Kunja, remembering these names is itself an act of devotion and gratitude.
          </P>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Btn href="/guru-pranali" kind="outline">
              Our Devotional Lineage
            </Btn>
            <Btn href="/art-of-living" kind="outline">
              The Art of Living
            </Btn>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Parallax
            src={A.kirtan}
            alt="Kirtan by the sacred ghats"
            className={`aspect-[4/3] rounded-xl ${frame}`}
          />
        </Reveal>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="relative overflow-hidden bg-[#39251D] py-20 text-center text-[#FFF9ED]">
      <Parallax src={A.golden} alt="" speed={50} className="absolute inset-0 opacity-20" />
      <Reveal className="relative mx-auto max-w-2xl px-5">
        <H2 light>Walk the Path of Devotion</H2>
        <P light className="mt-4">
          Speak with the Foundation to learn more about the Diksha tradition and the life of the Kunja.
        </P>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Btn href="/contact-us">Contact the Foundation</Btn>
          <Btn href="/guru-pranali" kind="gold">
            View the Family Lineage
          </Btn>
        </div>
      </Reveal>
    </section>
  );
}

export default function Diksha() {
  return (
    <div className="bg-[#FFF9ED] font-[Inter] text-[#39251D] antialiased">
      <style>{KEYFRAMES}</style>
      <main>
        <PageHero
          img={A.altar}
          sk="दीक्षा"
          bn="দীক্ষা"
          title="Diksha Tradition"
          sub="The Unbroken Line of Spiritual Teachers"
          crumb="Diksha Tradition"
        />
        <Intro />
        <Chain />
        <Meaning />
        <Cta />
      </main>
    </div>
  );
}

