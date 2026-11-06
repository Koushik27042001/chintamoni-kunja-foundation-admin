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
  DollarSign,
  TrendingUp,
  UserCheck,
  Briefcase,
  Layers,
  Inbox,
  RefreshCw,
  Server,
  Wifi,
  WifiOff,
  LogOut,
  Lock,
  Key,
  Shield,
} from "lucide-react";
import {
  checkServerStatus,
  loginAdminAPI,
  logoutAdminAPI,
  getCurrentUser,
  getAuthToken,
  isTokenExpired,
  getMembersAPI,
  createMemberAPI,
  bulkCreateMembersAPI,
  bulkDeleteMembersAPI,
  getDonationsAPI,
  createDonationAPI,
  getAgentsAPI,
  settleAgentAPI,
  getEventsAPI,
  createEventAPI,
  deleteEventAPI,
  getBlogsAPI,
  createBlogAPI,
  deleteBlogAPI,
  getGalleryAPI,
  createGalleryAPI,
  deleteGalleryAPI,
  getContactsAPI,
  updateContactStatusAPI,
  INITIAL_MEMBERS,
  INITIAL_AGENTS,
  INITIAL_RECEIPTS,
  INITIAL_EVENTS,
  INITIAL_BLOGS,
  INITIAL_GALLERY,
} from "../services/api";

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
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, receipt, history, members, agents, events, blogs, gallery, inquiries
  const [serverState, setServerState] = useState({ online: false, database: 'checking' });
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  // Authentication & Session Expiry States
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAuthToken());
  const [sessionExpiryWarning, setSessionExpiryWarning] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Listen for session expiry custom events
  useEffect(() => {
    const handleAuthExpired = (e) => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setSessionExpiryWarning(
        e.detail?.message || "Your admin session has expired. Please log in again to continue."
      );
    };

    window.addEventListener("ckf_auth_expired", handleAuthExpired);
    return () => window.removeEventListener("ckf_auth_expired", handleAuthExpired);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");
    const result = await loginAdminAPI(loginEmail, loginPassword);
    setIsLoggingIn(false);
    if (result.success) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      setSessionExpiryWarning("");
      showAlert(`Welcome back, ${result.user.name || "Administrator"}!`);
    } else {
      setLoginError(result.message || "Invalid credentials.");
    }
  };

  const handleLogout = () => {
    logoutAdminAPI();
    setCurrentUser(null);
    setIsAuthenticated(false);
    showAlert("Logged out successfully.");
  };

  // Core Data States
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [receipts, setReceipts] = useState(INITIAL_RECEIPTS);
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [blogs, setBlogs] = useState(INITIAL_BLOGS);
  const [gallery, setGallery] = useState(INITIAL_GALLERY);
  const [contacts, setContacts] = useState([]);

  // Selections & filters
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyChannelFilter, setHistoryChannelFilter] = useState("All");

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
    email: "",
    category: "Life Member",
  });

  // Receipt Generation Form State
  const [receiptSearch, setReceiptSearch] = useState("");
  const [selectedMemberForReceipt, setSelectedMemberForReceipt] = useState(null);
  const [receiptForm, setReceiptForm] = useState({
    receiptNo: `CKF-${Date.now().toString().slice(-6)}`,
    amount: "1001",
    date: new Date().toLocaleDateString("en-GB"),
    paymentMode: "Cash",
    channel: "Walk-in to Foundation", // Segmentation: Walk-in vs Field Collection vs Online
    purpose: "NGO Fund",
    collectedBy: "Krishnendu Chakraborty",
    agentId: "",
  });

  // Current Generated Receipt to Preview / Print
  const [currentReceipt, setCurrentReceipt] = useState(null);

  // New Agent Form
  const [newAgent, setNewAgent] = useState({
    agentCode: "",
    name: "",
    phone: "",
    assignedArea: "Nabadwip & Nadia District",
  });

  // New Event Form
  const [newEvent, setNewEvent] = useState({
    title: "",
    bengali: "",
    season: "",
    time: "",
    category: "Major Utsav",
    desc: "",
    seva: "Anna Daan Seva",
    image: "/assets/Krishna’s Golden Riverside Devotion.png",
    featured: true,
  });

  // New Blog Form
  const [newBlog, setNewBlog] = useState({
    title: "",
    bengali: "",
    category: "Katha & Philosophy",
    readTime: "5 min read",
    excerpt: "",
    content: "",
    image: "/assets/Opulent Gaura-Nitai and Madan Mohan Altar.png",
    status: "published",
  });

  // New Gallery Item Form
  const [newGallery, setNewGallery] = useState({
    title: "",
    category: "Temple & Altar",
    image: "/assets/Opulent Gaura-Nitai and Madan Mohan Altar.png",
    caption: "",
  });

  // Load all initial data from API or localStorage
  useEffect(() => {
    async function initData() {
      setLoading(true);
      const srv = await checkServerStatus();
      setServerState(srv);

      const [m, r, a, ev, bl, gal, cnt] = await Promise.all([
        getMembersAPI(),
        getDonationsAPI(),
        getAgentsAPI(),
        getEventsAPI(),
        getBlogsAPI(),
        getGalleryAPI(),
        getContactsAPI(),
      ]);

      if (m && m.length) setMembers(m);
      if (r && r.length) setReceipts(r);
      if (a && a.length) setAgents(a);
      if (ev && ev.length) setEvents(ev);
      if (bl && bl.length) setBlogs(bl);
      if (gal && gal.length) setGallery(gal);
      if (cnt && cnt.length) setContacts(cnt);
      setLoading(false);
    }
    initData();
  }, []);

  const showAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(""), 4500);
  };

  /* ---------------------------------------------------------------
     Receipt Generation Handlers
  --------------------------------------------------------------- */
  const handleSelectMemberForReceipt = (m) => {
    setSelectedMemberForReceipt(m);
    setReceiptSearch(`${m.name} (${m.id})`);
  };

  const handleGenerateReceipt = async (e) => {
    e.preventDefault();
    if (!selectedMemberForReceipt) {
      alert("Please search and select a registered Member first.");
      return;
    }
    if (!receiptForm.amount || parseFloat(receiptForm.amount) <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }

    const assignedAgentObj = agents.find((ag) => ag.agentCode === receiptForm.agentId);

    const generated = {
      receiptNo: receiptForm.receiptNo || `CKF-${Date.now().toString().slice(-6)}`,
      memberId: selectedMemberForReceipt.id,
      donorName: selectedMemberForReceipt.name,
      mobile: selectedMemberForReceipt.mobile1,
      email: selectedMemberForReceipt.email || "",
      address: `${selectedMemberForReceipt.address1}, ${selectedMemberForReceipt.city}`,
      amount: parseFloat(receiptForm.amount),
      amountInWords: numberToWords(receiptForm.amount),
      channel: receiptForm.channel,
      paymentMode: receiptForm.paymentMode,
      purpose: receiptForm.purpose,
      collectedBy:
        receiptForm.channel === "Field Collection" && assignedAgentObj
          ? `${assignedAgentObj.name} (${assignedAgentObj.agentCode})`
          : receiptForm.collectedBy,
      agentId: receiptForm.channel === "Field Collection" ? receiptForm.agentId : "",
      agentName: receiptForm.channel === "Field Collection" && assignedAgentObj ? assignedAgentObj.name : "",
      settlementStatus:
        receiptForm.channel === "Field Collection" ? "Pending Office Deposit" : "Settled",
      status: "Completed",
      date: receiptForm.date || new Date().toLocaleDateString("en-GB"),
      member: selectedMemberForReceipt,
      createdAt: new Date().toISOString(),
    };

    setCurrentReceipt(generated);
    setReceipts([generated, ...receipts]);
    await createDonationAPI(generated);

    // If field collection, update agent's pending settlement locally
    if (receiptForm.channel === "Field Collection" && assignedAgentObj) {
      setAgents(
        agents.map((ag) =>
          ag.agentCode === receiptForm.agentId
            ? {
                ...ag,
                totalCollected: ag.totalCollected + parseFloat(receiptForm.amount),
                pendingSettlement: ag.pendingSettlement + parseFloat(receiptForm.amount),
              }
            : ag
        )
      );
    }

    // Refresh receipt form ID
    setReceiptForm((prev) => ({
      ...prev,
      receiptNo: `CKF-${Date.now().toString().slice(-6)}`,
    }));

    showAlert(`Official Receipt ${generated.receiptNo} generated & recorded!`);
  };

  const handlePrint = () => {
    window.print();
  };

  /* ---------------------------------------------------------------
     Member Database Handlers
  --------------------------------------------------------------- */
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.mobile1) {
      alert("Please provide at least Name and Mobile-1.");
      return;
    }
    const memberId = newMember.id.trim() || `CKF-M-${String(members.length + 1).padStart(3, "0")}`;
    const entry = { ...newMember, id: memberId, totalDonations: 0, status: "Active" };

    const saved = await createMemberAPI(entry);
    setMembers([saved || entry, ...members]);
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
      email: "",
      category: "Life Member",
    });
    showAlert(`Member ${entry.name} (${entry.id}) added successfully.`);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          alert("CSV file seems empty or missing header row.");
          return;
        }

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
              email: values[12] || "",
              category: "Life Member",
              status: "Active",
            });
          }
        }

        await bulkCreateMembersAPI(parsedMembers);
        setMembers([...parsedMembers, ...members]);
        showAlert(`Successfully imported ${parsedMembers.length} members from file!`);
      } catch (err) {
        alert("Error parsing file. Please ensure standard comma-separated format.");
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

  const handleRemoveSelectedMembers = async () => {
    if (!selectedMemberIds.length) return;
    if (confirm(`Remove ${selectedMemberIds.length} selected member(s)?`)) {
      await bulkDeleteMembersAPI(selectedMemberIds);
      setMembers(members.filter((m) => !selectedMemberIds.includes(m.id)));
      setSelectedMemberIds([]);
      showAlert("Selected members removed.");
    }
  };

  /* ---------------------------------------------------------------
     Agent Management Handlers
  --------------------------------------------------------------- */
  const handleAddAgent = (e) => {
    e.preventDefault();
    if (!newAgent.name || !newAgent.phone) {
      alert("Name and phone number are required.");
      return;
    }
    const code = newAgent.agentCode.trim() || `AGT-${String(agents.length + 1).padStart(3, "0")}`;
    const entry = {
      ...newAgent,
      agentCode: code,
      totalCollected: 0,
      pendingSettlement: 0,
      active: true,
    };
    setAgents([entry, ...agents]);
    setNewAgent({ agentCode: "", name: "", phone: "", assignedArea: "Nabadwip & Nadia District" });
    showAlert(`Agent ${entry.name} (${entry.agentCode}) registered.`);
  };

  const handleSettleAgent = async (ag) => {
    if (confirm(`Settle all pending collections (₹${ag.pendingSettlement.toLocaleString('en-IN')}) for ${ag.name} with Central Office?`)) {
      await settleAgentAPI(ag.agentCode);
      setAgents(
        agents.map((item) =>
          item.agentCode === ag.agentCode ? { ...item, pendingSettlement: 0 } : item
        )
      );
      setReceipts(
        receipts.map((r) =>
          r.agentId === ag.agentCode ? { ...r, settlementStatus: "Settled" } : r
        )
      );
      showAlert(`Office deposit settled for ${ag.name}.`);
    }
  };

  /* ---------------------------------------------------------------
     CMS: Events Handlers
  --------------------------------------------------------------- */
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.desc) {
      alert("Please provide title and description.");
      return;
    }
    const created = await createEventAPI(newEvent);
    setEvents([created, ...events]);
    setNewEvent({
      title: "",
      bengali: "",
      season: "",
      time: "",
      category: "Major Utsav",
      desc: "",
      seva: "Anna Daan Seva",
      image: "/assets/Krishna’s Golden Riverside Devotion.png",
      featured: true,
    });
    showAlert(`Event "${newEvent.title}" published!`);
  };

  const handleDeleteEvent = async (id) => {
    if (confirm("Delete this event?")) {
      await deleteEventAPI(id);
      setEvents(events.filter((ev) => ev._id !== id));
      showAlert("Event removed.");
    }
  };

  /* ---------------------------------------------------------------
     CMS: Blogs Handlers
  --------------------------------------------------------------- */
  const handleAddBlog = async (e) => {
    e.preventDefault();
    if (!newBlog.title || !newBlog.content) {
      alert("Title and content are required.");
      return;
    }
    const created = await createBlogAPI(newBlog);
    setBlogs([created, ...blogs]);
    setNewBlog({
      title: "",
      bengali: "",
      category: "Katha & Philosophy",
      readTime: "5 min read",
      excerpt: "",
      content: "",
      image: "/assets/Opulent Gaura-Nitai and Madan Mohan Altar.png",
      status: "published",
    });
    showAlert(`Article "${newBlog.title}" published!`);
  };

  const handleDeleteBlog = async (id) => {
    if (confirm("Delete this article?")) {
      await deleteBlogAPI(id);
      setBlogs(blogs.filter((b) => b._id !== id));
      showAlert("Article removed.");
    }
  };

  /* ---------------------------------------------------------------
     CMS: Gallery Handlers
  --------------------------------------------------------------- */
  const handleAddGallery = async (e) => {
    e.preventDefault();
    if (!newGallery.title || !newGallery.image) {
      alert("Title and image path required.");
      return;
    }
    const created = await createGalleryAPI(newGallery);
    setGallery([created, ...gallery]);
    setNewGallery({
      title: "",
      category: "Temple & Altar",
      image: "/assets/Opulent Gaura-Nitai and Madan Mohan Altar.png",
      caption: "",
    });
    showAlert("Image added to gallery!");
  };

  const handleDeleteGallery = async (id) => {
    if (confirm("Remove image from gallery?")) {
      await deleteGalleryAPI(id);
      setGallery(gallery.filter((g) => g._id !== id));
      showAlert("Image removed.");
    }
  };

  /* ---------------------------------------------------------------
     Inquiries Handler
  --------------------------------------------------------------- */
  const handleUpdateContactStatus = async (id, status) => {
    await updateContactStatusAPI(id, status);
    setContacts(contacts.map((c) => (c._id === id ? { ...c, status } : c)));
    showAlert(`Inquiry marked as ${status}`);
  };

  /* ---------------------------------------------------------------
     Analytics Calculations
  --------------------------------------------------------------- */
  const totalDonationAmount = receipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const onlineDonationAmount = receipts
    .filter((r) => r.channel === "Online Donation")
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const walkInDonationAmount = receipts
    .filter((r) => r.channel === "Walk-in to Foundation")
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const fieldDonationAmount = receipts
    .filter((r) => r.channel === "Field Collection")
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const pendingFieldSettlement = receipts
    .filter((r) => r.channel === "Field Collection" && r.settlementStatus === "Pending Office Deposit")
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  /* ---------------------------------------------------------------
     Filtered Lists
  --------------------------------------------------------------- */
  const filteredMembers = members.filter((m) => {
    const q = memberSearchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      (m.mobile1 && m.mobile1.includes(q)) ||
      (m.city && m.city.toLowerCase().includes(q))
    );
  });

  const memberSearchResults =
    receiptSearch.trim().length > 0
      ? members.filter((m) => {
          const q = receiptSearch.toLowerCase();
          return (
            m.name.toLowerCase().includes(q) ||
            m.id.toLowerCase().includes(q) ||
            (m.mobile1 && m.mobile1.includes(q))
          );
        })
      : [];

  const filteredReceipts = receipts.filter((r) => {
    const matchChannel = historyChannelFilter === "All" || r.channel === historyChannelFilter;
    const q = historySearchQuery.toLowerCase();
    const matchQuery =
      !q ||
      r.receiptNo.toLowerCase().includes(q) ||
      r.donorName.toLowerCase().includes(q) ||
      (r.mobile && r.mobile.includes(q)) ||
      (r.collectedBy && r.collectedBy.toLowerCase().includes(q));
    return matchChannel && matchQuery;
  });

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
              className="flex items-center gap-2 rounded-lg border border-[#C59A52]/30 px-3 py-1.5 text-xs font-semibold text-[#78372B] hover:bg-[#FFF9ED] transition"
            >
              <ArrowLeft size={14} />
              <span>Back to Website</span>
            </Link>
            <div className="h-4 w-px bg-[#C59A52]/30" />
            <h1 className="font-serif text-xl font-bold text-[#971515]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Sri Sri Chintamoni Kunja Foundation — Central Seva Admin Portal
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {serverState.online ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                <Wifi size={12} className="text-emerald-600" />
                <span>API: Connected ({serverState.database})</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-300">
                <WifiOff size={12} className="text-amber-600" />
                <span>Offline Resilient Mode</span>
              </span>
            )}
            {isAuthenticated && (
              <div className="flex items-center gap-2">
                <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#FFF9ED] px-3 py-1 text-xs font-bold text-[#78372B] border border-[#C59A52]/40">
                  <Shield size={12} className="text-[#971515]" />
                  <span>{currentUser?.name || "Admin"}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-800 hover:bg-rose-100 transition"
                  title="Sign out"
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </button>
              </div>
            )}
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
      {!isAuthenticated ? (
        <div className="mx-auto max-w-md py-14 px-4">
          <div className="rounded-2xl border-2 border-[#C59A52]/40 bg-white p-8 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF9ED] border border-[#C59A52]/40 text-[#971515] shadow-inner">
                <Lock size={26} />
              </div>
              <h2 className="mt-4 font-serif text-2xl font-bold text-[#78372B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Admin Authentication
              </h2>
              <p className="mt-1 text-xs text-[#39251D]/70">
                Sri Sri Chintamoni Kunja Foundation • Central Seva Portal
              </p>
            </div>

            {/* Session Expiry Notice */}
            {sessionExpiryWarning && (
              <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Session Notice: </span>
                  <span>{sessionExpiryWarning}</span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              {loginError && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78372B]">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@chintamonikunja.org"
                  className="mt-1 w-full rounded-xl border border-[#C59A52]/40 bg-white p-2.5 text-xs font-semibold focus:border-[#971515] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78372B]">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-xl border border-[#C59A52]/40 bg-white p-2.5 text-xs font-semibold focus:border-[#971515] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full rounded-xl bg-[#971515] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#971515]/25 hover:bg-[#78372B] transition disabled:opacity-50"
              >
                {isLoggingIn ? "Verifying Credentials..." : "Access Seva Admin Portal"}
              </button>
            </form>

            <div className="mt-6 border-t border-[#C59A52]/20 pt-4 text-center">
              <div className="text-xs text-[#39251D]/75 font-medium">
                Authorized seva desk personnel only. Credentials are authenticated securely against backend environment configurations.
              </div>
              <div className="mt-2 text-[10px] text-[#39251D]/60">
                JWT Session Lifespan: 7 Days • Auto-refreshed on active collection work
              </div>
            </div>
          </div>
        </div>
      ) : (
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Navigation Tabs */}
        <div className="no-print mb-8 flex flex-wrap gap-2 border-b border-[#C59A52]/30 pb-4">
          {[
            { id: "dashboard", label: "Dashboard & Analytics", icon: LayoutDashboard },
            { id: "receipt", label: "New Fund Receipt", icon: Receipt },
            { id: "history", label: "Office Copy / Receipts History", icon: FileText },
            { id: "members", label: "Members Database", icon: Users },
            { id: "agents", label: "Field Collectors / Agents", icon: Briefcase },
            { id: "events", label: "Events & Utsavs CMS", icon: Calendar },
            { id: "blogs", label: "Blogs & Katha CMS", icon: BookOpenIcon },
            { id: "gallery", label: "Gallery Manager", icon: ImageIcon },
            { id: "inquiries", label: `Devotee Inquiries (${contacts.length})`, icon: Inbox },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                  active
                    ? "bg-[#971515] text-white shadow-md shadow-[#971515]/25"
                    : "border border-[#C59A52]/40 bg-white text-[#78372B] hover:bg-[#FFF9ED]"
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ==============================================================
            TAB 0: DASHBOARD & ANALYTICS
        ============================================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* KPI Cards Row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Members */}
              <div className="rounded-2xl border border-[#C59A52]/30 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#78372B]/70">Registered Members</span>
                  <div className="rounded-xl bg-[#FFF9ED] p-2.5 text-[#C59A52] border border-[#C59A52]/20">
                    <Users size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-bold text-[#78372B]">{members.length}</span>
                  <span className="text-xs text-emerald-600 font-semibold">100% Active</span>
                </div>
                <p className="mt-1 text-xs text-[#39251D]/60">12-column certified directory</p>
              </div>

              {/* Total Collections */}
              <div className="rounded-2xl border border-[#C59A52]/30 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#78372B]/70">Total Seva Collections</span>
                  <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 border border-emerald-200">
                    <TrendingUp size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-bold text-[#971515]">₹{totalDonationAmount.toLocaleString("en-IN")}</span>
                </div>
                <p className="mt-1 text-xs text-[#39251D]/60">{receipts.length} Official Receipts Issued</p>
              </div>

              {/* Walk-in vs Field vs Online */}
              <div className="rounded-2xl border border-[#C59A52]/30 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#78372B]/70">Walk-in vs Field</span>
                  <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700 border border-amber-200">
                    <Building2 size={20} />
                  </div>
                </div>
                <div className="mt-4 space-y-1 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className="text-[#39251D]/70">Office Walk-in:</span>
                    <span className="font-bold text-[#78372B]">₹{walkInDonationAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#39251D]/70">Field Doorstep:</span>
                    <span className="font-bold text-[#C59A52]">₹{fieldDonationAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#39251D]/70">Online Portal:</span>
                    <span className="font-bold text-emerald-700">₹{onlineDonationAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Pending Agent Settlement */}
              <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-800">Pending Field Deposit</span>
                  <div className="rounded-xl bg-rose-100 p-2.5 text-rose-700 border border-rose-300">
                    <Briefcase size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-bold text-rose-900">₹{pendingFieldSettlement.toLocaleString("en-IN")}</span>
                </div>
                <button
                  onClick={() => setActiveTab("agents")}
                  className="mt-2 text-xs font-bold text-[#971515] underline hover:text-[#78372B]"
                >
                  Review & Settle with Office →
                </button>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="rounded-2xl border border-[#C59A52]/30 bg-[#FFF9ED]/60 p-6">
              <h3 className="font-serif text-lg font-bold text-[#78372B]">Quick Seva Actions</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab("receipt")}
                  className="flex items-center gap-2 rounded-xl bg-[#971515] px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-[#78372B] transition"
                >
                  <Plus size={15} />
                  <span>Issue New Receipt (Dual Print)</span>
                </button>
                <button
                  onClick={() => setActiveTab("members")}
                  className="flex items-center gap-2 rounded-xl border border-[#C59A52]/40 bg-white px-4 py-2.5 text-xs font-bold text-[#78372B] hover:bg-white/80 transition"
                >
                  <Users size={15} />
                  <span>Add / Import Member</span>
                </button>
                <button
                  onClick={() => setActiveTab("events")}
                  className="flex items-center gap-2 rounded-xl border border-[#C59A52]/40 bg-white px-4 py-2.5 text-xs font-bold text-[#78372B] hover:bg-white/80 transition"
                >
                  <Calendar size={15} />
                  <span>Post Upcoming Festival</span>
                </button>
                <button
                  onClick={() => setActiveTab("blogs")}
                  className="flex items-center gap-2 rounded-xl border border-[#C59A52]/40 bg-white px-4 py-2.5 text-xs font-bold text-[#78372B] hover:bg-white/80 transition"
                >
                  <BookOpenIcon size={15} />
                  <span>Publish Spiritual Katha</span>
                </button>
              </div>
            </div>

            {/* Recent Collections Table & Purpose Breakdown */}
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="rounded-2xl border border-[#C59A52]/30 bg-white p-6 shadow-sm lg:col-span-8">
                <div className="flex items-center justify-between border-b border-[#C59A52]/20 pb-3">
                  <h3 className="font-serif text-lg font-bold text-[#78372B]">Recent Official Receipts</h3>
                  <button onClick={() => setActiveTab("history")} className="text-xs font-bold text-[#971515] hover:underline">
                    View All ({receipts.length}) →
                  </button>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFF9ED] text-[#78372B] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="p-3">Receipt No</th>
                        <th className="p-3">Donor Name</th>
                        <th className="p-3">Channel</th>
                        <th className="p-3">Mode</th>
                        <th className="p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C59A52]/20">
                      {receipts.slice(0, 5).map((r) => (
                        <tr key={r.receiptNo} className="hover:bg-[#FFF9ED]/30">
                          <td className="p-3 font-mono font-bold text-[#971515]">{r.receiptNo}</td>
                          <td className="p-3 font-semibold">{r.donorName}</td>
                          <td className="p-3">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              r.channel === "Online Donation"
                                ? "bg-emerald-100 text-emerald-800"
                                : r.channel === "Field Collection"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {r.channel}
                            </span>
                          </td>
                          <td className="p-3 text-[#39251D]/70">{r.paymentMode}</td>
                          <td className="p-3 text-right font-bold text-[#78372B]">₹{Number(r.amount).toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Purpose Distribution */}
              <div className="rounded-2xl border border-[#C59A52]/30 bg-white p-6 shadow-sm lg:col-span-4">
                <h3 className="font-serif text-lg font-bold text-[#78372B] border-b border-[#C59A52]/20 pb-3">Seva Distribution</h3>
                <div className="mt-4 space-y-3">
                  {[
                    { label: "Daily Anna Daan Seva", pct: "38%", color: "bg-[#971515]" },
                    { label: "Temple Renovation Seva", pct: "26%", color: "bg-[#C59A52]" },
                    { label: "Festivals & Utsavs Seva", pct: "20%", color: "bg-emerald-700" },
                    { label: "Vedic Education & Go Seva", pct: "16%", color: "bg-amber-600" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#39251D]">{item.label}</span>
                        <span className="text-[#78372B] font-bold">{item.pct}</span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-[#EDE0C9]/40 overflow-hidden">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: item.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 1: NEW FUND RECEIPT GENERATOR (Dual Donor & Office Copies)
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
                    Search registered member or select offline channel (Walk-in vs Field Collector).
                  </p>
                </div>

                <form onSubmit={handleGenerateReceipt} className="mt-5 space-y-4">
                  {/* Search Member */}
                  <div className="relative">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#78372B]">
                      Search Member <span className="text-[#971515]">*</span>
                    </label>
                    <div className="relative mt-1">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C59A52]" />
                      <input
                        type="text"
                        value={receiptSearch}
                        onChange={(e) => {
                          setReceiptSearch(e.target.value);
                          if (!e.target.value) setSelectedMemberForReceipt(null);
                        }}
                        placeholder="Type name, ID (e.g. CKF-M-001) or mobile..."
                        className="w-full rounded-xl border border-[#C59A52]/40 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-[#971515] focus:outline-none"
                      />
                    </div>

                    {/* Member Dropdown Results */}
                    {memberSearchResults.length > 0 && !selectedMemberForReceipt && (
                      <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-[#C59A52]/30 bg-white shadow-xl">
                        {memberSearchResults.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => handleSelectMemberForReceipt(m)}
                            className="cursor-pointer border-b border-[#EDE0C9]/40 p-2.5 text-xs hover:bg-[#FFF9ED] transition"
                          >
                            <div className="flex items-center justify-between font-bold text-[#78372B]">
                              <span>{m.name}</span>
                              <span className="rounded bg-[#EDE0C9]/50 px-1.5 py-0.5 font-mono text-[10px] text-[#39251D]">
                                {m.id}
                              </span>
                            </div>
                            <div className="mt-0.5 text-[11px] text-[#39251D]/70">
                              Ph: {m.mobile1} • {m.city}, {m.district}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Member Details Card */}
                  {selectedMemberForReceipt && (
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-3.5 text-xs">
                      <div className="flex items-center justify-between font-bold text-emerald-950">
                        <span className="flex items-center gap-1.5">
                          <Check size={14} className="text-emerald-600" />
                          <span>{selectedMemberForReceipt.name}</span>
                        </span>
                        <span className="font-mono text-[11px] text-emerald-800">
                          {selectedMemberForReceipt.id}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-emerald-800">
                        {selectedMemberForReceipt.address1}, {selectedMemberForReceipt.city} – {selectedMemberForReceipt.pincode}
                      </p>
                      <p className="mt-0.5 text-[11px] text-emerald-700">
                        Mobile: {selectedMemberForReceipt.mobile1}
                      </p>
                    </div>
                  )}

                  {/* Receipt No & Date */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">Receipt No.</label>
                      <input
                        type="text"
                        value={receiptForm.receiptNo}
                        onChange={(e) => setReceiptForm({ ...receiptForm, receiptNo: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 bg-white p-2.5 font-mono text-xs font-bold text-[#971515] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">Date</label>
                      <input
                        type="text"
                        value={receiptForm.date}
                        onChange={(e) => setReceiptForm({ ...receiptForm, date: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 bg-white p-2.5 text-xs font-medium focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Amount (INR) with Indian Number to Words Preview */}
                  <div>
                    <label className="block text-xs font-bold text-[#78372B]">
                      Donation Amount (INR ₹) <span className="text-[#971515]">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={receiptForm.amount}
                      onChange={(e) => setReceiptForm({ ...receiptForm, amount: e.target.value })}
                      placeholder="e.g. 5001"
                      className="mt-1 w-full rounded-xl border border-[#C59A52]/40 bg-white p-2.5 text-base font-bold text-[#78372B] focus:border-[#971515] focus:outline-none"
                    />
                    <div className="mt-1.5 rounded-lg bg-[#FFF9ED] p-2 text-xs italic text-[#78372B]">
                      Words: <span className="font-semibold">{numberToWords(receiptForm.amount)}</span>
                    </div>
                  </div>

                  {/* Collection Channel Segmentation: Walk-in vs Field Collector */}
                  <div>
                    <label className="block text-xs font-bold text-[#78372B]">
                      Collection Channel / Segmentation <span className="text-[#971515]">*</span>
                    </label>
                    <select
                      value={receiptForm.channel}
                      onChange={(e) => setReceiptForm({ ...receiptForm, channel: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#C59A52]/40 bg-white p-2.5 text-xs font-semibold text-[#78372B] focus:outline-none"
                    >
                      <option value="Walk-in to Foundation">Mode A: Person comes to Foundation / Office (Nabadwip)</option>
                      <option value="Field Collection">Mode B: Field / Doorstep collection by representative</option>
                      <option value="Online Donation">Mode C: Online / Digital Seva Portal</option>
                    </select>
                  </div>

                  {/* Field Collector Selection (Conditional if Field Collection) */}
                  {receiptForm.channel === "Field Collection" && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50/60 p-3">
                      <label className="block text-xs font-bold text-amber-900">
                        Select Field Representative / Agent <span className="text-[#971515]">*</span>
                      </label>
                      <select
                        value={receiptForm.agentId}
                        onChange={(e) => setReceiptForm({ ...receiptForm, agentId: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-amber-300 bg-white p-2 text-xs font-semibold text-amber-950 focus:outline-none"
                      >
                        <option value="">-- Choose Assigned Agent --</option>
                        {agents.map((ag) => (
                          <option key={ag.agentCode} value={ag.agentCode}>
                            {ag.name} ({ag.agentCode}) - {ag.assignedArea}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-[11px] text-amber-800">
                        Agent will hold this receipt batch until settled with central office.
                      </p>
                    </div>
                  )}

                  {/* Payment Mode & Purpose */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">Payment Mode</label>
                      <select
                        value={receiptForm.paymentMode}
                        onChange={(e) => setReceiptForm({ ...receiptForm, paymentMode: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 bg-white p-2.5 text-xs font-medium focus:outline-none"
                      >
                        <option>Cash</option>
                        <option>UPI</option>
                        <option>Bank Transfer / NEFT</option>
                        <option>Cheque</option>
                        <option>Card</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">Seva Purpose</label>
                      <select
                        value={receiptForm.purpose}
                        onChange={(e) => setReceiptForm({ ...receiptForm, purpose: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 bg-white p-2.5 text-xs font-medium focus:outline-none"
                      >
                        <option>NGO Fund</option>
                        <option>Daily Anna Daan Seva</option>
                        <option>Temple Renovation & Maintenance</option>
                        <option>Vedic Education & Chhatra Seva</option>
                        <option>Go Seva (Cow Protection)</option>
                        <option>Festivals & Utsavs Seva</option>
                        <option>Sadhu & Vaishnava Seva</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-[#971515] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#971515]/20 hover:bg-[#78372B] transition"
                    >
                      Generate Official Dual Receipt
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right 7 Cols: Printable Dual Receipt Preview */}
            <div className="lg:col-span-7">
              {currentReceipt ? (
                <div className="space-y-4">
                  {/* Action Bar for Print */}
                  <div className="no-print flex items-center justify-between rounded-xl border border-[#C59A52]/30 bg-[#FFF9ED] p-4">
                    <div>
                      <h4 className="font-bold text-[#78372B]">Dual Receipt Ready for Printing</h4>
                      <p className="text-xs text-[#39251D]/70">
                        Contains Donor Copy (top) and Office Copy (bottom) with perforated separator line.
                      </p>
                    </div>
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 rounded-xl bg-[#971515] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#78372B] transition"
                    >
                      <Printer size={16} />
                      <span>Print Dual Receipt</span>
                    </button>
                  </div>

                  {/* PRINT AREA (CONTAINING BOTH DONOR COPY & OFFICE RECORD COPY) */}
                  <div id="print-area" className="rounded-2xl border-2 border-[#C59A52]/40 bg-white p-6 shadow-md text-[#39251D]">
                    {/* -------------------- 1. DONOR COPY (TOP) -------------------- */}
                    <div className="border border-[#C59A52]/50 p-5 rounded-xl bg-[#FFF9ED]/20">
                      <div className="flex items-start justify-between border-b border-[#C59A52]/30 pb-3">
                        <div>
                          <span className="rounded bg-[#971515] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                            Official Donor Copy
                          </span>
                          <h3 className="mt-1 font-serif text-xl font-bold text-[#971515]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            SRI SRI CHINTAMONI KUNJA FOUNDATION
                          </h3>
                          <p className="text-[11px] text-[#39251D]/80">
                            Registered Under Companies Act 2013 (Section 8) • NITI Aayog DARPAN ID: WB/2025/0513262
                          </p>
                          <p className="text-[10px] text-[#39251D]/70">
                            Bowbazar Road, P.O. Nabadwip, Nadia, West Bengal – 741302 • Helpline: 947-490-5910
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-xs font-bold text-[#971515]">
                            Receipt: {currentReceipt.receiptNo}
                          </div>
                          <div className="text-[11px] text-[#39251D]/70">
                            Date: {currentReceipt.date}
                          </div>
                        </div>
                      </div>

                      {/* Donor Particulars */}
                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="font-bold text-[#78372B]">Received with thanks from:</span>
                          <div className="font-bold text-sm text-[#39251D] mt-0.5">
                            {currentReceipt.donorName} ({currentReceipt.memberId})
                          </div>
                          <div className="text-[11px] text-[#39251D]/80 mt-0.5">
                            Address: {currentReceipt.address}
                          </div>
                          <div className="text-[11px] text-[#39251D]/80">
                            Mobile: {currentReceipt.mobile}
                          </div>
                        </div>
                        <div className="rounded-lg border border-[#C59A52]/30 bg-white p-3">
                          <div className="flex justify-between">
                            <span className="text-[#39251D]/70">Amount Received:</span>
                            <span className="font-bold text-base text-[#971515]">
                              ₹{Number(currentReceipt.amount).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="mt-1 text-[11px] text-[#39251D]">
                            <span className="font-bold">In Words: </span>
                            <span className="italic">{currentReceipt.amountInWords}</span>
                          </div>
                          <div className="mt-2 flex justify-between text-[11px] text-[#39251D]/80 border-t border-[#EDE0C9] pt-1">
                            <span>Mode: {currentReceipt.paymentMode}</span>
                            <span>Channel: {currentReceipt.channel}</span>
                          </div>
                        </div>
                      </div>

                      {/* Purpose & Footer */}
                      <div className="mt-3 flex items-end justify-between border-t border-[#C59A52]/20 pt-3 text-xs">
                        <div>
                          <span className="font-bold text-[#78372B]">Seva Purpose: </span>
                          <span className="font-semibold text-[#971515]">{currentReceipt.purpose}</span>
                          <p className="mt-1 text-[9px] text-[#39251D]/60 max-w-sm">
                            * Donations are gratefully utilized towards foundational seva, daily Anna Daan, and temple upkeep.
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="font-serif italic text-xs text-[#78372B] mb-1">
                            {currentReceipt.collectedBy}
                          </div>
                          <div className="h-0.5 w-28 bg-[#C59A52]/40 mx-auto" />
                          <span className="text-[10px] text-[#39251D]/70 font-bold">Authorized Signatory</span>
                        </div>
                      </div>
                    </div>

                    {/* -------------------- PERFORATED SEPARATOR LINE -------------------- */}
                    <div className="my-5 relative flex items-center justify-center">
                      <div className="w-full border-t-2 border-dashed border-[#C59A52]/60" />
                      <span className="absolute bg-white px-3 font-mono text-[10px] uppercase font-bold text-[#78372B] tracking-wider border border-[#C59A52]/40 rounded-full">
                        ✂ TEAR HERE — OFFICE COPY BELOW
                      </span>
                    </div>

                    {/* -------------------- 2. OFFICE RECORD COPY (BOTTOM) -------------------- */}
                    <div className="border border-[#C59A52]/50 p-5 rounded-xl bg-amber-50/20">
                      <div className="flex items-start justify-between border-b border-[#C59A52]/30 pb-3">
                        <div>
                          <span className="rounded bg-[#78372B] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                            Central Office Collection Record
                          </span>
                          <h3 className="mt-1 font-serif text-lg font-bold text-[#78372B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            SRI SRI CHINTAMONI KUNJA FOUNDATION — OFFICE COPY
                          </h3>
                          <p className="text-[10px] text-[#39251D]/70">
                            Nabadwip Dham Office • Internal Audit & Collection Ledger
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-xs font-bold text-[#971515]">
                            Receipt: {currentReceipt.receiptNo}
                          </div>
                          <div className="text-[11px] text-[#39251D]/70">
                            Date: {currentReceipt.date}
                          </div>
                        </div>
                      </div>

                      {/* Office Details */}
                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="font-bold text-[#78372B]">Donor Particulars:</span>
                          <div className="font-bold text-[#39251D] mt-0.5">
                            {currentReceipt.donorName} ({currentReceipt.memberId})
                          </div>
                          <div className="text-[11px] text-[#39251D]/80">
                            Mobile: {currentReceipt.mobile} • {currentReceipt.address}
                          </div>
                          <div className="mt-1 text-[11px] text-[#78372B]">
                            <span className="font-bold">Channel: </span>
                            <span className="font-semibold">{currentReceipt.channel}</span>
                          </div>
                        </div>
                        <div className="rounded-lg border border-[#C59A52]/30 bg-white p-3">
                          <div className="flex justify-between">
                            <span className="text-[#39251D]/70">Collected Amount:</span>
                            <span className="font-bold text-base text-[#78372B]">
                              ₹{Number(currentReceipt.amount).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="mt-1 text-[10px] italic text-[#39251D]">
                            {currentReceipt.amountInWords}
                          </div>
                          <div className="mt-2 flex justify-between text-[11px] text-[#39251D]/80 border-t border-[#EDE0C9] pt-1">
                            <span>Payment: {currentReceipt.paymentMode}</span>
                            <span>Status: {currentReceipt.settlementStatus || "Settled"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Collector & Office Signatures */}
                      <div className="mt-3 flex items-end justify-between border-t border-[#C59A52]/20 pt-3 text-xs">
                        <div>
                          <span className="font-bold text-[#78372B]">Allocated Seva Fund: </span>
                          <span className="font-semibold">{currentReceipt.purpose}</span>
                          <div className="text-[10px] text-[#39251D]/70 mt-0.5">
                            Representative: {currentReceipt.collectedBy}
                          </div>
                        </div>
                        <div className="flex gap-6 text-center">
                          <div>
                            <div className="h-0.5 w-24 bg-[#C59A52]/40 mx-auto mt-4" />
                            <span className="text-[9px] text-[#39251D]/70 font-bold">Collector Sig.</span>
                          </div>
                          <div>
                            <div className="h-0.5 w-24 bg-[#C59A52]/40 mx-auto mt-4" />
                            <span className="text-[9px] text-[#39251D]/70 font-bold">Office Accountant</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#C59A52]/40 bg-white/60 p-12 text-center">
                  <Receipt size={48} className="text-[#C59A52]/60" />
                  <h3 className="mt-4 font-serif text-xl font-bold text-[#78372B]">Dual Receipt Preview</h3>
                  <p className="mt-1 max-w-sm text-xs text-[#39251D]/70">
                    Search a member on the left and enter donation amount to generate and print official Donor and Office receipts.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 2: OFFICE COPY / COLLECTION HISTORY LEDGER
        ============================================================== */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#78372B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Office Copy / Collection History
                </h2>
                <p className="mt-0.5 text-xs text-[#39251D]/70">
                  Central repository of all issued receipts with segmentation filtering and CSV export.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => exportToCSV(`ckf_office_records_${Date.now()}.csv`, receipts)}
                  className="flex items-center gap-2 rounded-xl bg-[#78372B] px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-[#971515] transition"
                >
                  <Download size={15} />
                  <span>Export Office Records CSV</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#C59A52]/30 bg-white p-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#78372B]">Channel:</span>
                {["All", "Walk-in to Foundation", "Field Collection", "Online Donation"].map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setHistoryChannelFilter(ch)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      historyChannelFilter === ch
                        ? "bg-[#971515] text-white"
                        : "bg-[#FFF9ED] text-[#78372B] hover:bg-[#EDE0C9]/40 border border-[#C59A52]/30"
                    }`}
                  >
                    {ch === "Walk-in to Foundation" ? "Walk-in" : ch === "Field Collection" ? "Field Agent" : ch}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C59A52]" />
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Search receipt, donor, phone..."
                  className="w-full rounded-lg border border-[#C59A52]/30 py-2 pl-9 pr-3 text-xs focus:border-[#971515] focus:outline-none"
                />
              </div>
            </div>

            {/* History Table */}
            <div className="rounded-2xl border border-[#C59A52]/40 bg-white shadow-sm overflow-hidden">
              {filteredReceipts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFF9ED] text-[#78372B] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="p-3.5">Receipt No</th>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">Donor Name & ID</th>
                        <th className="p-3.5">Channel / Mode</th>
                        <th className="p-3.5">Purpose</th>
                        <th className="p-3.5">Collector</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Amount</th>
                        <th className="p-3.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C59A52]/20">
                      {filteredReceipts.map((r) => (
                        <tr key={r.receiptNo} className="hover:bg-[#FFF9ED]/30">
                          <td className="p-3.5 font-mono font-bold text-[#971515]">{r.receiptNo}</td>
                          <td className="p-3.5 text-[#39251D]/70">{r.date}</td>
                          <td className="p-3.5">
                            <div className="font-bold text-[#39251D]">{r.donorName}</div>
                            <div className="text-[10px] text-[#39251D]/60">{r.memberId || "General Donor"}</div>
                          </td>
                          <td className="p-3.5">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              r.channel === "Online Donation"
                                ? "bg-emerald-100 text-emerald-800"
                                : r.channel === "Field Collection"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {r.channel}
                            </span>
                            <div className="text-[10px] text-[#39251D]/60 mt-0.5">{r.paymentMode}</div>
                          </td>
                          <td className="p-3.5 text-[#39251D]/80 font-medium">{r.purpose}</td>
                          <td className="p-3.5 text-[#39251D]/70">{r.collectedBy}</td>
                          <td className="p-3.5">
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              r.settlementStatus === "Pending Office Deposit"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {r.settlementStatus || "Settled"}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-bold text-sm text-[#78372B]">
                            ₹{Number(r.amount).toLocaleString("en-IN")}
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => {
                                setCurrentReceipt(r);
                                setActiveTab("receipt");
                              }}
                              className="rounded-lg border border-[#C59A52]/40 bg-[#FFF9ED] px-2.5 py-1 text-[11px] font-bold text-[#78372B] hover:bg-[#971515] hover:text-white transition"
                            >
                              Reprint
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-[#39251D]/60">
                  No saved receipts matching your filter criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 3: MEMBER DATABASE (ALL 12 COLUMNS)
        ============================================================== */}
        {activeTab === "members" && (
          <div className="space-y-8">
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#78372B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Member Database (12 Columns)
                </h2>
                <p className="mt-0.5 text-xs text-[#39251D]/70">
                  Required Columns: ID, NAME, ADDRESS - 1, ADDRESS - 2, VILLAGE/TOWN/CITY, POST OFFICE, DISTRICT/CITY, STATE, PIN CODE, COUNTRY, MOBILE - 1, MOBILE - 2.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => exportToCSV(`ckf_members_${Date.now()}.csv`, members)}
                  className="flex items-center gap-2 rounded-xl bg-[#78372B] px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-[#971515] transition"
                >
                  <Download size={15} />
                  <span>Export Members CSV</span>
                </button>
              </div>
            </div>

            {/* Top Grid: Add Member Form + Excel Bulk Upload */}
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Left 7 Cols: Manual Add Member Form with all 12 fields */}
              <div className="rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm lg:col-span-7">
                <h3 className="font-serif text-lg font-bold text-[#78372B] border-b border-[#C59A52]/20 pb-3">
                  Add New Member Manually
                </h3>
                <form onSubmit={handleAddMember} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">Member ID</label>
                      <input
                        type="text"
                        value={newMember.id}
                        onChange={(e) => setNewMember({ ...newMember, id: e.target.value })}
                        placeholder="Auto-generated if empty"
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs font-mono font-semibold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">
                        Name <span className="text-[#971515]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        placeholder="Full devotee name"
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">Address - 1</label>
                      <input
                        type="text"
                        value={newMember.address1}
                        onChange={(e) => setNewMember({ ...newMember, address1: e.target.value })}
                        placeholder="House / Street"
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">Address - 2</label>
                      <input
                        type="text"
                        value={newMember.address2}
                        onChange={(e) => setNewMember({ ...newMember, address2: e.target.value })}
                        placeholder="Landmark / Locality"
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">Village/Town/City</label>
                      <input
                        type="text"
                        value={newMember.city}
                        onChange={(e) => setNewMember({ ...newMember, city: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">Post Office</label>
                      <input
                        type="text"
                        value={newMember.postOffice}
                        onChange={(e) => setNewMember({ ...newMember, postOffice: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">District/City</label>
                      <input
                        type="text"
                        value={newMember.district}
                        onChange={(e) => setNewMember({ ...newMember, district: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">State</label>
                      <input
                        type="text"
                        value={newMember.state}
                        onChange={(e) => setNewMember({ ...newMember, state: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">PIN Code</label>
                      <input
                        type="text"
                        value={newMember.pincode}
                        onChange={(e) => setNewMember({ ...newMember, pincode: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2 text-xs font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">Country</label>
                      <input
                        type="text"
                        value={newMember.country}
                        onChange={(e) => setNewMember({ ...newMember, country: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">
                        Mobile - 1 <span className="text-[#971515]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={newMember.mobile1}
                        onChange={(e) => setNewMember({ ...newMember, mobile1: e.target.value })}
                        placeholder="10-digit mobile"
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2 text-xs font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">Mobile - 2</label>
                      <input
                        type="tel"
                        value={newMember.mobile2}
                        onChange={(e) => setNewMember({ ...newMember, mobile2: e.target.value })}
                        placeholder="Secondary mobile"
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2 text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-[#971515] py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-[#78372B] transition"
                    >
                      Add Member
                    </button>
                  </div>
                </form>
              </div>

              {/* Right 5 Cols: Bulk Upload & Actions */}
              <div className="space-y-6 lg:col-span-5">
                <div className="rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm">
                  <h3 className="font-serif text-lg font-bold text-[#78372B] border-b border-[#C59A52]/20 pb-3">
                    Bulk Add / Upload Excel or CSV
                  </h3>
                  <p className="mt-2 text-xs text-[#39251D]/70">
                    Upload your updated member list whenever you add or change members. Required columns: ID, NAME, ADDRESS - 1, ADDRESS - 2, CITY, POST OFFICE, DISTRICT, STATE, PIN CODE, COUNTRY, MOBILE - 1, MOBILE - 2.
                  </p>

                  <div className="mt-4 rounded-xl border-2 border-dashed border-[#C59A52]/40 bg-[#FFF9ED]/30 p-5 text-center">
                    <FileSpreadsheet size={32} className="mx-auto text-[#C59A52]" />
                    <input
                      type="file"
                      id="member-csv-upload"
                      accept=".csv, .xlsx, .xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="member-csv-upload"
                      className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#971515] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#78372B] transition"
                    >
                      <Upload size={14} />
                      <span>Choose Excel / CSV File</span>
                    </label>
                    <p className="mt-2 text-[11px] text-[#39251D]/60">Supports CSV, XLS, XLSX formats</p>
                  </div>
                </div>

                {/* Bulk Select / Delete Actions */}
                <div className="rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm">
                  <h3 className="font-serif text-lg font-bold text-[#78372B] border-b border-[#C59A52]/20 pb-3">
                    Bulk Selection & Cleanup
                  </h3>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleSelectAllMembers}
                      className="flex items-center gap-1.5 rounded-xl border border-[#C59A52]/40 bg-[#FFF9ED] px-3.5 py-2 text-xs font-bold text-[#78372B] hover:bg-[#EDE0C9]/50 transition"
                    >
                      {selectedMemberIds.length === members.length ? <CheckSquare size={14} /> : <Square size={14} />}
                      <span>{selectedMemberIds.length === members.length ? "Clear Selection" : "Select All"}</span>
                    </button>

                    <button
                      onClick={handleRemoveSelectedMembers}
                      disabled={!selectedMemberIds.length}
                      className="flex items-center gap-1.5 rounded-xl bg-rose-700 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-rose-800 transition disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                      <span>Remove Selected ({selectedMemberIds.length})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Member Directory Full Table */}
            <div className="rounded-2xl border border-[#C59A52]/40 bg-white shadow-sm overflow-hidden">
              <div className="flex flex-col justify-between gap-3 border-b border-[#C59A52]/20 p-4 sm:flex-row sm:items-center">
                <span className="font-serif text-lg font-bold text-[#78372B]">
                  Member Directory ({filteredMembers.length} records)
                </span>
                <div className="relative w-full sm:w-72">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C59A52]" />
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    placeholder="Search by name, ID, phone, city..."
                    className="w-full rounded-lg border border-[#C59A52]/30 py-2 pl-9 pr-3 text-xs focus:border-[#971515] focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFF9ED] text-[#78372B] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedMemberIds.length === members.length && members.length > 0}
                          onChange={handleSelectAllMembers}
                        />
                      </th>
                      <th className="p-3">ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Address - 1 & 2</th>
                      <th className="p-3">City / Post Office</th>
                      <th className="p-3">District & State</th>
                      <th className="p-3">PIN</th>
                      <th className="p-3">Mobile - 1 & 2</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C59A52]/20">
                    {filteredMembers.map((m) => {
                      const isSelected = selectedMemberIds.includes(m.id);
                      return (
                        <tr key={m.id} className={isSelected ? "bg-[#FFF9ED]/80" : "hover:bg-[#FFF9ED]/20"}>
                          <td className="p-3 text-center">
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
                            />
                          </td>
                          <td className="p-3 font-mono font-bold text-[#971515]">{m.id}</td>
                          <td className="p-3 font-bold text-[#39251D]">{m.name}</td>
                          <td className="p-3 text-[#39251D]/80">
                            {m.address1} {m.address2 && `• ${m.address2}`}
                          </td>
                          <td className="p-3 text-[#39251D]/80">
                            {m.city} {m.postOffice && `(PO: ${m.postOffice})`}
                          </td>
                          <td className="p-3 text-[#39251D]/80">
                            {m.district}, {m.state}
                          </td>
                          <td className="p-3 font-mono">{m.pincode}</td>
                          <td className="p-3 font-mono">
                            <div>{m.mobile1}</div>
                            {m.mobile2 && <div className="text-[10px] text-[#39251D]/60">{m.mobile2}</div>}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                handleSelectMemberForReceipt(m);
                                setActiveTab("receipt");
                              }}
                              className="rounded-lg bg-[#971515] px-2.5 py-1 text-[11px] font-bold text-white shadow hover:bg-[#78372B] transition"
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

        {/* ==============================================================
            TAB 4: FIELD COLLECTION AGENTS (Doorstep Collectors)
        ============================================================== */}
        {activeTab === "agents" && (
          <div className="space-y-8">
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#78372B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Field Collection Representatives
                </h2>
                <p className="mt-0.5 text-xs text-[#39251D]/70">
                  Manage doorstep donation collectors, track assigned areas, and settle collection batches with central office.
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
              {/* Left 4 Cols: Register New Agent */}
              <div className="rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm lg:col-span-4">
                <h3 className="font-serif text-lg font-bold text-[#78372B] border-b border-[#C59A52]/20 pb-3">
                  Register Field Agent
                </h3>
                <form onSubmit={handleAddAgent} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#78372B]">Agent Code</label>
                    <input
                      type="text"
                      value={newAgent.agentCode}
                      onChange={(e) => setNewAgent({ ...newAgent, agentCode: e.target.value })}
                      placeholder="e.g. AGT-004 (Auto if blank)"
                      className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#78372B]">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newAgent.name}
                      onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                      placeholder="Representative Name"
                      className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#78372B]">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={newAgent.phone}
                      onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                      placeholder="Primary contact"
                      className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#78372B]">Assigned Territory</label>
                    <input
                      type="text"
                      value={newAgent.assignedArea}
                      onChange={(e) => setNewAgent({ ...newAgent, assignedArea: e.target.value })}
                      placeholder="e.g. Nabadwip Ghats & Market"
                      className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#971515] py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-[#78372B] transition"
                  >
                    Add Representative
                  </button>
                </form>
              </div>

              {/* Right 8 Cols: Agents Table with Settle Action */}
              <div className="rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm lg:col-span-8">
                <h3 className="font-serif text-lg font-bold text-[#78372B] border-b border-[#C59A52]/20 pb-3">
                  Active Collectors & Office Settlement Status
                </h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFF9ED] text-[#78372B] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="p-3">Agent Code</th>
                        <th className="p-3">Name & Phone</th>
                        <th className="p-3">Assigned Area</th>
                        <th className="p-3 text-right">Total Collected</th>
                        <th className="p-3 text-right">Pending Deposit</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C59A52]/20">
                      {agents.map((ag) => (
                        <tr key={ag.agentCode} className="hover:bg-[#FFF9ED]/30">
                          <td className="p-3 font-mono font-bold text-[#971515]">{ag.agentCode}</td>
                          <td className="p-3">
                            <div className="font-bold text-[#39251D]">{ag.name}</div>
                            <div className="text-[10px] text-[#39251D]/60 font-mono">{ag.phone}</div>
                          </td>
                          <td className="p-3 text-[#39251D]/80">{ag.assignedArea}</td>
                          <td className="p-3 text-right font-bold text-[#78372B]">
                            ₹{ag.totalCollected.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 text-right font-bold text-rose-700">
                            ₹{ag.pendingSettlement.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 text-center">
                            {ag.pendingSettlement > 0 ? (
                              <button
                                onClick={() => handleSettleAgent(ag)}
                                className="rounded-lg bg-emerald-700 px-3 py-1 text-[11px] font-bold text-white shadow hover:bg-emerald-800 transition"
                              >
                                Settle Deposit
                              </button>
                            ) : (
                              <span className="text-[11px] font-semibold text-emerald-600">✓ Settled</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 5: EVENTS & UTSAVS CMS (Syncs with /events)
        ============================================================== */}
        {activeTab === "events" && (
          <div className="space-y-8">
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#78372B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Upcoming Events & Utsavs CMS
                </h2>
                <p className="mt-0.5 text-xs text-[#39251D]/70">
                  Control festivals and special seva days displayed on the website's public Events page.
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
              {/* Left 5 Cols: Add Event */}
              <div className="rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm lg:col-span-5">
                <h3 className="font-serif text-lg font-bold text-[#78372B] border-b border-[#C59A52]/20 pb-3">
                  Post New Festival / Seva
                </h3>
                <form onSubmit={handleAddEvent} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#78372B]">Title *</label>
                    <input
                      type="text"
                      required
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="e.g. Sri Radhashtami Mahotsav"
                      className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">Bengali Script</label>
                      <input
                        type="text"
                        value={newEvent.bengali}
                        onChange={(e) => setNewEvent({ ...newEvent, bengali: e.target.value })}
                        placeholder="শ্রী রাধাষ্টমী উৎসব"
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">Category</label>
                      <select
                        value={newEvent.category}
                        onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs focus:outline-none"
                      >
                        <option>Major Utsav</option>
                        <option>Pariwar Seva</option>
                        <option>Monthly Celebration</option>
                        <option>Special Seva</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">Season / Tithi</label>
                      <input
                        type="text"
                        value={newEvent.season}
                        onChange={(e) => setNewEvent({ ...newEvent, season: e.target.value })}
                        placeholder="e.g. Bhadra Shukla Ashtami"
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">Timing</label>
                      <input
                        type="text"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        placeholder="e.g. 12:00 PM Midday Abhishek"
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#78372B]">Seva Sponsorship Focus</label>
                    <input
                      type="text"
                      value={newEvent.seva}
                      onChange={(e) => setNewEvent({ ...newEvent, seva: e.target.value })}
                      placeholder="e.g. Anna Daan & Pushpa Abhishek"
                      className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#78372B]">Description *</label>
                    <textarea
                      rows="3"
                      required
                      value={newEvent.desc}
                      onChange={(e) => setNewEvent({ ...newEvent, desc: e.target.value })}
                      placeholder="Details of rituals, parikrama, kirtan, prasadam distribution..."
                      className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#971515] py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-[#78372B] transition"
                  >
                    Publish to Website Events
                  </button>
                </form>
              </div>

              {/* Right 7 Cols: Existing Events List */}
              <div className="space-y-4 lg:col-span-7">
                <h3 className="font-serif text-lg font-bold text-[#78372B]">Scheduled Festivals ({events.length})</h3>
                <div className="space-y-3">
                  {events.map((ev) => (
                    <div key={ev._id || ev.title} className="flex items-start justify-between rounded-xl border border-[#C59A52]/30 bg-white p-4 shadow-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-base font-bold text-[#78372B]">{ev.title}</span>
                          {ev.bengali && <span className="text-xs text-[#971515] font-serif">{ev.bengali}</span>}
                        </div>
                        <div className="text-xs text-[#39251D]/70">
                          {ev.season} • {ev.time}
                        </div>
                        <p className="text-xs text-[#39251D]/80 line-clamp-2 max-w-lg mt-1">{ev.desc}</p>
                        <div className="mt-2 inline-block rounded-md bg-[#FFF9ED] px-2 py-0.5 text-[10px] font-bold text-[#78372B] border border-[#C59A52]/30">
                          Seva: {ev.seva}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(ev._id)}
                        className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 transition"
                        title="Delete event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 6: BLOGS & KATHA CMS (Syncs with /blog)
        ============================================================== */}
        {activeTab === "blogs" && (
          <div className="space-y-8">
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#78372B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Spiritual Katha & Blog CMS
                </h2>
                <p className="mt-0.5 text-xs text-[#39251D]/70">
                  Publish philosophical discourses, history of Sri Chintamoni Kunja, and Gaudiya Vaishnav katha.
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
              {/* Left 6 Cols: Publish New Blog */}
              <div className="rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm lg:col-span-6">
                <h3 className="font-serif text-lg font-bold text-[#78372B] border-b border-[#C59A52]/20 pb-3">
                  Write Spiritual Article
                </h3>
                <form onSubmit={handleAddBlog} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#78372B]">Title *</label>
                    <input
                      type="text"
                      required
                      value={newBlog.title}
                      onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                      placeholder="Title of discourse or article"
                      className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">Bengali Sub-title</label>
                      <input
                        type="text"
                        value={newBlog.bengali}
                        onChange={(e) => setNewBlog({ ...newBlog, bengali: e.target.value })}
                        placeholder="বাংলায় শিরোনাম"
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78372B]">Category</label>
                      <select
                        value={newBlog.category}
                        onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs focus:outline-none"
                      >
                        <option>Katha & Philosophy</option>
                        <option>Heritage & History</option>
                        <option>Festivals & Utsavs</option>
                        <option>Seva & Humanitarian</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#78372B]">Excerpt / Summary</label>
                    <textarea
                      rows="2"
                      value={newBlog.excerpt}
                      onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                      placeholder="Short synopsis shown on the blog cards..."
                      className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#78372B]">Full Content *</label>
                    <textarea
                      rows="6"
                      required
                      value={newBlog.content}
                      onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                      placeholder="Spiritual text, verses, commentary, historical citations..."
                      className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#971515] py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-[#78372B] transition"
                  >
                    Publish Article to Website
                  </button>
                </form>
              </div>

              {/* Right 6 Cols: Published Articles List */}
              <div className="space-y-4 lg:col-span-6">
                <h3 className="font-serif text-lg font-bold text-[#78372B]">Published Articles ({blogs.length})</h3>
                <div className="space-y-3">
                  {blogs.map((b) => (
                    <div key={b._id || b.title} className="rounded-xl border border-[#C59A52]/30 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="rounded bg-[#FFF9ED] px-2 py-0.5 text-[10px] font-bold text-[#78372B] border border-[#C59A52]/30">
                            {b.category}
                          </span>
                          <h4 className="font-serif text-base font-bold text-[#78372B] mt-1">{b.title}</h4>
                          <div className="text-[11px] text-[#39251D]/60 mt-0.5">
                            By {b.author || "Sri Sri Chintamoni Kunja"} • {b.readTime || "5 min read"}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteBlog(b._id)}
                          className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 transition"
                          title="Delete article"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-[#39251D]/80 line-clamp-2">{b.excerpt || b.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 7: GALLERY MEDIA MANAGER
        ============================================================== */}
        {activeTab === "gallery" && (
          <div className="space-y-8">
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#78372B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Gallery Media Manager
                </h2>
                <p className="mt-0.5 text-xs text-[#39251D]/70">
                  Manage photographs and sacred visuals across temple sanctum, altar, festivals, and seva.
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
              {/* Left 4 Cols: Add Media Form */}
              <div className="rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm lg:col-span-4">
                <h3 className="font-serif text-lg font-bold text-[#78372B] border-b border-[#C59A52]/20 pb-3">
                  Add Photo to Gallery
                </h3>
                <form onSubmit={handleAddGallery} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#78372B]">Title *</label>
                    <input
                      type="text"
                      required
                      value={newGallery.title}
                      onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                      placeholder="e.g. Gaura Purnima Aarti"
                      className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#78372B]">Category</label>
                    <select
                      value={newGallery.category}
                      onChange={(e) => setNewGallery({ ...newGallery, category: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs focus:outline-none"
                    >
                      <option>Temple & Altar</option>
                      <option>Festivals & Utsavs</option>
                      <option>Anna Daan Seva</option>
                      <option>River Ghats & Dham</option>
                      <option>Devotees & Kirtan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#78372B]">Image Path / URL *</label>
                    <input
                      type="text"
                      required
                      value={newGallery.image}
                      onChange={(e) => setNewGallery({ ...newGallery, image: e.target.value })}
                      placeholder="/assets/image.png or https://..."
                      className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#78372B]">Caption / Notes</label>
                    <input
                      type="text"
                      value={newGallery.caption}
                      onChange={(e) => setNewGallery({ ...newGallery, caption: e.target.value })}
                      placeholder="Devotees chanting Harinam..."
                      className="mt-1 w-full rounded-xl border border-[#C59A52]/40 p-2.5 text-xs focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#971515] py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-[#78372B] transition"
                  >
                    Add Photo
                  </button>
                </form>
              </div>

              {/* Right 8 Cols: Gallery Grid */}
              <div className="rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm lg:col-span-8">
                <h3 className="font-serif text-lg font-bold text-[#78372B] border-b border-[#C59A52]/20 pb-3">
                  Gallery Visuals ({gallery.length})
                </h3>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gallery.map((g) => (
                    <div key={g._id || g.title} className="group relative overflow-hidden rounded-xl border border-[#C59A52]/30 bg-[#FFF9ED]">
                      <img
                        src={g.image}
                        alt={g.title}
                        className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#78372B]">{g.title}</span>
                          <button
                            onClick={() => handleDeleteGallery(g._id)}
                            className="rounded p-1 text-rose-600 hover:bg-rose-100 transition"
                            title="Remove"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="mt-0.5 text-[10px] text-[#39251D]/60 font-semibold">{g.category}</div>
                        {g.caption && <p className="mt-1 text-[11px] text-[#39251D]/70 line-clamp-1">{g.caption}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 8: DEVOTEE INQUIRIES & CONTACT SUBMISSIONS
        ============================================================== */}
        {activeTab === "inquiries" && (
          <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#C59A52]/40 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#78372B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Devotee Contact & Seva Inquiries ({contacts.length})
                </h2>
                <p className="mt-0.5 text-xs text-[#39251D]/70">
                  Messages submitted through the public Contact Us form (/contact) saved directly to the database.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#C59A52]/40 bg-white shadow-sm overflow-hidden">
              {contacts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFF9ED] text-[#78372B] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="p-3.5">Name</th>
                        <th className="p-3.5">Email & Phone</th>
                        <th className="p-3.5">Address</th>
                        <th className="p-3.5">Purpose</th>
                        <th className="p-3.5">Message / Prayer</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C59A52]/20">
                      {contacts.map((c) => (
                        <tr key={c._id} className="hover:bg-[#FFF9ED]/30">
                          <td className="p-3.5 font-bold text-[#39251D]">{c.name}</td>
                          <td className="p-3.5">
                            <div>{c.email}</div>
                            {c.phone && <div className="text-[10px] text-[#39251D]/60 font-mono">{c.phone}</div>}
                          </td>
                          <td className="p-3.5 text-[#39251D]/80">{c.address || "—"}</td>
                          <td className="p-3.5">
                            <span className="rounded bg-[#FFF9ED] px-2 py-0.5 text-[10px] font-bold text-[#78372B] border border-[#C59A52]/30">
                              {c.purpose || "General Inquiry"}
                            </span>
                          </td>
                          <td className="p-3.5 text-[#39251D]/80 max-w-xs">{c.message}</td>
                          <td className="p-3.5">
                            <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                              c.status === "Responded"
                                ? "bg-emerald-100 text-emerald-800"
                                : c.status === "Archived"
                                ? "bg-gray-100 text-gray-700"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {c.status || "New"}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <select
                              value={c.status || "New"}
                              onChange={(e) => handleUpdateContactStatus(c._id, e.target.value)}
                              className="rounded border border-[#C59A52]/40 bg-white p-1 text-[10px] font-bold text-[#78372B] focus:outline-none"
                            >
                              <option value="New">New</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Responded">Responded</option>
                              <option value="Archived">Archived</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-[#39251D]/60">
                  No devotee inquiries received yet. Inquiries submitted via Contact Us form will appear here in real-time.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}

// Icon helper
function BookOpenIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}
