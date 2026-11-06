import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { HeartHandshake, Phone, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react'

export default function Donate() {
  const [selectedAmount, setSelectedAmount] = useState('1001')
  const [customAmount, setCustomAmount] = useState('')
  const [sevaType, setSevaType] = useState('Anna Seva (Prasadam Distribution)')

  const amounts = ['501', '1001', '2501', '5001', '11000', '21000']
  const sevaOptions = [
    'Anna Seva (Prasadam Distribution)',
    'Nitya Puja & Altar Seva',
    'Gau Seva & Care',
    'Vidyarthi (Student) Support & Education',
    'Heritage Preservation & Temple Renovation',
  ]

  const handleAmountSelect = (amt) => {
    setSelectedAmount(amt)
    setCustomAmount('')
  }

  const handleCustomChange = (e) => {
    setCustomAmount(e.target.value)
    setSelectedAmount('')
  }

  return (
    <div className="min-h-screen bg-[#FFF9ED] text-[#39251D]">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#39251D] via-[#4A2D23] to-[#39251D] py-20 text-center text-[#FFF9ED]">
        <div className="relative z-10 mx-auto max-w-4xl px-4">
          <span className="inline-block rounded-full border border-[#C59A52]/40 bg-[#C59A52]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[2px] text-[#E3B873]">
            Dedicated Seva
          </span>
          <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Support Our Divine Seva
          </h1>
          <p className="mt-3 font-serif text-xl italic text-[#C59A52] sm:text-2xl">
            Sri Sri Chintamoni Kunja Foundation • Nabadwip Dham
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#EDE0C9]/80 sm:text-base">
            Your sacred contribution directly supports daily prasadam distribution, preservation of 200+ year-old Vaishnav heritage, student learning, and holy dham service.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#971010] via-[#C59A52] to-[#971010]" />
      </section>

      {/* Main Donation Container */}
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <div className="rounded-3xl border border-[#EDE0C9] bg-white p-6 shadow-md sm:p-10">
          
          {/* Step 1: Select Seva */}
          <div className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-[#971515]">
              1. Choose Your Seva
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {sevaOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSevaType(s)}
                  className={`flex items-center justify-between rounded-xl border p-4 text-left text-sm font-semibold transition-all ${
                    sevaType === s
                      ? 'border-[#971515] bg-[#FFF5E8] text-[#971515] shadow-sm'
                      : 'border-[#EDE0C9] bg-[#FFFEFC] text-[#54382B] hover:border-[#C59A52]'
                  }`}
                >
                  <span>{s}</span>
                  {sevaType === s && <CheckCircle2 size={18} className="shrink-0 text-[#971515]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Amount Selection */}
          <div className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-[#971515]">
              2. Select Donation Amount (₹ INR)
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {amounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAmountSelect(amt)}
                  className={`rounded-xl border py-3 text-center font-serif text-lg font-bold transition-all ${
                    selectedAmount === amt
                      ? 'border-[#971515] bg-[#971515] text-[#FFF9ED] shadow-md'
                      : 'border-[#EDE0C9] bg-[#FFF9ED] text-[#54382B] hover:border-[#C59A52]'
                  }`}
                >
                  ₹{Number(amt).toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <div className="mt-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#78372B]">
                Or Enter Custom Amount:
              </label>
              <div className="relative mt-1 max-w-xs">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif text-lg text-gray-500">₹</span>
                <input
                  type="number"
                  placeholder="Enter custom amount"
                  value={customAmount}
                  onChange={handleCustomChange}
                  className="w-full rounded-xl border border-[#EDE0C9] bg-[#FFFEFC] py-2.5 pl-9 pr-4 font-serif text-base font-semibold text-[#39251D] focus:border-[#971515] focus:outline-none focus:ring-1 focus:ring-[#971515]"
                />
              </div>
            </div>
          </div>

          {/* Foundation Bank / UPI Details */}
          <div className="mb-8 rounded-2xl border border-[#C59A52]/40 bg-[#FFF5E8] p-6">
            <div className="flex items-center gap-2 text-[#971515]">
              <ShieldCheck size={22} />
              <h3 className="font-serif text-xl font-bold">Foundation Account & Direct Transfer</h3>
            </div>
            <p className="mt-2 text-xs text-[#78372B]">
              For direct NEFT/RTGS, UPI, or Cheque contributions, please contact our administrative desk:
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2 text-[#54382B]">
              <div className="rounded-lg bg-white/80 p-3 border border-[#E9DFD2]">
                <p className="font-bold text-[#971515]">Beneficiary Name:</p>
                <p>Sri Sri Chintamoni Kunja Foundation</p>
                <p className="mt-2 font-bold text-[#971515]">Branch Location:</p>
                <p>Nabadwip Dham, Nadia, West Bengal</p>
              </div>
              <div className="rounded-lg bg-white/80 p-3 border border-[#E9DFD2]">
                <p className="font-bold text-[#971515]">Helpline & Seva Coordinator:</p>
                <p className="font-semibold text-base text-[#971515]">+91 9474905910</p>
                <p className="mt-2 font-bold text-[#971515]">Official Email:</p>
                <p>contact@chintamonikunja.org</p>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#EDE0C9]">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#78372B]/30 px-6 py-2.5 text-sm font-semibold text-[#78372B] transition-colors hover:bg-[#78372B] hover:text-[#FFF9ED]"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>

            <a
              href="tel:+919474905910"
              className="inline-flex items-center gap-2 rounded-full bg-[#D98232] px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-[#BD6D22]"
            >
              <Phone size={17} />
              Call to Confirm Seva
            </a>
          </div>

        </div>
      </section>
    </div>
  )
}

