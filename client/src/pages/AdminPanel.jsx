import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Calendar,
  FileText,
  Image as ImageIcon,
  Printer,
  Download,
  Upload,
  Plus,
  Trash2,
  Search,
  Check,
  CheckSquare,
  Square,
  Building2,
  Phone,
  MapPin,
  HeartHandshake,
  ArrowLeft,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

/* ==================================================================
   Number to Words Converter (Indian Currency Format)
================================================================== */
function numberToWords(num) {
  const n = parseInt(num, 10);
  if (isNaN(n) || n === 0) return "Zero Rupees Only";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertTwoDigits(v) {
    if (v < 20) return a[v];
    return b[Math.floor(v / 10)] + (v % 10 !== 0 ? " " + a[v % 10] : "");
  }

  function convertThreeDigits(v) {
    let str = "";
    if (Math.floor(v / 100) > 0) {
      str += a[Math.floor(v / 100)] + " Hundred ";
      v %= 100;
    }
    if (v > 0) {
      str += convertTwoDigits(v);
    }
    return str.trim();
  }

  let crore = Math.floor(n / 10000000);
  let rem = n % 10000000;
  let lakh = Math.floor(rem / 100000);
  rem %= 100000;
  let thousand = Math.floor(rem / 1000);
  rem %= 1000;
  let hundred = rem;

  let res = "";
  if (crore > 0) res += convertTwoDigits(crore) + " Crore ";
  if (lakh > 0) res += convertTwoDigits(lakh) + " Lakh ";
  if (thousand > 0) res += convertTwoDigits(thousand) + " Thousand ";
  if (hundred > 0) res += convertThreeDigits(hundred);

  return res.trim() + " Rupees Only";
}

/* ==================================================================
   Mock Default Members Data
================================================================== */
const INITIAL_MEMBERS = [
  {
    id: "CKF-M-001",
    name: "Shyamasundar Das",
    address1: "House 14, Harisabha Para",
    address2: "Near Ganga Ghat",
    city: "Nabadwip",
    postOffice: "Nabadwip",
    district: "Nadia",
    state: "West Bengal",
    pincode: "741302",
    country: "India",
    mobile1: "9832104512",
    mobile2: "9474905910",
  },
  {
    id: "CKF-M-002",
    name: "Anandamayee Devi",
    address1: "Bowbazar Road, Ward 5",
    address2: "Opposite Radha Madan Mohan Mandir",
    city: "Nabadwip",
    postOffice: "Nabadwip",
    district: "Nadia",
    state: "West Bengal",
    pincode: "741302",
    country: "India",
    mobile1: "9679014230",
    mobile2: "",
  },
  {
    id: "CKF-M-003",
    name: "Gouranga Charan Chakraborty",
    address1: "College Para, Main Road",
    address2: "Near Nabadwip Vidyasagar College",
    city: "Nabadwip",
    postOffice: "Nabadwip",
    district: "Nadia",
    state: "West Bengal",
    pincode: "741302",
    country: "India",
    mobile1: "9123456780",
    mobile2: "9876543210",
  },
];

/* ==================================================================
   CSV Export Utilities
================================================================== */
function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const separator = ",";
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    "\n" +
    rows
      .map((row) =>
        keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? "" : String(row[k]);
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator)
      )
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("receipt"); // receipt, history, members, events, blogs, gallery

  // Members state
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem("ckf_members");
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  // New Member Manual Form State
  const [newMember, setNewMember] = useState({
    id: "",
    name: "",
    address1: "",
    address2: "",
    city: "Nabadwip",
    postOffice: "Nabadwip",
    district: "Nadia",
    state: "West Bengal",
    pincode: "741302",
    country: "India",
    mobile1: "",
    mobile2: "",
  });

  // Receipt Generation Form State
  const [receiptSearch, setReceiptSearch] = useState("");
  const [selectedMemberForReceipt, setSelectedMemberForReceipt] = useState(null);
  const [receiptForm, setReceiptForm] = useState({
    receiptNo: `CKF-${Date.now().toString().slice(-6)}`,
    amount: "1001",
    date: new Date().toLocaleDateString("en-GB"),
    paymentMode: "Cash",
    collectionType: "Person comes to Foundation / Office", // Segmentation A vs B
    purpose: "NGO Fund",
    collectedBy: "Krishnendu Chakraborty",
  });

  // Collection History (Saved receipts)
  const [receipts, setReceipts] = useState(() => {
    const saved = localStorage.getItem("ckf_receipts");
    return saved ? JSON.parse(saved) : [];
  });

  // Current Generated Receipt to Preview / Print
  const [currentReceipt, setCurrentReceipt] = useState(null);

  // Status banners
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    localStorage.setItem("ckf_members", JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem("ckf_receipts", JSON.stringify(receipts));
  }, [receipts]);

  const showAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(""), 4000);
  };

  /* ---------------------------------------------------------------
     Receipt Generation Handlers
  --------------------------------------------------------------- */
  const handleSelectMemberForReceipt = (m) => {
    setSelectedMemberForReceipt(m);
    setReceiptSearch(`${m.name} (${m.id})`);
  };

  const handleGenerateReceipt = (e) => {
    e.preventDefault();
    if (!selectedMemberForReceipt) {
      alert("Please search and select a registered Member first.");
      return;
    }
    if (!receiptForm.amount || parseFloat(receiptForm.amount) <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }

    const generated = {
      ...receiptForm,
      receiptNo: receiptForm.receiptNo || `CKF-${Date.now().toString().slice(-6)}`,
      member: selectedMemberForReceipt,
      amountInWords: numberToWords(receiptForm.amount),
      createdAt: new Date().toISOString(),
    };

    setCurrentReceipt(generated);
    showAlert(`Receipt ${generated.receiptNo} generated successfully!`);
  };

  const handleSaveOfficeRecord = () => {
    if (!currentReceipt) return;
    const exists = receipts.find((r) => r.receiptNo === currentReceipt.receiptNo);
    if (exists) {
      showAlert("This receipt is already saved in Office Collection History.");
      return;
    }
    setReceipts([currentReceipt, ...receipts]);
    showAlert(`Receipt ${currentReceipt.receiptNo} saved to Office Collection Records.`);
  };

  const handlePrint = () => {
    window.print();
  };

  /* ---------------------------------------------------------------
     Member Database Handlers
  --------------------------------------------------------------- */
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.mobile1) {
      alert("Please provide at least Name and Mobile-1.");
      return;
    }
    const memberId = newMember.id.trim() || `CKF-M-${String(members.length + 1).padStart(3, "0")}`;
    const entry = { ...newMember, id: memberId };
    setMembers([entry, ...members]);
    setNewMember({
      id: "",
      name: "",
      address1: "",
      address2: "",
      city: "Nabadwip",
      postOffice: "Nabadwip",
      district: "Nadia",
      state: "West Bengal",
      pincode: "741302",
      country: "India",
      mobile1: "",
      mobile2: "",
    });
    showAlert(`Member ${entry.name} (${entry.id}) added successfully.`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          alert("CSV file seems empty or missing header row.");
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim().toUpperCase());
        const parsedMembers = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
          if (values.length >= 2 && values[1]) {
            parsedMembers.push({
              id: values[0] || `CKF-M-${String(members.length + i).padStart(3, "0")}`,
              name: values[1] || "",
              address1: values[2] || "",
              address2: values[3] || "",
              city: values[4] || "Nabadwip",
              postOffice: values[5] || "Nabadwip",
              district: values[6] || "Nadia",
              state: values[7] || "West Bengal",
              pincode: values[8] || "741302",
              country: values[9] || "India",
              mobile1: values[10] || "",
              mobile2: values[11] || "",
            });
          }
        }

        setMembers([...parsedMembers, ...members]);
        showAlert(`Successfully imported ${parsedMembers.length} members from file!`);
      } catch (err) {
        alert("Error parsing CSV/Excel file. Please ensure standard comma-separated format.");
      }
    };
    reader.readAsText(file);
  };

  const handleSelectAllMembers = () => {
    if (selectedMemberIds.length === members.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(members.map((m) => m.id));
    }
  };

  const handleRemoveSelectedMembers = () => {
    if (!selectedMemberIds.length) return;
    if (confirm(`Remove ${selectedMemberIds.length} selected member(s)?`)) {
      setMembers(members.filter((m) => !selectedMemberIds.includes(m.id)));
      setSelectedMemberIds([]);
      showAlert("Selected members removed.");
    }
  };

  /* ---------------------------------------------------------------
     Filtered Lists
  --------------------------------------------------------------- */
  const filteredMembers = members.filter((m) => {
    const q = memberSearchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.mobile1.includes(q) ||
      (m.city && m.city.toLowerCase().includes(q))
    );
  });

  const memberSearchResults = receiptSearch.trim().length > 0
    ? members.filter((m) => {
        const q = receiptSearch.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.mobile1.includes(q)
        );
      })
    : [];

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-[Inter] text-[#39251D]">
      {/* Print Specific CSS to format Donor & Office Receipts cleanly */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Admin Navigation Header (Screen only) */}
      <header className="no-print sticky top-0 z-30 border-b border-[#C59A52]/30 bg-white/95 px-5 py-3 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-lg border border-[#C59A52]/30 px-3 py-1.5 text-xs font-semibold text-[#78372B] hover:bg-[#FFF9ED]"
            >
              <ArrowLeft size={14} />
              <span>Back to Website</span>
            </Link>
            <div className="h-4 w-px bg-[#C59A52]/30" />
            <h1 className="font-serif text-xl font-bold text-[#971515]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Sri Sri Chintamoni Kunja Foundation — Seva Admin Portal
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
              ● Central Office (Nabadwip Dham)
            </span>
          </div>
        </div>
      </header>

      {/* Alert Banner */}
      {alertMsg && (
        <div className="no-print fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-900 shadow-2xl animate-fadeUp">
          <Check size={18} className="text-emerald-600" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Navigation Tabs */}
        <div className="no-print mb-8 flex flex-wrap gap-2 border-b border-[#C59A52]/30 pb-4">
          {[
            { id: "receipt", label: "New Fund Receipt", icon: Receipt },
            { id: "history", label: "Office Copy / History", icon: FileText },
            { id: "members", label: "Members / Upload Excel", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                  active
                    ? "bg-[#971515] text-white shadow-md shadow-[#971515]/25"
                    : "border border-[#C59A52]/40 bg-white text-[#78372B] hover:bg-[#FFF9ED]"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ==============================================================
            TAB 1: NEW FUND RECEIPT GENERATOR
        ============================================================== */}
        {activeTab === "receipt" && (
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left 5 Cols: Receipt Generation Form */}
            <div className="no-print lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm">
                <div className="border-b border-[#C59A52]/20 pb-3">
                  <h2 className="font-serif text-2xl font-bold text-[#78372B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    New Fund Receipt
                  </h2>
                  <p className="mt-0.5 text-xs text-[#39251D]/70">
                    Search registered member or auto-fill details to generate dual receipt.
                  </p>
                </div>

                <form onSubmit={handleGenerateReceipt} className="mt-5 space-y-4">
                  {/* Search Member */}
                  <div className="relative">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#78372B]">
                      Search Member <span className="text-[#971515]">*</span>
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        placeholder="Search by Member ID, Name or Phone..."
                        value={receiptSearch}
                        onChange={(e) => setReceiptSearch(e.target.value)}
                        className="w-full rounded-lg border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-3.5 py-2 text-sm text-[#39251D] placeholder-[#39251D]/40 focus:border-[#971515] focus:outline-none"
                      />
                      <Search size={16} className="absolute right-3 top-2.5 text-[#C59A52]" />
                    </div>

                    {/* Member Dropdown Results */}
                    {memberSearchResults.length > 0 && !selectedMemberForReceipt && (
                      <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-[#C59A52] bg-white p-1 shadow-lg">
                        {memberSearchResults.map((m) => (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => handleSelectMemberForReceipt(m)}
                            className="flex w-full flex-col p-2 text-left text-xs transition hover:bg-[#FFF9ED]"
                          >
                            <span className="font-bold text-[#971515]">{m.name} ({m.id})</span>
                            <span className="text-[11px] text-[#39251D]/70">{m.address1}, {m.city} • Ph: {m.mobile1}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedMemberForReceipt && (
                      <div className="mt-2 flex items-center justify-between rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800">
                        <span>Selected: <strong>{selectedMemberForReceipt.name}</strong> ({selectedMemberForReceipt.id})</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMemberForReceipt(null);
                            setReceiptSearch("");
                          }}
                          className="text-[11px] font-bold text-emerald-900 underline"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Amount (₹) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#78372B]">
                      Amount (₹) <span className="text-[#971515]">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={receiptForm.amount}
                      onChange={(e) => setReceiptForm({ ...receiptForm, amount: e.target.value })}
                      placeholder="e.g. 1001"
                      className="mt-1 w-full rounded-lg border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-3.5 py-2 text-sm font-bold text-[#39251D] focus:border-[#971515] focus:outline-none"
                    />
                    <p className="mt-1 text-[11px] italic text-[#C59A52]">
                      {numberToWords(receiptForm.amount)}
                    </p>
                  </div>

                  {/* Payment Mode */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#78372B]">
                      Payment Mode
                    </label>
                    <select
                      value={receiptForm.paymentMode}
                      onChange={(e) => setReceiptForm({ ...receiptForm, paymentMode: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-3.5 py-2 text-sm text-[#39251D] focus:border-[#971515] focus:outline-none"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Online / UPI">Online / UPI</option>
                      <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS)</option>
                      <option value="Cheque / DD">Cheque / DD</option>
                    </select>
                  </div>

                  {/* Offline Donation Segmentation: Person came to Foundation OR Field Collection */}
                  <div className="rounded-xl border border-[#C59A52]/40 bg-[#FFF9ED]/60 p-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#971515]">
                      Collection Segmentation (Offline/Direct)
                    </label>
                    <div className="mt-2 space-y-2 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="collectionType"
                          value="Person comes to Foundation / Office"
                          checked={receiptForm.collectionType === "Person comes to Foundation / Office"}
                          onChange={(e) => setReceiptForm({ ...receiptForm, collectionType: e.target.value })}
                          className="accent-[#971515]"
                        />
                        <span>Donor visited Foundation / Office in Nabadwip</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="collectionType"
                          value="Field / Doorstep Collection (Collector visited donor)"
                          checked={receiptForm.collectionType === "Field / Doorstep Collection (Collector visited donor)"}
                          onChange={(e) => setReceiptForm({ ...receiptForm, collectionType: e.target.value })}
                          className="accent-[#971515]"
                        />
                        <span>Foundation individual went to donor's place</span>
                      </label>
                    </div>
                  </div>

                  {/* Date & Purpose Grid */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#78372B]">
                        Date
                      </label>
                      <input
                        type="text"
                        value={receiptForm.date}
                        onChange={(e) => setReceiptForm({ ...receiptForm, date: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-3 py-2 text-xs text-[#39251D] focus:border-[#971515] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#78372B]">
                        Purpose
                      </label>
                      <select
                        value={receiptForm.purpose}
                        onChange={(e) => setReceiptForm({ ...receiptForm, purpose: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-3 py-2 text-xs text-[#39251D] focus:border-[#971515] focus:outline-none"
                      >
                        <option value="NGO Fund">NGO Fund</option>
                        <option value="Anna Daan (Zero Starvation)">Anna Daan (Zero Starvation)</option>
                        <option value="Academic Help for Students">Academic Help for Students</option>
                        <option value="Nitya Puja & Altar Seva">Nitya Puja & Altar Seva</option>
                        <option value="Festival Utsav & Rath Yatra">Festival Utsav & Rath Yatra</option>
                        <option value="General Donation">General Donation</option>
                      </select>
                    </div>
                  </div>

                  {/* Collected By */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#78372B]">
                      Collected By (Collector Name)
                    </label>
                    <input
                      type="text"
                      required
                      value={receiptForm.collectedBy}
                      onChange={(e) => setReceiptForm({ ...receiptForm, collectedBy: e.target.value })}
                      placeholder="Collector name / Staff ID"
                      className="mt-1 w-full rounded-lg border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-3.5 py-2 text-sm text-[#39251D] focus:border-[#971515] focus:outline-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#971515] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#78372B]"
                    >
                      <Sparkles size={16} />
                      <span>Generate Receipt</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right 7 Cols: Printable Dual Receipt Preview */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm">
                <div className="no-print flex items-center justify-between border-b border-[#C59A52]/30 pb-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#78372B]">
                      Receipt Preview & Actions
                    </h3>
                    <p className="text-xs text-[#39251D]/70">
                      Standard Dual Receipt: Top copy for Donor, Bottom copy for Foundation records.
                    </p>
                  </div>

                  {currentReceipt && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveOfficeRecord}
                        className="flex items-center gap-1.5 rounded-lg border border-[#C59A52] bg-[#FFF9ED] px-3 py-1.5 text-xs font-bold text-[#78372B] hover:bg-[#C59A52]/20"
                      >
                        <FileSpreadsheet size={14} />
                        <span>Save Office Record</span>
                      </button>
                      <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 rounded-lg bg-[#971515] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#78372B] shadow-sm"
                      >
                        <Printer size={14} />
                        <span>Print Receipt + Office Copy</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Printable Receipt Content Area */}
                <div id="print-area" className="mt-4 space-y-6">
                  {currentReceipt ? (
                    <>
                      {/* 1. DONOR COPY */}
                      <div className="rounded-xl border-2 border-[#971515] bg-[#FFFCF7] p-5 text-[#39251D] shadow-sm">
                        <div className="flex items-start justify-between border-b border-[#C59A52]/40 pb-3">
                          <div>
                            <span className="font-bold text-[10px] uppercase tracking-widest text-[#971515] border border-[#971515] px-2 py-0.5 rounded">
                              DONOR COPY
                            </span>
                            <h2 className="mt-1 font-serif text-xl font-bold text-[#971515]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                              Sri Sri Chintamoni Kunja Foundation
                            </h2>
                            <p className="text-[11px] text-[#39251D]/75">
                              Bowbazar Rd, Nabadwip, Nadia, West Bengal 741302 • Section 8 Registered (ROC) • DARPAN: WB/2025/0513262
                            </p>
                          </div>
                          <div className="text-right text-xs">
                            <p className="font-bold text-[#971515]">Receipt No: {currentReceipt.receiptNo}</p>
                            <p className="text-[#39251D]/80">Date: {currentReceipt.date}</p>
                          </div>
                        </div>

                        {/* Table of Details */}
                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                          <div><span className="text-[#78372B] font-semibold">Member ID:</span> {currentReceipt.member.id}</div>
                          <div><span className="text-[#78372B] font-semibold">Member Name:</span> <strong>{currentReceipt.member.name}</strong></div>
                          <div><span className="text-[#78372B] font-semibold">Address - 1:</span> {currentReceipt.member.address1 || "—"}</div>
                          <div><span className="text-[#78372B] font-semibold">Address - 2:</span> {currentReceipt.member.address2 || "—"}</div>
                          <div><span className="text-[#78372B] font-semibold">Village/Town/City:</span> {currentReceipt.member.city || "—"}</div>
                          <div><span className="text-[#78372B] font-semibold">Post Office:</span> {currentReceipt.member.postOffice || "—"}</div>
                          <div><span className="text-[#78372B] font-semibold">District/City:</span> {currentReceipt.member.district || "—"}</div>
                          <div><span className="text-[#78372B] font-semibold">State:</span> {currentReceipt.member.state} ({currentReceipt.member.pincode})</div>
                          <div><span className="text-[#78372B] font-semibold">Mobile - 1:</span> {currentReceipt.member.mobile1}</div>
                          <div><span className="text-[#78372B] font-semibold">Mobile - 2:</span> {currentReceipt.member.mobile2 || "—"}</div>
                          <div><span className="text-[#78372B] font-semibold">Purpose:</span> {currentReceipt.purpose}</div>
                          <div><span className="text-[#78372B] font-semibold">Payment Mode:</span> {currentReceipt.paymentMode}</div>
                          <div className="col-span-2 text-[11px] text-[#971515] italic">
                            <span className="font-semibold">Collection Mode:</span> {currentReceipt.collectionType}
                          </div>
                        </div>

                        {/* Amount Box */}
                        <div className="mt-3 flex items-center justify-between rounded-lg border border-[#C59A52] bg-white p-2.5">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#78372B]">Amount in Words:</span>
                            <p className="font-serif text-sm font-bold text-[#971515] italic">{currentReceipt.amountInWords}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-[#78372B]">Amount:</span>
                            <p className="text-lg font-bold text-[#971515]">₹ {currentReceipt.amount}/-</p>
                          </div>
                        </div>

                        {/* Signatures */}
                        <div className="mt-5 flex items-center justify-between pt-4 border-t border-[#C59A52]/20 text-[11px]">
                          <div className="text-center">
                            <div className="h-6 border-b border-dashed border-[#39251D]/40 w-36 mb-1" />
                            <span>Member / Collector Signature</span>
                          </div>
                          <div className="text-center text-[10px] text-[#39251D]/70">
                            <span>Collected By: {currentReceipt.collectedBy}</span>
                          </div>
                          <div className="text-center">
                            <div className="h-6 border-b border-dashed border-[#39251D]/40 w-36 mb-1" />
                            <span>Authorized Signature & Seal</span>
                          </div>
                        </div>
                      </div>

                      {/* Perforated separator */}
                      <div className="relative my-4 text-center">
                        <div className="border-b-2 border-dashed border-[#C59A52]/50" />
                        <span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-white px-3 text-[10px] text-[#78372B] font-semibold uppercase">
                          ✂ Fold or Detach Here (Official Perforation)
                        </span>
                      </div>

                      {/* 2. OFFICE COPY */}
                      <div className="rounded-xl border-2 border-[#78372B] bg-[#FFF9ED] p-5 text-[#39251D] shadow-sm">
                        <div className="flex items-start justify-between border-b border-[#C59A52]/40 pb-3">
                          <div>
                            <span className="font-bold text-[10px] uppercase tracking-widest text-[#78372B] border border-[#78372B] px-2 py-0.5 rounded">
                              OFFICE COPY / RECORD
                            </span>
                            <h2 className="mt-1 font-serif text-xl font-bold text-[#78372B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                              Sri Sri Chintamoni Kunja Foundation
                            </h2>
                            <p className="text-[11px] text-[#39251D]/75">
                              Nabadwip Dham Office • Section 8 Reg. No. 253219 • DARPAN ID: WB/2025/0513262
                            </p>
                          </div>
                          <div className="text-right text-xs">
                            <p className="font-bold text-[#78372B]">Receipt No: {currentReceipt.receiptNo}</p>
                            <p className="text-[#39251D]/80">Date: {currentReceipt.date}</p>
                          </div>
                        </div>

                        {/* Table */}
                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                          <div><span className="text-[#78372B] font-semibold">Member ID:</span> {currentReceipt.member.id}</div>
                          <div><span className="text-[#78372B] font-semibold">Member Name:</span> <strong>{currentReceipt.member.name}</strong></div>
                          <div><span className="text-[#78372B] font-semibold">City / District:</span> {currentReceipt.member.city}, {currentReceipt.member.district}</div>
                          <div><span className="text-[#78372B] font-semibold">Phone:</span> {currentReceipt.member.mobile1}</div>
                          <div><span className="text-[#78372B] font-semibold">Purpose:</span> {currentReceipt.purpose}</div>
                          <div><span className="text-[#78372B] font-semibold">Payment Mode:</span> {currentReceipt.paymentMode}</div>
                          <div className="col-span-2 text-[11px] text-[#78372B] italic">
                            <span className="font-semibold">Collection Mode:</span> {currentReceipt.collectionType}
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="mt-3 flex items-center justify-between rounded-lg border border-[#C59A52] bg-white p-2.5">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#78372B]">Amount in Words:</span>
                            <p className="font-serif text-sm font-bold text-[#78372B] italic">{currentReceipt.amountInWords}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-[#78372B]">Amount:</span>
                            <p className="text-lg font-bold text-[#78372B]">₹ {currentReceipt.amount}/-</p>
                          </div>
                        </div>

                        {/* Signatures */}
                        <div className="mt-5 flex items-center justify-between pt-4 border-t border-[#C59A52]/20 text-[11px]">
                          <div className="text-center">
                            <div className="h-6 border-b border-dashed border-[#39251D]/40 w-36 mb-1" />
                            <span>Member / Collector</span>
                          </div>
                          <div className="text-center text-[10px] text-[#39251D]/70">
                            <span>Collected By: {currentReceipt.collectedBy}</span>
                          </div>
                          <div className="text-center">
                            <div className="h-6 border-b border-dashed border-[#39251D]/40 w-36 mb-1" />
                            <span>Authorized Signatory</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-[#C59A52]/50 p-8 text-center text-[#39251D]/60">
                      <Receipt size={40} className="text-[#C59A52]/60 mb-3" />
                      <p className="font-serif text-lg font-bold text-[#78372B]">
                        No Receipt Generated Yet
                      </p>
                      <p className="mt-1 text-xs max-w-sm">
                        Select a member from the left panel, fill in donation amount & payment details, and click "Generate Receipt".
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 2: OFFICE COPY / COLLECTION HISTORY
        ============================================================== */}
        {activeTab === "history" && (
          <div className="rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#C59A52]/30 pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#78372B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Office Copy / Collection History
                </h2>
                <p className="text-xs text-[#39251D]/70">
                  Saved receipts can be reprinted and exported for office documentation and auditing.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    exportToCSV(
                      `CKF-Office-Collection-Records-${new Date().toISOString().slice(0, 10)}.csv`,
                      receipts.map((r) => ({
                        ReceiptNo: r.receiptNo,
                        Date: r.date,
                        MemberID: r.member.id,
                        MemberName: r.member.name,
                        Amount: r.amount,
                        PaymentMode: r.paymentMode,
                        CollectionType: r.collectionType,
                        Purpose: r.purpose,
                        CollectedBy: r.collectedBy,
                        Phone: r.member.mobile1,
                      }))
                    )
                  }
                  disabled={!receipts.length}
                  className="flex items-center gap-2 rounded-lg bg-[#971515] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#78372B] disabled:opacity-50"
                >
                  <Download size={14} />
                  <span>Export Office Records CSV</span>
                </button>
              </div>
            </div>

            {/* Collection Summary Counters */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-[#C59A52]/30 bg-[#FFF9ED] p-4 text-center">
                <span className="text-xs uppercase font-bold text-[#C59A52]">Total Receipts</span>
                <p className="mt-1 font-serif text-2xl font-bold text-[#78372B]">{receipts.length}</p>
              </div>
              <div className="rounded-xl border border-[#C59A52]/30 bg-[#FFF9ED] p-4 text-center">
                <span className="text-xs uppercase font-bold text-[#C59A52]">Total Funds</span>
                <p className="mt-1 font-serif text-2xl font-bold text-[#971515]">
                  ₹ {receipts.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="rounded-xl border border-[#C59A52]/30 bg-[#FFF9ED] p-4 text-center">
                <span className="text-xs uppercase font-bold text-[#C59A52]">In-Office / Desk</span>
                <p className="mt-1 font-serif text-xl font-bold text-[#39251D]">
                  {receipts.filter((r) => r.collectionType && r.collectionType.includes("Foundation")).length}
                </p>
              </div>
              <div className="rounded-xl border border-[#C59A52]/30 bg-[#FFF9ED] p-4 text-center">
                <span className="text-xs uppercase font-bold text-[#C59A52]">Field / Doorstep</span>
                <p className="mt-1 font-serif text-xl font-bold text-[#39251D]">
                  {receipts.filter((r) => r.collectionType && r.collectionType.includes("Field")).length}
                </p>
              </div>
            </div>

            {/* Receipts Table */}
            <div className="mt-6 overflow-x-auto">
              {receipts.length > 0 ? (
                <table className="w-full text-left text-xs border border-[#C59A52]/20">
                  <thead className="bg-[#FFF9ED] text-[#78372B] border-b border-[#C59A52]/30 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3">Receipt No</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Member ID & Name</th>
                      <th className="p-3">Amount (₹)</th>
                      <th className="p-3">Mode</th>
                      <th className="p-3">Collection Segmentation</th>
                      <th className="p-3">Purpose</th>
                      <th className="p-3">Collected By</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C59A52]/20">
                    {receipts.map((r) => (
                      <tr key={r.receiptNo} className="hover:bg-[#FFF9ED]/40 transition">
                        <td className="p-3 font-bold text-[#971515]">{r.receiptNo}</td>
                        <td className="p-3">{r.date}</td>
                        <td className="p-3">
                          <strong>{r.member.name}</strong> <span className="text-[#C59A52]">({r.member.id})</span>
                        </td>
                        <td className="p-3 font-bold text-emerald-800">₹ {r.amount}</td>
                        <td className="p-3">{r.paymentMode}</td>
                        <td className="p-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              r.collectionType && r.collectionType.includes("Foundation")
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-blue-100 text-blue-900 border border-blue-300"
                            }`}
                          >
                            {r.collectionType && r.collectionType.includes("Foundation") ? "In-Office" : "Field Pickup"}
                          </span>
                        </td>
                        <td className="p-3">{r.purpose}</td>
                        <td className="p-3">{r.collectedBy}</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setCurrentReceipt(r);
                              setActiveTab("receipt");
                            }}
                            className="font-bold text-[#971515] hover:underline"
                          >
                            Reprint
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-16 text-center text-[#39251D]/60">
                  <FileText size={36} className="mx-auto mb-2 text-[#C59A52]/60" />
                  <p className="font-serif text-lg font-bold text-[#78372B]">No saved receipts.</p>
                  <p className="text-xs">Generated receipts will be listed here with office copies.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 3: MEMBERS / UPLOAD EXCEL / BULK ACTIONS
        ============================================================== */}
        {activeTab === "members" && (
          <div className="space-y-8">
            {/* Top Row: Upload Excel/CSV Box & Actions */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Box 1: Upload Excel/CSV */}
              <div className="rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-[#C59A52]/20 pb-3">
                  <Upload size={18} className="text-[#971515]" />
                  <h3 className="font-serif text-xl font-bold text-[#78372B]">
                    Member Database
                  </h3>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[#39251D]/80">
                  Upload your updated Excel / CSV member list whenever you add or change members.
                  <br />
                  <strong className="text-[#971515]">Required columns:</strong> ID, NAME, ADDRESS - 1, ADDRESS - 2, VILLAGE/TOWN/CITY, POST OFFICE, DISTRICT/CITY, STATE, PIN CODE, COUNTRY, MOBILE - 1, MOBILE - 2.
                </p>

                <div className="mt-4">
                  <label className="block text-xs font-bold text-[#78372B] mb-1">
                    Choose Excel / CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-[#39251D] file:mr-4 file:rounded-lg file:border-0 file:bg-[#971515] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#78372B] cursor-pointer"
                  />
                </div>
              </div>

              {/* Box 2: Bulk Actions & Export */}
              <div className="rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 border-b border-[#C59A52]/20 pb-3">
                    <Download size={18} className="text-[#971515]" />
                    <h3 className="font-serif text-xl font-bold text-[#78372B]">
                      Bulk Add / Remove Members
                    </h3>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[#39251D]/80">
                    Add multiple members by uploading an Excel/CSV file, or remove multiple existing members by selecting them below. The rest of the member database and receipt functions remain unchanged.
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() =>
                      exportToCSV(
                        `CKF-Members-Database-${new Date().toISOString().slice(0, 10)}.csv`,
                        members
                      )
                    }
                    className="flex items-center gap-1.5 rounded-lg border border-[#C59A52] bg-[#FFF9ED] px-4 py-2 text-xs font-bold text-[#78372B] hover:bg-[#C59A52]/20"
                  >
                    <Download size={14} />
                    <span>Export Members CSV</span>
                  </button>

                  <button
                    onClick={handleSelectAllMembers}
                    className="flex items-center gap-1.5 rounded-lg border border-[#C59A52]/50 bg-white px-3 py-2 text-xs font-medium text-[#39251D] hover:bg-[#FFF9ED]"
                  >
                    <CheckSquare size={14} />
                    <span>{selectedMemberIds.length === members.length ? "Clear Selection" : "Select All"}</span>
                  </button>

                  {selectedMemberIds.length > 0 && (
                    <button
                      onClick={handleRemoveSelectedMembers}
                      className="flex items-center gap-1.5 rounded-lg bg-rose-700 px-4 py-2 text-xs font-bold text-white hover:bg-rose-800"
                    >
                      <Trash2 size={14} />
                      <span>Remove Selected ({selectedMemberIds.length})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Add New Member Manually Card */}
            <div className="rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm">
              <div className="border-b border-[#C59A52]/20 pb-3">
                <h3 className="font-serif text-xl font-bold text-[#78372B]">
                  Add New Member Manually
                </h3>
                <p className="text-xs text-[#39251D]/70">
                  Register a single member into the official Chintamoni Kunja Foundation directory.
                </p>
              </div>

              <form onSubmit={handleAddMember} className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#78372B]">Member ID</label>
                  <input
                    type="text"
                    value={newMember.id}
                    onChange={(e) => setNewMember({ ...newMember, id: e.target.value })}
                    placeholder="Auto-generated if blank"
                    className="mt-1 w-full rounded-lg border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-3 py-2 text-xs text-[#39251D] focus:border-[#971515] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#78372B]">Name *</label>
                  <input
                    type="text"
                    required
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Full name"
                    className="mt-1 w-full rounded-lg border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-3 py-2 text-xs text-[#39251D] focus:border-[#971515] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#78372B]">Address - 1</label>
                  <input
                    type="text"
                    value={newMember.address1}
                    onChange={(e) => setNewMember({ ...newMember, address1: e.target.value })}
                    placeholder="Street / Lane"
                    className="mt-1 w-full rounded-lg border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-3 py-2 text-xs text-[#39251D] focus:border-[#971515] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#78372B]">Address - 2</label>
                  <input
                    type="text"
                    value={newMember.address2}
                    onChange={(e) => setNewMember({ ...newMember, address2: e.target.value })}
                    placeholder="Landmark"
                    className="mt-1 w-full rounded-lg border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-3 py-2 text-xs text-[#39251D] focus:border-[#971515] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#78372B]">Village/Town/City</label>
                  <input
                    type="text"
                    value={newMember.city}
                    onChange={(e) => setNewMember({ ...newMember, city: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-3 py-2 text-xs text-[#39251D] focus:border-[#971515] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#78372B]">Post Office</label>
                  <input
                    type="text"
                    value={newMember.postOffice}
                    onChange={(e) => setNewMember({ ...newMember, postOffice: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-3 py-2 text-xs text-[#39251D] focus:border-[#971515] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#78372B]">District/City</label>
                  <input
                    type="text"
                    value={newMember.district}
                    onChange={(e) => setNewMember({ ...newMember, district: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-3 py-2 text-xs text-[#39251D] focus:border-[#971515] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#78372B]">State</label>
                  <input
                    type="text"
                    value={newMember.state}
                    onChange={(e) => setNewMember({ ...newMember, state: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-3 py-2 text-xs text-[#39251D] focus:border-[#971515] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#78372B]">PIN Code</label>
                  <input
                    type="text"
                    value={newMember.pincode}
                    onChange={(e) => setNewMember({ ...newMember, pincode: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-3 py-2 text-xs text-[#39251D] focus:border-[#971515] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#78372B]">Country</label>
                  <input
                    type="text"
                    value={newMember.country}
                    onChange={(e) => setNewMember({ ...newMember, country: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-3 py-2 text-xs text-[#39251D] focus:border-[#971515] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#78372B]">Mobile - 1 *</label>
                  <input
                    type="tel"
                    required
                    value={newMember.mobile1}
                    onChange={(e) => setNewMember({ ...newMember, mobile1: e.target.value })}
                    placeholder="Primary contact"
                    className="mt-1 w-full rounded-lg border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-3 py-2 text-xs text-[#39251D] focus:border-[#971515] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#78372B]">Mobile - 2</label>
                  <input
                    type="tel"
                    value={newMember.mobile2}
                    onChange={(e) => setNewMember({ ...newMember, mobile2: e.target.value })}
                    placeholder="Secondary contact"
                    className="mt-1 w-full rounded-lg border border-[#C59A52]/50 bg-[#FFF9ED]/30 px-3 py-2 text-xs text-[#39251D] focus:border-[#971515] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3 lg:col-span-4 pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-[#971515] px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#78372B]"
                  >
                    <Plus size={16} />
                    <span>Add Member</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Member Directory Table */}
            <div className="rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#C59A52]/30 pb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-serif text-xl font-bold text-[#78372B]">
                    Registered Members ({filteredMembers.length})
                  </h3>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Filter by name, ID, phone, city..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-[#C59A52]/40 bg-[#FFF9ED]/30 px-3.5 py-1.5 text-xs text-[#39251D] placeholder-[#39251D]/50 focus:border-[#971515] focus:outline-none"
                  />
                  <Search size={14} className="absolute right-3 top-2 text-[#C59A52]" />
                </div>
              </div>

              {/* Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs border border-[#C59A52]/20">
                  <thead className="bg-[#FFF9ED] text-[#78372B] uppercase text-[10px] tracking-wider border-b border-[#C59A52]/30">
                    <tr>
                      <th className="p-3 w-8">
                        <input
                          type="checkbox"
                          checked={selectedMemberIds.length === members.length && members.length > 0}
                          onChange={handleSelectAllMembers}
                          className="accent-[#971515]"
                        />
                      </th>
                      <th className="p-3">ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Address 1 & 2</th>
                      <th className="p-3">Town / City</th>
                      <th className="p-3">District</th>
                      <th className="p-3">State</th>
                      <th className="p-3">PIN Code</th>
                      <th className="p-3">Mobile 1</th>
                      <th className="p-3">Mobile 2</th>
                      <th className="p-3 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C59A52]/20">
                    {filteredMembers.map((m) => {
                      const isSelected = selectedMemberIds.includes(m.id);
                      return (
                        <tr
                          key={m.id}
                          className={`transition ${isSelected ? "bg-amber-50" : "hover:bg-[#FFF9ED]/40"}`}
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setSelectedMemberIds(selectedMemberIds.filter((id) => id !== m.id));
                                } else {
                                  setSelectedMemberIds([...selectedMemberIds, m.id]);
                                }
                              }}
                              className="accent-[#971515]"
                            />
                          </td>
                          <td className="p-3 font-bold text-[#971515]">{m.id}</td>
                          <td className="p-3 font-semibold text-[#39251D]">{m.name}</td>
                          <td className="p-3 text-[#39251D]/80">
                            {m.address1} {m.address2 ? `• ${m.address2}` : ""}
                          </td>
                          <td className="p-3">{m.city}</td>
                          <td className="p-3">{m.district}</td>
                          <td className="p-3">{m.state}</td>
                          <td className="p-3">{m.pincode}</td>
                          <td className="p-3 font-semibold text-emerald-800">{m.mobile1}</td>
                          <td className="p-3 text-[#39251D]/70">{m.mobile2 || "—"}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                handleSelectMemberForReceipt(m);
                                setActiveTab("receipt");
                              }}
                              className="rounded bg-[#971515]/10 px-2.5 py-1 text-[11px] font-bold text-[#971515] hover:bg-[#971515] hover:text-white transition"
                            >
                              New Receipt
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

