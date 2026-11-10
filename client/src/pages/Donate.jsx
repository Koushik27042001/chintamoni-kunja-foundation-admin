import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  HeartHandshake,
  Phone,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Printer,
  Sparkles,
  Receipt,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react'
import {
  getPaymentConfigAPI,
  createPaymentOrderAPI,
  verifyPaymentAPI,
} from '../services/api'

// Helper to load Razorpay checkout script dynamically
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function Donate() {
  const [selectedAmount, setSelectedAmount] = useState('1001')
  const [customAmount, setCustomAmount] = useState('')
  const [sevaType, setSevaType] = useState('Daily Anna Daan Seva')

  // Donor Details State
  const [donorName, setDonorName] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [pan, setPan] = useState('')
  const [address, setAddress] = useState('')

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [gatewayConfig, setGatewayConfig] = useState({ enabled: false, keyId: '' })
  const [successDonation, setSuccessDonation] = useState(null)

  const amounts = ['501', '1001', '2501', '5001', '11000', '21000']
  const sevaOptions = [
    'Daily Anna Daan Seva',
    'Temple Renovation & Maintenance',
    'Vedic Education & Chhatra Seva',
    'Go Seva (Cow Protection)',
    'Festivals & Utsavs Seva',
    'Sadhu & Vaishnava Seva',
    'NGO Fund',
  ]

  // Fetch gateway configuration on load
  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await getPaymentConfigAPI()
        setGatewayConfig(config)
      } catch (e) {
        // Fallback gracefully
      }
    }
    loadConfig()
  }, [])

  const handleAmountSelect = (amt) => {
    setSelectedAmount(amt)
    setCustomAmount('')
    setErrorMsg('')
  }

  const handleCustomChange = (e) => {
    setCustomAmount(e.target.value)
    setSelectedAmount('')
    setErrorMsg('')
  }

  const finalAmount = customAmount ? parseFloat(customAmount) : parseFloat(selectedAmount)

  // Handle Razorpay Online Checkout
  const handleRazorpayPayment = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!donorName.trim()) {
      setErrorMsg('Please enter your full name for the official 80G receipt.')
      return
    }

    if (!mobile.trim() || mobile.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number for receipt verification.')
      return
    }

    if (!finalAmount || isNaN(finalAmount) || finalAmount < 1) {
      setErrorMsg('Please select or enter a valid donation amount of at least ₹1 INR.')
      return
    }

    setIsSubmitting(true)

    try {
      const isScriptLoaded = await loadRazorpayScript()
      if (!isScriptLoaded) {
        throw new Error('Unable to load Razorpay payment gateway. Please check your internet connection.')
      }

      // Step 1: Create Order on Backend
      const orderPayload = {
        amount: finalAmount,
        currency: 'INR',
        donorName: donorName.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        pan: pan.trim().toUpperCase(),
        address: address.trim(),
        purpose: sevaType,
      }

      const orderData = await createPaymentOrderAPI(orderPayload)

      if (!orderData || !orderData.order) {
        throw new Error('Failed to obtain a secure order token from the server.')
      }

      const keyId = (orderData.keyId || gatewayConfig.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || '').trim()

      // Step 2: Configure Razorpay Checkout modal
      const options = {
        key: keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Sri Sri Chintamoni Kunja Foundation',
        description: `Seva Contribution: ${sevaType}`,
        image: `${window.location.origin}/images/chintamoni-kunja-logo.png`,
        order_id: orderData.order.id,
        prefill: {
          name: donorName.trim(),
          email: email.trim(),
          contact: mobile.trim(),
        },
        notes: {
          purpose: sevaType,
          pan: pan.trim().toUpperCase(),
          address: address.trim(),
        },
        theme: {
          color: '#971515',
        },
        handler: async function (response) {
          setIsSubmitting(true)
          try {
            // Step 3: Backend HMAC SHA-256 verification & receipt issuance
            const verificationPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              donorName: donorName.trim(),
              email: email.trim(),
              mobile: mobile.trim(),
              pan: pan.trim().toUpperCase(),
              address: address.trim(),
              purpose: sevaType,
              amount: finalAmount,
            }

            const verificationResult = await verifyPaymentAPI(verificationPayload)

            if (verificationResult.success && verificationResult.donation) {
              setSuccessDonation(verificationResult.donation)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            } else {
              throw new Error(verificationResult.message || 'Payment signature could not be verified.')
            }
          } catch (verifyErr) {
            setErrorMsg(
              verifyErr.message ||
                'Payment verification failed. If money was debited, our desk will verify and issue your receipt manually.'
            )
          } finally {
            setIsSubmitting(false)
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response) {
        setIsSubmitting(false)
        setErrorMsg(
          `Payment uncompleted: ${response.error?.description || response.error?.reason || 'Transaction cancelled'}`
        )
      })
      rzp.open()
    } catch (err) {
      setIsSubmitting(false)
      setErrorMsg(
        err.message ||
          'Failed to initialize Razorpay checkout. Please verify gateway keys or use direct bank transfer.'
      )
    }
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
            Your sacred contribution directly supports daily anna daan, preservation of 200+ year-old Vaishnav heritage, student learning, and holy dham service. All donations are 80G tax-exempt.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#971010] via-[#C59A52] to-[#971010]" />
      </section>

      {/* Main Donation Container */}
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        {/* SUCCESS RECEIPT VIEW */}
        {successDonation ? (
          <div className="rounded-3xl border border-[#C59A52] bg-white p-6 shadow-xl sm:p-10">
            <div className="mx-auto max-w-2xl">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
                  <CheckCircle2 size={36} />
                </div>
                <span className="mt-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Payment Verified • Official 80G Receipt Issued
                </span>
                <h2 className="mt-2 font-serif text-3xl font-bold text-[#971515]">
                  Dandavat Pranams & Gratitude!
                </h2>
                <p className="mt-1 text-sm text-[#78372B]">
                  Your sacred seva contribution has been successfully received by Sri Sri Chintamoni Kunja Foundation.
                </p>
              </div>

              {/* Printable Official Receipt Card */}
              <div
                id="ckf-official-receipt"
                className="mt-8 rounded-2xl border-2 border-dashed border-[#C59A52]/60 bg-[#FFFDF9] p-6 shadow-sm"
              >
                <div className="border-b border-[#EDE0C9] pb-4 text-center">
                  <h3 className="font-serif text-xl font-bold text-[#971515]">
                    SRI SRI CHINTAMONI KUNJA FOUNDATION
                  </h3>
                  <p className="text-xs text-[#78372B]">
                    Nabadwip Dham, Nadia, West Bengal • NGO Darpan ID: WB/2025/0513262
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#C59A52]">
                    OFFICIAL DONATION RECEIPT (UNDER SECTION 80G)
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="font-semibold text-gray-500">Receipt No:</span>
                    <p className="font-mono font-bold text-[#971515]">{successDonation.receiptNo}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-500">Date & Time:</span>
                    <p className="font-medium text-[#39251D]">
                      {new Date(successDonation.date || successDonation.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-500">Donor Name:</span>
                    <p className="font-bold text-[#39251D]">{successDonation.donorName}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-500">Mobile / Contact:</span>
                    <p className="font-medium text-[#39251D]">{successDonation.mobile || 'N/A'}</p>
                  </div>

                  {successDonation.pan && (
                    <div>
                      <span className="font-semibold text-gray-500">Donor PAN:</span>
                      <p className="font-mono font-bold text-[#39251D]">{successDonation.pan}</p>
                    </div>
                  )}

                  <div className={successDonation.pan ? 'text-right' : 'col-span-2'}>
                    <span className="font-semibold text-gray-500">Seva Purpose:</span>
                    <p className="font-semibold text-[#971515]">{successDonation.purpose}</p>
                  </div>

                  <div className="col-span-2 rounded-xl bg-[#FFF5E8] p-3 text-center border border-[#EDE0C9]">
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#78372B]">
                      Donation Amount
                    </span>
                    <p className="font-serif text-3xl font-extrabold text-[#971515]">
                      ₹{Number(successDonation.amount).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs italic text-[#54382B]">{successDonation.amountInWords}</p>
                  </div>

                  <div className="col-span-2 text-xs text-gray-500 border-t border-[#EDE0C9] pt-3">
                    <p>
                      <span className="font-semibold">Transaction ID:</span>{' '}
                      <span className="font-mono">{successDonation.transactionId || successDonation.razorpayPaymentId}</span>
                    </p>
                    <p className="mt-1 text-[11px] leading-tight text-gray-400">
                      * All donations to Sri Sri Chintamoni Kunja Foundation are eligible for tax benefits under Section 80G of the Indian Income Tax Act. Computer generated receipt does not require physical signature.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-full bg-[#971515] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#781010] transition-all"
                >
                  <Printer size={16} />
                  Print / Save Receipt
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessDonation(null)
                    setCustomAmount('')
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#971515] px-6 py-2.5 text-sm font-semibold text-[#971515] hover:bg-[#FFF5E8] transition-all"
                >
                  <Receipt size={16} />
                  Make Another Contribution
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleRazorpayPayment}
            className="rounded-3xl border border-[#EDE0C9] bg-white p-6 shadow-md sm:p-10"
          >
            {/* Step 1: Select Seva */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold text-[#971515]">
                  1. Choose Your Seva
                </h2>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#C59A52]">
                  <Sparkles size={14} /> 80G Tax Deductible
                </span>
              </div>
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
                    min="1"
                    placeholder="Enter custom amount"
                    value={customAmount}
                    onChange={handleCustomChange}
                    className="w-full rounded-xl border border-[#EDE0C9] bg-[#FFFEFC] py-2.5 pl-9 pr-4 font-serif text-base font-semibold text-[#39251D] focus:border-[#971515] focus:outline-none focus:ring-1 focus:ring-[#971515]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Donor Details for Official 80G Receipt */}
            <div className="mb-8 rounded-2xl border border-[#EDE0C9] bg-[#FFFEFC] p-6">
              <h2 className="font-serif text-xl font-bold text-[#971515]">
                3. Donor Information (For Official Receipt & 80G Benefit)
              </h2>
              <p className="mt-1 text-xs text-[#78372B]">
                Your receipt will be generated in this name and linked to your mobile for 80G certificate issuance.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#54382B]">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="e.g. Radhamohan Das"
                    className="mt-1 w-full rounded-xl border border-[#EDE0C9] bg-white p-2.5 text-sm text-[#39251D] focus:border-[#971515] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#54382B]">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="mt-1 w-full rounded-xl border border-[#EDE0C9] bg-white p-2.5 text-sm text-[#39251D] focus:border-[#971515] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#54382B]">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="mt-1 w-full rounded-xl border border-[#EDE0C9] bg-white p-2.5 text-sm text-[#39251D] focus:border-[#971515] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#54382B]">
                    PAN Card Number (Recommended for 80G Tax Exemption)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="mt-1 w-full uppercase font-mono rounded-xl border border-[#EDE0C9] bg-white p-2.5 text-sm text-[#39251D] focus:border-[#971515] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#54382B]">
                    Address / City (Optional)
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Mayapur, Nadia, West Bengal"
                    className="mt-1 w-full rounded-xl border border-[#EDE0C9] bg-white p-2.5 text-sm text-[#39251D] focus:border-[#971515] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Error Message Display */}
            {errorMsg && (
              <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200">
                <AlertCircle size={18} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Primary Action Button: Razorpay Checkout */}
            <div className="mb-8 text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto min-w-[320px] inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#971515] via-[#A81E1E] to-[#971515] px-8 py-4 font-serif text-lg font-bold text-white shadow-xl hover:from-[#7E1111] hover:to-[#7E1111] transition-all disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Connecting to Payment Gateway...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Contribute ₹{finalAmount ? Number(finalAmount).toLocaleString('en-IN') : '0'} via Razorpay
                  </>
                )}
              </button>
              <div className="mt-3 flex items-center justify-center gap-4 text-xs text-[#78372B]">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-600" /> 256-Bit SSL Secured
                </span>
                <span>•</span>
                <span>Supports UPI, Cards, NetBanking</span>
                <span>•</span>
                <span>Instant 80G E-Receipt</span>
              </div>
            </div>

            {/* Foundation Bank / UPI Details */}
            <div className="mb-8 rounded-2xl border border-[#C59A52]/40 bg-[#FFF5E8] p-6">
              <div className="flex items-center gap-2 text-[#971515]">
                <ShieldCheck size={22} />
                <h3 className="font-serif text-xl font-bold">Foundation Account & Direct Bank Transfer</h3>
              </div>
              <p className="mt-2 text-xs text-[#78372B]">
                For direct NEFT/RTGS, UPI, or Cheque contributions, please use the foundation desk details below:
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
          </form>
        )}
      </section>
    </div>
  )
}
