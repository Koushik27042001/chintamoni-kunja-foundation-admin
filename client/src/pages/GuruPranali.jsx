import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/* ==================================================================
   Guru Pranali – "Our Devotional Lineage" (route: /guru-pranali)
   React + Tailwind v3 · npm i framer-motion · images in /public/assets
   Render <GuruPranali /> between your Header and <Footer />.
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
  temple: asset("Nabadwip Dham Temple in Sunshine.png"),
};

/* Family lineage (Pariwar Parampara) – transcribed from the Foundation's chart.
   Each node: couple = [person, spouse?], children = [...] */
const TREE = {
  couple: ["Ramsundar Vidyalankar Chintamani Das", "Kalitara Devi"],
  children: [
    {
      couple: ["Sri Krishnakanta Shiromani Goswami", "Srimati Laxmimani Devi"],
      children: [
        {
          couple: ["Sri Radhikajiban Goswami", "Srimati Radhalaxmi Devi"],
          children: [
            {
              couple: ["Sri Haridas Chakraborty", "Srimati Pravbati Devi"],
              children: [
                { couple: ["Sri Devimadhav Goswami"] },
                { couple: ["Srimati Geeta Devi"] },
                {
                  couple: ["Sri Mihir Madhav Chakraborty", "Srimati Shailaja Devi"],
                  children: [
                    { couple: ["Sri Krishnendu Chakraborty"] },
                    { couple: ["Srimati Debarupa Devi"] },
                  ],
                },
              ],
            },
          ],
        },
        {
          couple: ["Sri Yashodajiban Goswami", "Srimati Sushilasundari Devi"],
          children: [
            {
              couple: ["Sri Krishnadas Goswami", "Srimati Bijan Devi"],
              children: [
                { couple: ["Sri Dipak Kumar Chakraborty"] },
                { couple: ["Unmarried"] },
              ],
            },
          ],
        },
      ],
    },
    { couple: ["Navakanta Goswami"] },
    { couple: ["Unmarried"] },
  ],
};

function Branch({ node, depth = 0 }) {
  const [a, b] = node.couple;
  return (
    <li className="relative">
      <Reveal>
        <div
          className={`relative rounded-xl border bg-[#FFF9ED] px-5 py-3 ${
            depth === 0 ? "border-[#D98232] shadow-lg" : "border-[#C59A52]/60"
          }`}
        >
          <span
            className="absolute -left-[26px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[#C59A52] bg-[#FFF9ED] max-md:hidden"
            aria-hidden="true"
          />
          <p className="font-[Inter] text-[10px] font-semibold tracking-[0.2em] text-[#D98232]">
            {depth === 0 ? "FOUNDER" : `GENERATION ${depth + 1}`}
          </p>
          <p className={`font-bold text-[#78372B] ${depth === 0 ? "text-3xl" : "text-2xl"}`} style={serif}>
            {a}
          </p>
          {b && (
            <p className="font-[Inter] text-sm text-[#39251D]/75">
              <span className="text-[#C59A52]" aria-hidden="true">
                ✦
              </span>{" "}
              with {b}
            </p>
          )}
        </div>
      </Reveal>
      {node.children && (
        <ul className="ml-3 mt-3 space-y-3 border-l border-[#C59A52]/60 pl-5 md:ml-6 md:pl-6">
          {node.children.map((c, i) => (
            <Branch key={i} node={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

function Identity() {
  return (
    <section className="relative overflow-hidden bg-[#FFF9ED] py-24">
      <Om pos="-left-10 top-0" />
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <Eyebrow>Our devotional lineage</Eyebrow>
            <H2>A Living Parampara</H2>
            <Lotus className="!justify-start my-6" />
            <P>
              Sri Sri Chintamoni Kunja was established in 1809 by Sri Ramsundar Vidyalankar (Sri Chintamoni
              Goswami), an eminent academic personality and a contemporary of Raja Ram Mohan Roy.
            </P>
            <P className="mt-4">
              We are a unique Sri Radha Sakti Gadadhar Pandit Pariwar sect that belongs to the Madhva
              Gaudiya Vaishnav Sampradaya. This page records two threads of our heritage: the spiritual
              succession of Diksha gurus, and the family line that has served the Kunja since its founding.
            </P>
          </Reveal>
          <Reveal delay={0.1}>
            <Parallax
              src={A.altar}
              alt="Gaura-Nitai and Madan Mohan altar"
              className={`aspect-[4/3] rounded-xl ${frame}`}
            />
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

function Paths() {
  return (
    <section className="relative overflow-hidden bg-[#78372B] py-20 text-[#FFF9ED]">
      <Mandala className="absolute left-1/2 top-1/2 aspect-square h-[150%] min-h-[640px] -translate-x-1/2 -translate-y-1/2 opacity-[.12]" />
      <div className="relative mx-auto grid max-w-5xl gap-6 px-5 md:grid-cols-2">
        {[
          [
            "Diksha Tradition",
            "The unbroken succession of spiritual teachers, from Sri Krishna Narayan down to the Gadadhar Pariwar.",
            "/diksha",
            "Explore the Diksha lineage",
          ],
          [
            "Family Lineage",
            "The household of Sri Ramsundar Vidyalankar, whose descendants have carried the Kunja forward, shown below.",
            "#family",
            "View the family tree",
          ],
        ].map(([t, d, h, c], i) => (
          <Reveal key={t} delay={i * 0.12}>
            <div className="h-full rounded-2xl border border-[#C59A52]/60 bg-[#FFF9ED]/5 p-8 text-center backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-[#E3B873]" style={serif}>
                {t}
              </h2>
              <P light className="mt-3 text-sm">
                {d}
              </P>
              <div className="mt-6">
                <Btn href={h} kind="gold">
                  {c}
                </Btn>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Family() {
  return (
    <section id="family" className="py-24" style={dots}>
      <div className="mx-auto max-w-4xl px-5">
        <Reveal className="text-center">
          <Eyebrow>Pariwar parampara</Eyebrow>
          <H2>The Family Lineage of the Kunja</H2>
          <P className="mx-auto mt-4 max-w-xl text-sm">
            From the founder, Sri Ramsundar Vidyalankar Chintamani Das, through the generations to those
            who serve the Foundation today.
          </P>
        </Reveal>
        <ul className="mt-12">
          <Branch node={TREE} />
        </ul>
        <Reveal className="mt-10 rounded-xl border-l-4 border-[#D98232] bg-[#FFF9ED] p-5 shadow-sm">
          <P className="text-sm">
            Sri Krishnendu Chakraborty and Srimati Debarupa Devi, shown in the latest generation, serve
            the Foundation as Vice President and Treasurer. See{" "}
            <Link
              to="/about-us"
              className="font-semibold text-[#78372B] underline decoration-[#C59A52] underline-offset-4"
            >
              About Us
            </Link>{" "}
            for office bearers.
          </P>
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
        <H2 light>Follow the Thread of Devotion</H2>
        <P light className="mt-4">
          Continue to the Diksha tradition to trace the spiritual succession that the Kunja belongs to.
        </P>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Btn href="/diksha">Diksha Tradition</Btn>
          <Btn href="/contact-us" kind="gold">
            Contact the Foundation
          </Btn>
        </div>
      </Reveal>
    </section>
  );
}

export default function GuruPranali() {
  return (
    <div className="bg-[#FFF9ED] font-[Inter] text-[#39251D] antialiased">
      <style>{KEYFRAMES}</style>
      <main>
        <PageHero
          img={A.temple}
          sk="गुरु प्रणाली"
          bn="গুরু প্রণালী"
          title="Guru Pranali"
          sub="Our Devotional Lineage"
          crumb="Guru Pranali"
        />
        <Identity />
        <Paths />
        <Family />
        <Cta />
      </main>
    </div>
  );
}
