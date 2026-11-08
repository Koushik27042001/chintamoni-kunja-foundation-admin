
import React, { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  Phone,
  Menu,
  X,
  ChevronDown,
  HeartHandshake,
  ArrowUpRight,
} from "lucide-react";

const navigation = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about-us" },
  { name: "The Art of Living", path: "/art-of-living" },
  {
    name: "Guru Pranali",
    children: [
      { name: "Our Devotional Lineage", path: "/guru-pranali" },
      { name: "Diksha Tradition", path: "/diksha" },
    ],
  },
  { name: "Our Gallery", path: "/gallery" },
  { name: "Upcoming Events", path: "/events" },
  { name: "Blog", path: "/blog" },
  { name: "Contact Us", path: "/contact-us" },
];

const navLinkClass = ({ isActive }) =>
  `relative flex items-center whitespace-nowrap px-3 py-3 text-[14px] xl:text-[15px] font-semibold tracking-wide transition-all duration-300
  ${isActive
    ? "bg-[#FFF8EC] text-[#971515]"
    : "text-white hover:bg-white/10 hover:text-[#F5D58B]"
  }`;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [guruOpen, setGuruOpen] = useState(false);
  const [mobileGuruOpen, setMobileGuruOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setGuruOpen(false);
    setMobileGuruOpen(false);
  }, [location.pathname]);

  return (
    <header className="relative z-50 w-full bg-white shadow-md">

      {/* ================= TOP NOTIFICATION TICKER ================= */}
      <div className="relative z-50 overflow-hidden border-b border-[#D5AE62]/40 bg-gradient-to-r from-[#7A1515] via-[#971515] to-[#7A1515] text-[#FFF9ED] text-xs sm:text-sm">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">

          {/* Movable notification marquee (right to left) */}
          <div className="relative flex-1 overflow-hidden py-2 px-3">
            <div className="animate-marquee items-center gap-8 font-medium tracking-wide">
              <span className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#F5D58B] animate-pulse" />
                ✨ Sri Sri Chintamoni Kunja Foundation — Spiritual Heritage & Devotion in Nabadwip Dham
              </span>
              <span className="text-[#F5D58B]">•</span>
              <span>
                Support Daily Anna Daan Prasadam & Altar Seva in Holy Dham
              </span>
              <span className="text-[#F5D58B]">•</span>
              <span>
                Preserving 200+ Years of Madhva Gaudiya Vaishnav Heritage since 1809
              </span>
              <span className="text-[#F5D58B]">•</span>
              <span>
                Pilgrimage Helpline & Seva Desk: +91 9474905910
              </span>
            </div>
          </div>

          {/* Static Donate Button */}
          <div className="shrink-0 bg-[#831212] px-3 sm:px-5 py-2 border-l border-[#D5AE62]/30 shadow-sm flex items-center">
            <Link
              to="/donate"
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-md bg-gradient-to-r from-[#D98232] to-[#E8B94F] px-2.5 sm:px-3.5 py-1 text-xs font-bold text-[#3E1B15] shadow transition-all hover:brightness-110 active:scale-95"
            >
              <HeartHandshake size={14} className="shrink-0 text-[#7A1515]" />
              <span className="whitespace-nowrap font-extrabold tracking-wide">
                Donate to Our Foundation
              </span>
              <ArrowUpRight size={13} className="hidden sm:inline-block" />
            </Link>
          </div>

        </div>
      </div>

      {/* ================= BRAND HEADER ================= */}
      <div className="border-b border-[#E9DFD2] bg-[#FFFEFC]">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-5 px-4 py-4 sm:px-6 lg:px-10 lg:py-5">

          {/* Logo and Foundation Name */}
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3 sm:gap-5"
            aria-label="Sri Sri Chintamoni Kunja Foundation home"
          >
            <img
              src="/images/chintamoni-kunja-logo.png"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/assets/logo/chintamoni-kunja-modern-logo.svg";
              }}
              alt="Sri Sri Chintamoni Kunja Foundation logo"
              className="h-[76px] w-[76px] shrink-0 object-contain sm:h-[94px] sm:w-[94px] lg:h-[112px] lg:w-[112px]"
            />

            <div className="min-w-0">
              <h1 className="font-serif text-[22px] font-bold italic leading-tight text-[#971515] sm:text-[30px] lg:text-[40px] xl:text-[46px]">
                Sri Sri Chintamoni Kunja
              </h1>

              <p className="mt-1 font-serif text-[16px] text-[#7F2424] sm:text-[20px] lg:text-[25px]">
                Nabadwip Dham
              </p>

              <p className="mt-1 hidden text-[10px] font-medium uppercase tracking-[3px] text-[#A88955] sm:block">
                Spiritual Heritage • Devotion
              </p>
            </div>
          </Link>

          {/* Desktop Contact and Donate */}
          <div className="hidden shrink-0 items-center gap-4 xl:flex 2xl:gap-6">

            <a
              href="tel:+919474905910"
              className="group flex shrink-0 items-center gap-2.5 whitespace-nowrap text-[#971515] transition-colors hover:text-[#C18A35]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#971515]/5 transition-all group-hover:bg-[#971515]/10">
                <Phone size={21} />
              </span>

              <span className="whitespace-nowrap text-[21px] font-bold tracking-tight xl:text-[23px] 2xl:text-[27px]">
                947-490-5910
              </span>
            </a>

            <a
              href="/donate"
              className="group flex min-w-[180px] shrink-0 items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-[#1768D5] to-[#4385ED] px-4 py-2.5 text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg 2xl:min-w-[190px] 2xl:px-5 2xl:py-3"
            >
              <HeartHandshake size={27} />

              <span className="text-left">
                <span className="block text-[17px] font-bold leading-tight">
                  Donate Us
                </span>
                <span className="block text-[10px] text-blue-100">
                  Support Our Seva
                </span>
              </span>

              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#E6D8C5] text-[#971515] transition hover:bg-[#FFF5E8] xl:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
      </div>

      {/* ================= DESKTOP NAVIGATION ================= */}
      <nav
        className="hidden bg-[#971010] xl:block"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-center px-4 lg:px-6">
          {navigation.map((item) =>
            item.children ? (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => setGuruOpen(true)}
                onMouseLeave={() => setGuruOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setGuruOpen(!guruOpen)}
                  className={`flex items-center gap-2 whitespace-nowrap px-3 py-5 text-[14px] font-semibold tracking-wide transition-all duration-300 xl:text-[15px] ${guruOpen
                      ? "bg-white/10 text-[#F5D58B]"
                      : "text-white hover:bg-white/10 hover:text-[#F5D58B]"
                    }`}
                  aria-expanded={guruOpen}
                >
                  {item.name}
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-300 ${guruOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {guruOpen && (
                  <div className="absolute left-0 top-full z-50 min-w-[260px] overflow-hidden rounded-b-lg border-t-2 border-[#D5AE62] bg-white py-2 shadow-xl">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          `block px-5 py-3 text-sm font-semibold transition-colors ${isActive
                            ? "bg-[#FFF5E8] text-[#971515]"
                            : "text-[#49352B] hover:bg-[#FFF5E8] hover:text-[#971515]"
                          }`
                        }
                      >
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={navLinkClass}
              >
                {item.name}
              </NavLink>
            )
          )}
        </div>
      </nav>

      {/* ================= MOBILE NAVIGATION ================= */}
      <div
        className={`overflow-hidden bg-[#971010] transition-all duration-300 xl:hidden ${mobileOpen ? "max-h-[850px] border-t border-white/10" : "max-h-0"
          }`}
      >
        <nav
          className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6"
          aria-label="Mobile navigation"
        >
          {navigation.map((item) =>
            item.children ? (
              <div key={item.name} className="border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setMobileGuruOpen(!mobileGuruOpen)}
                  className="flex w-full items-center justify-between py-4 text-left text-[15px] font-semibold text-white transition hover:text-[#F5D58B]"
                  aria-expanded={mobileGuruOpen}
                >
                  {item.name}
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${mobileGuruOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {mobileGuruOpen && (
                  <div className="mb-3 ml-3 border-l-2 border-[#D5AE62] pl-4">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          `block py-3 text-sm transition ${isActive
                            ? "font-bold text-[#F5D58B]"
                            : "text-white/85 hover:text-[#F5D58B]"
                          }`
                        }
                      >
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `block border-b border-white/10 py-4 text-[15px] font-semibold transition ${isActive
                    ? "text-[#F5D58B]"
                    : "text-white hover:text-[#F5D58B]"
                  }`
                }
              >
                {item.name}
              </NavLink>
            )
          )}

          {/* Mobile Contact and Donate */}
          <div className="mt-5 flex flex-col gap-3 pb-3">
            <a
              href="tel:+919474905910"
              className="flex items-center gap-3 whitespace-nowrap rounded-lg border border-white/20 px-4 py-3 text-white transition hover:bg-white/10"
            >
              <Phone size={19} className="shrink-0" />
              <span className="whitespace-nowrap font-semibold tracking-wide">947-490-5910</span>
            </a>

            <a
              href="/donate"
              className="flex items-center justify-center gap-2 rounded-lg bg-[#E8B94F] px-4 py-3 font-bold text-[#54251E] transition hover:bg-[#F4D27E]"
            >
              <HeartHandshake size={20} />
              Donate to Our Foundation
              <ArrowUpRight size={16} />
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
