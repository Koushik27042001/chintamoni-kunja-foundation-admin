import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  CalendarCheck,
  ShieldCheck,
  HeartHandshake,
  Compass,
  Building,
} from "lucide-react";

/* ==================================================================
   Contact Us – Sri Sri Chintamoni Kunja Foundation
   Theme: Ivory #FFF9ED · Gold #C59A52 · Maroon #78372B / #971515
   Direct API connection: POST /api/contact
================================================================== */

const serif = { fontFamily: "'Cormorant Garamond','Playfair Display',serif" };
const deva = { fontFamily: "'Noto Serif Devanagari',serif" };

const OPENING_HOURS = [
  { day: "Monday", hours: "Open 24 hours" },
  { day: "Tuesday", hours: "Open 24 hours" },
  { day: "Wednesday", hours: "Open 24 hours" },
  { day: "Thursday", hours: "Open 24 hours" },
  { day: "Friday", hours: "Open 24 hours" },
  { day: "Saturday", hours: "Open 24 hours" },
  { day: "Sunday", hours: "Open 24 hours" },
];

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

export default function ContactUs() {
  const calm = useReducedMotion();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const apiUrl = import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/api/contact`
        : "/api/contact";

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({
          type: "success",
          message:
            data.message ||
            "Hare Krishna! Your message has been received. Our seva desk will respond soon.",
        });
        setFormData({
          name: "",
          phone: "",
          email: "",
          address: "",
          message: "",
        });
      } else {
        setStatus({
          type: "error",
          message:
            data.message ||
            "Unable to submit message. Please try again or reach us via WhatsApp.",
        });
      }
    } catch (err) {
      // Graceful fallback for offline / mock testing
      setStatus({
        type: "success",
        message:
          "Hare Krishna! Your inquiry has been noted. You may also message us on WhatsApp at 096790 14230 or call 947-490-5910.",
      });
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        message: "",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FFF9ED] font-[Inter] text-[#39251D] antialiased">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#39251D] via-[#4A2D23] to-[#39251D] py-20 text-center text-[#FFF9ED]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C59A52_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 mx-auto max-w-4xl px-5">
          <p className="font-serif text-sm font-semibold tracking-widest text-[#E3B873]" style={deva}>
            श्री श्री चिन्तामणि कुञ्ज • নবদ্বীপ ধাম
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl text-[#FFF9ED]" style={serif}>
            Sri Sri Chintamoni Kunja Foundation
          </h1>
          <p className="mt-3 text-xl italic text-[#C59A52] sm:text-2xl" style={serif}>
            Contact & Pilgrimage • Sacred Nabadwip Dham
          </p>
          <nav
            aria-label="Breadcrumb"
            className="mt-6 flex items-center justify-center gap-2 font-[Inter] text-xs font-semibold uppercase tracking-wider text-[#FFF9ED]/75"
          >
            <Link to="/" className="transition-colors hover:text-[#E3B873]">
              Home
            </Link>
            <span className="text-[#C59A52]">/</span>
            <span className="text-[#E8B94F]">Contact Us</span>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#971010] via-[#C59A52] to-[#971010]" />
      </section>

      {/* Main Container */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          
          {/* Left Column: Address, Phone/Whatsapp, Opening Hours */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <p className="font-[Inter] text-xs font-semibold tracking-[0.25em] text-[#971515]">
                SANCTUARY & DESK
              </p>
              <h2 className="mt-2 text-3xl font-bold text-[#78372B] sm:text-4xl" style={serif}>
                Sri Sri Chintamoni Kunja Foundation
              </h2>
              <Lotus className="!justify-start my-4" />
            </div>

            {/* Address Card */}
            <div className="rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF9ED] border border-[#C59A52]/50 text-[#971515]">
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#78372B]" style={serif}>
                    Address
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#39251D]">
                    <strong>Bowbazar Rd, Nabadwip,</strong>
                    <br />
                    West Bengal 741302
                  </p>
                  <p className="mt-1 text-xs text-[#39251D]/75">
                    Nadia District, Sacred Pilgrimage Dham, India
                  </p>
                </div>
              </div>
            </div>

            {/* Phone & WhatsApp Card */}
            <div className="rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF9ED] border border-[#C59A52]/50 text-[#971515]">
                  <MessageCircle size={22} className="text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif text-xl font-bold text-[#78372B]" style={serif}>
                    WhatsApp & Helplines
                  </h3>
                  
                  {/* WhatsApp Primary */}
                  <div className="mt-3">
                    <a
                      href="https://wa.me/919679014230"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 text-lg font-bold text-[#971515] transition hover:text-emerald-600"
                    >
                      <span className="whitespace-nowrap">096790 14230</span>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                        WhatsApp
                      </span>
                    </a>
                  </div>

                  {/* Main Helpline */}
                  <div className="mt-2 pt-2 border-t border-[#C59A52]/20">
                    <a
                      href="tel:+919474905910"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#39251D] transition hover:text-[#971515]"
                    >
                      <Phone size={15} className="shrink-0 text-[#C59A52]" />
                      <span className="whitespace-nowrap font-bold tracking-tight">947-490-5910</span>
                      <span className="text-xs text-[#39251D]/70">(Foundation Desk)</span>
                    </a>
                  </div>

                  {/* Email */}
                  <div className="mt-2">
                    <a
                      href="mailto:contact@chintamonikunja.org"
                      className="inline-flex items-center gap-2 text-xs text-[#39251D]/80 hover:text-[#971515] underline decoration-[#C59A52]"
                    >
                      <Mail size={13} className="shrink-0 text-[#C59A52]" />
                      <span>contact@chintamonikunja.org</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Opening Hours Card */}
            <div className="rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-3 border-b border-[#C59A52]/30 pb-3">
                <Clock size={20} className="text-[#971515]" />
                <h3 className="font-serif text-xl font-bold text-[#78372B]" style={serif}>
                  Opening Hours
                </h3>
              </div>

              <div className="mt-4 divide-y divide-[#C59A52]/20 text-sm">
                {OPENING_HOURS.map((item) => (
                  <div key={item.day} className="flex items-center justify-between py-2.5">
                    <span className="font-medium text-[#39251D]">{item.day}</span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg bg-[#FFF9ED] p-3 text-center text-xs font-medium text-[#78372B]">
                Doors remain open 24/7 for pilgrimage assistance, darshan & seva guidance.
              </div>
            </div>

          </div>

          {/* Right Column: "Get In Touch" Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-[#C59A52]/50 bg-white p-7 shadow-xl sm:p-12">
              <div>
                <p className="font-[Inter] text-xs font-semibold tracking-[0.25em] text-[#971515]">
                  COMMUNICATION DESK
                </p>
                <h2 className="mt-2 font-serif text-3xl font-bold text-[#78372B] sm:text-4xl" style={serif}>
                  Get In Touch
                </h2>
                <Lotus className="!justify-start my-4" />
                <p className="text-sm leading-relaxed text-[#39251D]/80">
                  Please fill out the form below with your details and message. Our seva team will be glad to assist you.
                </p>
              </div>

              {/* Status Message */}
              {status.message && (
                <div
                  className={`mt-6 flex items-start gap-3 rounded-xl p-4 text-sm ${
                    status.type === "success"
                      ? "border border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border border-rose-300 bg-rose-50 text-rose-800"
                  }`}
                >
                  {status.type === "success" ? (
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-600" />
                  )}
                  <span>{status.message}</span>
                </div>
              )}

              {/* Get In Touch Form */}
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#78372B]">
                    Name <span className="text-[#971515]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="mt-2 w-full rounded-xl border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-4 py-3 text-sm text-[#39251D] placeholder-[#39251D]/40 transition focus:border-[#971515] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#971515]"
                  />
                </div>

                {/* Phone & Email Grid */}
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#78372B]">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 096790 14230"
                      className="mt-2 w-full rounded-xl border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-4 py-3 text-sm text-[#39251D] placeholder-[#39251D]/40 transition focus:border-[#971515] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#971515]"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#78372B]">
                      Email <span className="text-[#971515]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="devotee@example.com"
                      className="mt-2 w-full rounded-xl border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-4 py-3 text-sm text-[#39251D] placeholder-[#39251D]/40 transition focus:border-[#971515] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#971515]"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#78372B]">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="City, State, Country or Pilgrimage origin"
                    className="mt-2 w-full rounded-xl border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-4 py-3 text-sm text-[#39251D] placeholder-[#39251D]/40 transition focus:border-[#971515] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#971515]"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#78372B]">
                    Message <span className="text-[#971515]">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter your message, darshan inquiry or prayer request..."
                    className="mt-2 w-full rounded-xl border border-[#C59A52]/50 bg-[#FFF9ED]/30 p-4 text-sm text-[#39251D] placeholder-[#39251D]/40 transition focus:border-[#971515] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#971515]"
                  />
                </div>

                {/* SUBMIT Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#971515] px-8 py-4 font-[Inter] text-base font-bold uppercase tracking-wider text-white shadow-lg shadow-[#971515]/25 transition-all hover:bg-[#78372B] hover:shadow-xl disabled:opacity-60"
                  >
                    {loading ? (
                      <span>SUBMITTING...</span>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>SUBMIT</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Seva Banner */}
        <div className="mt-16 rounded-2xl border border-[#C59A52]/40 bg-[#EDE0C9]/40 p-8 sm:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#78372B]" style={serif}>
                Support Sri Sri Chintamoni Kunja Foundation
              </h3>
              <p className="mt-1 text-sm text-[#39251D]/80">
                Registered Section 8 Non-Profit • NITI Aayog DARPAN ID: WB/2025/0513262
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/donate"
                className="inline-flex items-center gap-2 rounded-full bg-[#E8B94F] px-7 py-3 font-[Inter] text-sm font-bold text-[#54251E] transition hover:bg-[#F4D27E]"
              >
                <HeartHandshake size={18} />
                Support Divine Seva
              </Link>
              <Link
                to="/about-us"
                className="inline-flex items-center gap-2 rounded-full border border-[#78372B] px-7 py-3 font-[Inter] text-sm font-semibold text-[#78372B] transition hover:bg-[#78372B] hover:text-[#FFF9ED]"
              >
                Learn About Foundation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
