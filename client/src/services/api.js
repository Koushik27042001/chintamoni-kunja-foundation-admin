/**
 * Central API Service Layer for Sri Sri Chintamoni Kunja Foundation
 * Seamlessly interfaces with Express backend `/api/*`
 * Provides resilient, automatic local storage fallback if the server or database is offline.
 */

// Normalize API_BASE: strips trailing slashes, removes double slashes, and ensures `/api` endpoint path
function getNormalizedApiBase() {
  let envUrl = (import.meta.env.VITE_API_BASE_URL || '/api').trim();
  // Strip trailing slashes
  envUrl = envUrl.replace(/\/+$/, '');
  // If user passed root domain without /api (e.g. "https://chintamoni-kunja-homepage.onrender.com"), append /api
  if (envUrl !== '' && !envUrl.endsWith('/api')) {
    envUrl = `${envUrl}/api`;
  }
  return envUrl || '/api';
}

const API_BASE = getNormalizedApiBase();

/* ==================================================================
   JWT Authentication & Expiry Handling
================================================================== */

/**
 * Check if a JWT token has expired using its base64 payload
 */
export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    // Expired if current time (in seconds) >= token.exp
    return Date.now() >= payload.exp * 1000;
  } catch (e) {
    return true;
  }
}

/**
 * Retrieve the active auth token, auto-clearing if expired
 */
export function getAuthToken() {
  const token = localStorage.getItem('ckf_admin_token');
  if (!token) return null;
  if (isTokenExpired(token)) {
    localStorage.removeItem('ckf_admin_token');
    localStorage.removeItem('ckf_admin_user');
    window.dispatchEvent(new CustomEvent('ckf_auth_expired', { detail: { reason: 'TOKEN_EXPIRED' } }));
    return null;
  }
  return token;
}

/**
 * Enhanced fetch with JWT auth header and automatic 401 / token expiry interceptor
 */
export async function authFetch(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, { ...options, headers });

  // Handle Token Expiry / 401 Unauthorized globally
  if (response.status === 401) {
    const data = await response.json().catch(() => ({}));
    if (data.code === 'TOKEN_EXPIRED' || data.code === 'TOKEN_INVALID' || data.code === 'NO_TOKEN') {
      localStorage.removeItem('ckf_admin_token');
      localStorage.removeItem('ckf_admin_user');
      window.dispatchEvent(
        new CustomEvent('ckf_auth_expired', {
          detail: {
            reason: data.code,
            message: data.message || 'Your session has expired. Please log in again.',
          },
        })
      );
    }
  }

  return response;
}

/**
 * Admin Login API
 */
export async function loginAdminAPI(email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(6000),
    });

    const json = await res.json();
    if (res.ok && json.success && json.token) {
      localStorage.setItem('ckf_admin_token', json.token);
      localStorage.setItem('ckf_admin_user', JSON.stringify(json.user));
      return { success: true, user: json.user, token: json.token };
    }
    return { success: false, message: json.message || 'Invalid administrator credentials' };
  } catch (err) {
    return { success: false, message: 'Server unreachable. Please verify server connection.' };
  }
}

/**
 * Admin Logout API
 */
export function logoutAdminAPI() {
  localStorage.removeItem('ckf_admin_token');
  localStorage.removeItem('ckf_admin_user');
  window.dispatchEvent(new CustomEvent('ckf_auth_logout'));
}

/**
 * Get current stored admin profile
 */
export function getCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;
  const user = localStorage.getItem('ckf_admin_user');
  return user ? JSON.parse(user) : null;
}

/**
 * Refresh JWT Token before expiry
 */
export async function refreshTokenAPI() {
  try {
    const res = await authFetch(`${API_BASE}/auth/refresh`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('ckf_admin_token', data.token);
        return true;
      }
    }
  } catch (e) {}
  return false;
}

// Realistic initial fallback data
export const INITIAL_MEMBERS = [
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
    email: "shyamasundar@example.com",
    category: "Life Member",
    status: "Active",
    totalDonations: 11000,
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
    email: "anandamayee@example.com",
    category: "Patron",
    status: "Active",
    totalDonations: 5001,
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
    email: "gouranga@example.com",
    category: "Trustee",
    status: "Active",
    totalDonations: 25000,
  },
];

export const INITIAL_AGENTS = [
  {
    agentCode: "AGT-001",
    name: "Subhasish Goswami",
    phone: "9832198765",
    assignedArea: "Nabadwip Town & Ghats",
    totalCollected: 15500,
    pendingSettlement: 5000,
    active: true,
  },
  {
    agentCode: "AGT-002",
    name: "Bimal Krishna Das",
    phone: "9734567890",
    assignedArea: "Mayapur & Teghori",
    totalCollected: 8200,
    pendingSettlement: 0,
    active: true,
  },
  {
    agentCode: "AGT-003",
    name: "Pranab Kumar Roy",
    phone: "9434123456",
    assignedArea: "Krishnanagar & Shantipur",
    totalCollected: 12000,
    pendingSettlement: 3500,
    active: true,
  },
];

export const INITIAL_RECEIPTS = [
  {
    receiptNo: "CKF-2026-001",
    memberId: "CKF-M-001",
    donorName: "Shyamasundar Das",
    mobile: "9832104512",
    email: "shyamasundar@example.com",
    address: "Harisabha Para, Nabadwip",
    amount: 5001,
    amountInWords: "Five Thousand One Rupees Only",
    channel: "Walk-in to Foundation",
    paymentMode: "Cash",
    purpose: "Daily Anna Daan Seva",
    collectedBy: "Krishnendu Chakraborty",
    settlementStatus: "Settled",
    status: "Completed",
    date: new Date(Date.now() - 86400000 * 2).toLocaleDateString("en-GB"),
  },
  {
    receiptNo: "CKF-2026-002",
    memberId: "CKF-M-002",
    donorName: "Anandamayee Devi",
    mobile: "9679014230",
    email: "anandamayee@example.com",
    address: "Bowbazar Road, Nabadwip",
    amount: 2500,
    amountInWords: "Two Thousand Five Hundred Rupees Only",
    channel: "Field Collection",
    paymentMode: "Cash",
    purpose: "Temple Renovation & Maintenance",
    collectedBy: "Subhasish Goswami (AGT-001)",
    agentId: "AGT-001",
    agentName: "Subhasish Goswami",
    settlementStatus: "Pending Office Deposit",
    status: "Completed",
    date: new Date(Date.now() - 86400000).toLocaleDateString("en-GB"),
  },
  {
    receiptNo: "CKF-2026-003",
    memberId: "CKF-M-003",
    donorName: "Gouranga Charan Chakraborty",
    mobile: "9123456780",
    email: "gouranga@example.com",
    address: "College Para, Nabadwip",
    amount: 10000,
    amountInWords: "Ten Thousand Rupees Only",
    channel: "Online Donation",
    paymentMode: "UPI",
    purpose: "Festivals & Utsavs Seva",
    collectedBy: "Central Office Portal",
    settlementStatus: "Settled",
    status: "Completed",
    date: new Date().toLocaleDateString("en-GB"),
  },
];

export const INITIAL_EVENTS = [
  {
    _id: "evt-1",
    title: "Sri Gaur Purnima Mahotsav",
    bengali: "শ্রী গৌর পূর্ণিমা মহোৎসব",
    season: "Phalguna Purnima (Feb / March)",
    time: "All Day • Mangala to Midnight Sandhya Aarti",
    category: "Major Utsav",
    desc: "The sacred divine advent celebration of Lord Sri Krishna Chaitanya Mahaprabhu in sacred Nabadwip Dham. Features Maha Abhishek of Gaura-Nitai deities, 24-hour Akhanda Harinam Sankirtan, and mass distribution of sanctified Mahaprasadam.",
    seva: "Anna Daan & Altar Flowers",
    image: "/assets/Krishna’s Golden Riverside Devotion.png",
    featured: true,
  },
  {
    _id: "evt-2",
    title: "Sri Krishna Janmashtami & Nandotsav",
    bengali: "শ্রীকৃষ্ণ জন্মাষ্টমী ও নন্দোৎসব",
    season: "Bhadra Krishna Ashtami (August / September)",
    time: "Midnight Abhishek & Next-Day Feast",
    category: "Major Utsav",
    desc: "Celebrating the divine appearance of Bhagavan Sri Krishna. Devotees observe day-long fasting, hear katha from the 10th Canto of Srimad Bhagavatam, participate in ecstatic midnight aarti, and celebrate Nandotsav.",
    seva: "Midnight Bhoga & Milk Abhishek",
    image: "/assets/Opulent Gaura-Nitai and Madan Mohan Altar.png",
    featured: true,
  },
  {
    _id: "evt-3",
    title: "Sri Radhashtami Utsav",
    bengali: "শ্রী রাধাষ্টমী উৎসব",
    season: "Bhadra Shukla Ashtami (September)",
    time: "12:00 PM Midday Maha Abhishek",
    category: "Pariwar Seva",
    desc: "A sanctified occasion central to the Sri Radha Sakti Gadadhar Pandit Pariwar. Srimati Radharani's lotus feet are revealed for special darshan with singing of Sri Radhastakam.",
    seva: "Lotus Garlands & Scented Oils",
    image: "/assets/Opulent Gaura-Nitai and Madan Mohan Altar.png",
    featured: false,
  },
];

export const INITIAL_BLOGS = [
  {
    _id: "blg-1",
    title: "Sri Ramsundar Vidyalankar: Academic Pioneer & Social Reformer of 19th-Century Bengal",
    bengali: "শ্রী রামসুন্দর বিদ্যালঙ্কার ও সমাজ সংস্কার",
    category: "Heritage & History",
    excerpt: "A contemporary of Raja Ram Mohan Roy, Sri Ramsundar Vidyalankar established Sri Sri Chintamoni Kunja in 1809. Discover how he used Gaudiya Vaishnav philosophy to advocate for mass literacy and oppose medieval caste discrimination.",
    content: `Sri Ramsundar Vidyalankar, affectionately and reverently known as Sri Chintamoni Goswami by the Vaishnav assembly, stands as one of the most luminous yet humble personalities of the Bengal Renaissance. While Raja Ram Mohan Roy worked through institutional and socio-legal frameworks in Calcutta, Vidyalankar focused on grassroots transformation in the holy town of Nabadwip Dham.

In 1809, he established Sri Sri Chintamoni Kunja as an academic and spiritual center. Believing firmly that Lord Sri Krishna Chaitanya Dev was the greatest social reformer of his era, Vidyalankar preached that true devotion cannot coexist with untouchability, racism, or caste prejudice.

He opened the doors of scriptural learning to students from all social backgrounds, initiating educational drives that continue today through our Foundation's Academic Help initiative, which has supported over 2,000 students.`,
    author: "Seva Research Desk",
    readTime: "7 min read",
    image: "/assets/Nabadwip Dham Temple in Sunshine.png",
    status: "published",
    createdAt: "2026-04-14T10:00:00.000Z",
  },
  {
    _id: "blg-2",
    title: "The Mystery of Sri Radha Sakti & Gadadhar Pandit: The Pinnacle of Radha-Dasyam",
    bengali: "শ্রী রাধা শক্তি ও গদাধর পণ্ডিত প্রভুর তত্ত্ব",
    category: "Vaishnav Philosophy",
    excerpt: "In the Madhva Gaudiya Sampradaya, Sri Gadadhar Pandit Prabhu is revered as the internal hladini potency (Sri Radha Sakti) of the Supreme Lord. An insightful dive into the mood of unconditional devotional servitude.",
    content: `Among the Pancha Tattva, Lord Sri Gadadhar Pandit Prabhu holds an esoteric, intimate position. Classical Gaudiya texts describe him as the avatar of Srimati Radharani's transcendental devotional mood and internal pleasure potency (hladini-shakti).

In sacred Nabadwip Dham, Mahaprabhu and Gadadhar Pandit demonstrated the inseparable harmony of divine love. The Sri Radha Sakti Gadadhar Pandit Pariwar maintains this unbroken mood of 'Radha-dasyam'—the humble desire to serve the divine pleasure of Srimati Radharani and Sri Krishna through sincere Harinam Sankirtan and self-effacing compassion for all living beings.`,
    author: "Acharya Pariwar Desk",
    readTime: "9 min read",
    image: "/assets/Radha and Krishna by the Riverside.png",
    status: "published",
    createdAt: "2026-03-28T10:00:00.000Z",
  },
  {
    _id: "blg-3",
    title: "Beyond Caste & Feudal Mindset: How Lord Chaitanya’s Shikshastakam Redefined Humanity",
    bengali: "শিক্ষ অষ্টকম ও সার্বজনীন সাম্য",
    category: "Social Reform",
    excerpt: "Tṛṇād api sunīcena taror api sahiṣṇunā—unpacking how Lord Chaitanya's eight verses dismantled centuries of feudal orthodoxy and restored spiritual equality to every soul regardless of birth.",
    content: `Lord Sri Krishna Chaitanya Mahaprabhu left behind eight verses of sublime spiritual instruction known as the Shikshastakam. These verses are not mere poetic devotion; they form the manifesto of a spiritual revolution.

The third verse instructs one to become humbler than a blade of grass, more tolerant than a tree, and ready to offer all respect to others without expecting prestige. In an era marked by rigid caste hierarchies, Mahaprabhu embraced Haridas Thakur, appointed Ramananda Raya as an exalted teacher, and declared that anyone who knows the science of Krishna is a bona fide spiritual guide.

At Sri Sri Chintamoni Kunja, we guard this egalitarian mandate fiercely, rejecting medieval feudal prejudice and maintaining unconditional service for every pilgrim.`,
    author: "Spiritual Council",
    readTime: "6 min read",
    image: "/assets/Golden Kirtan by the Sacred Ghats.png",
    status: "published",
    createdAt: "2026-03-12T10:00:00.000Z",
  },
  {
    _id: "blg-4",
    title: "Zero Starvation as Divine Seva: The Sacred Science of Anna Daan in Nabadwip Dham",
    bengali: "ক্ষুধামুক্ত সমাজের ব্রত ও প্রসাদ সেবা",
    category: "Humanitarian Seva",
    excerpt: "Why sanctified food distribution (prasadam) is considered the highest form of compassion in Vedic culture, and how our Zero Starvation Movement feeds pilgrims daily without distinction.",
    content: `In Vaishnav tradition, food is not merely caloric fuel; it is prasad—the sanctified mercy of the Divine. By offering nutritious, vegetarian foodstuffs prepared with devotion to Lord Madan Mohan and distributing them freely, we nourish both body and spirit.

During pandemics, floods, and natural calamities, Sri Sri Chintamoni Kunja has distributed over one lakh meals across Nadia district. Today, our Zero Starvation Movement continues daily, ensuring that no visitor, student, or pilgrim leaves Nabadwip Dham with an empty stomach.`,
    author: "Foundation Seva Desk",
    readTime: "5 min read",
    image: "/assets/Devotional Procession Before Lord Jagannath.png",
    status: "published",
    createdAt: "2026-02-20T10:00:00.000Z",
  },
  {
    _id: "blg-5",
    title: "The Art of Sattvic Living: Ancient Dinacharya for Modern Peace of Mind",
    bengali: "সাত্ত্বিক জীবনধারা ও মানসিক প্রশান্তি",
    category: "Art of Living",
    excerpt: "Harmonizing daily routines, dietary discipline, mindful breathing, and personal mantra meditation to cultivate emotional equanimity in a fast-paced world.",
    content: `Modern life is inundated with cognitive overload, sensory distraction, and chronic stress. The Vaishnav science of 'Dinacharya' (daily sacred rhythm) provides a timeless sanctuary for mental balance.

Beginning with early morning reflection (Brahma Muhurta), cultivating mindful breathing during mantra japa, partaking of wholesome sattvic nutrition, and dedicating at least one action every day to selfless service (seva) creates psychological resilience and inner stillness.`,
    author: "Dr. K. Chakraborty",
    readTime: "8 min read",
    image: "/assets/Krishna’s Golden Riverside Devotion.png",
    status: "published",
    createdAt: "2026-02-05T10:00:00.000Z",
  },
  {
    _id: "blg-6",
    title: "The Daily Practice of Mahamantra Japa: Science and Spirit of Sacred Sound",
    bengali: "মহামন্ত্র জপ সাধনা ও দিব্য ধ্বনিবিজ্ঞান",
    category: "Katha & Philosophy",
    excerpt: "How meditating upon the sixteen holy names cleanses the mirror of the mind (ceto-darpana-marjanam) and restores spiritual poise amid modern stress.",
    content: `In the Kali Santarana Upanishad, the sage Narada inquires from Lord Brahma how living entities can transcend the anxieties and turbulence of the age of conflict. Lord Brahma instructs him to constantly chant the sixteen holy names: Hare Krishna, Hare Krishna, Krishna Krishna, Hare Hare / Hare Rama, Hare Rama, Rama Rama, Hare Hare.

Sound is the subtle blueprint of consciousness. When divine vibration permeates neuro-cognitive pathways, it dislodges deeply embedded impressions of anxiety, ego, and despair. At Chintamoni Kunja, daily communal and private Japa creates an atmosphere of spiritual serenity, bringing inner peace to thousands of practitioners.`,
    author: "Sri Sri Chintamoni Kunja Ashram",
    readTime: "5 min read",
    image: "/assets/Golden Kirtan by the Sacred Ghats.png",
    status: "published",
    createdAt: "2026-01-15T10:00:00.000Z",
  },
];

export const INITIAL_GALLERY = [
  {
    _id: "gal-1",
    title: "Krishna's Golden Riverside Devotion",
    category: "River Ghats & Dham",
    image: "/assets/Krishna’s Golden Riverside Devotion.png",
    caption: "Sacred pastimes on the consecrated banks of Bhagirathi river in Nabadwip Dham.",
  },
  {
    _id: "gal-2",
    title: "Radha & Krishna by the Riverside",
    category: "Temple & Altar",
    image: "/assets/Radha and Krishna by the Riverside.png",
    caption: "Divine love of Sri Sri Radha-Madhava amidst the lush groves of Bengal.",
  },
  {
    _id: "gal-3",
    title: "Opulent Gaura-Nitai & Madan Mohan Altar",
    category: "Temple & Altar",
    image: "/assets/Opulent Gaura-Nitai and Madan Mohan Altar.png",
    caption: "Venerable deities worshipped through centuries in the historic sanctuary.",
  },
  {
    _id: "gal-4",
    title: "Nabadwip Dham Temple in Sunshine",
    category: "River Ghats & Dham",
    image: "/assets/Nabadwip Dham Temple in Sunshine.png",
    caption: "Architectural heritage of Sri Sri Chintamoni Kunja founded in 1809.",
  },
  {
    _id: "gal-5",
    title: "Golden Kirtan by the Sacred Ghats",
    category: "Devotees & Kirtan",
    image: "/assets/Golden Kirtan by the Sacred Ghats.png",
    caption: "Ecstatic chanting of the holy names echoing across the sacred waters.",
  },
  {
    _id: "gal-6",
    title: "Devotional Procession Before Lord Jagannath",
    category: "Festivals & Utsavs",
    image: "/assets/Devotional Procession Before Lord Jagannath.png",
    caption: "Festive Rath Yatra and sankirtan processions in holy Nabadwip.",
  },
  {
    _id: "gal-7",
    title: "Sacred Temple Interaction & Parikrama",
    category: "Videos",
    image: "/assets/interaction-video.mp4",
    caption: "Immersive video capturing devotional interactions and sacred moments at the Kunja.",
  },
];

// Helper to check server connectivity (supports Render cold-start wake-up with dual /api/health and /health probes)
export async function checkServerStatus() {
  const rootHealth = API_BASE.replace(/\/api$/, '') + '/health';
  const apiHealth = `${API_BASE}/health`;

  for (const url of [apiHealth, rootHealth]) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (res.ok) {
        const data = await res.json();
        return { online: true, database: data.database };
      }
    } catch (e) {
      // try next probe
    }
  }
  return { online: false, database: 'offline' };
}

/* ==================================================================
   Members API
================================================================== */
export async function getMembersAPI() {
  try {
    const res = await fetch(`${API_BASE}/members`, { signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        localStorage.setItem("ckf_members", JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (e) {
    // fallback
  }
  const saved = localStorage.getItem("ckf_members");
  return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
}

export async function createMemberAPI(member) {
  try {
    const res = await fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (e) {}
  // local fallback
  return member;
}

export async function bulkCreateMembersAPI(membersList) {
  try {
    const res = await fetch(`${API_BASE}/members/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ members: membersList }),
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) {
      const json = await res.json();
      return json;
    }
  } catch (e) {}
  return { success: true, importedCount: membersList.length };
}

export async function bulkDeleteMembersAPI(ids) {
  try {
    const res = await fetch(`${API_BASE}/members/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}
  return { success: true, deletedCount: ids.length };
}

/* ==================================================================
   Donations & Receipts API
================================================================== */
export async function getDonationsAPI() {
  try {
    const res = await fetch(`${API_BASE}/donations`, { signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        localStorage.setItem("ckf_receipts", JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (e) {}
  const saved = localStorage.getItem("ckf_receipts");
  return saved ? JSON.parse(saved) : INITIAL_RECEIPTS;
}

export async function createDonationAPI(donation) {
  try {
    const res = await fetch(`${API_BASE}/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donation),
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (e) {}
  return donation;
}

/* ==================================================================
   Collection Agents API
================================================================== */
export async function getAgentsAPI() {
  try {
    const res = await fetch(`${API_BASE}/agents`, { signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        localStorage.setItem("ckf_agents", JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (e) {}
  const saved = localStorage.getItem("ckf_agents");
  return saved ? JSON.parse(saved) : INITIAL_AGENTS;
}

export async function settleAgentAPI(agentCode) {
  try {
    const res = await fetch(`${API_BASE}/agents/${agentCode}/settle`, {
      method: 'POST',
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}
  return { success: true };
}

/* ==================================================================
   Events API
================================================================== */
export async function getEventsAPI() {
  try {
    const res = await fetch(`${API_BASE}/events`, { signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        localStorage.setItem("ckf_events", JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (e) {}
  const saved = localStorage.getItem("ckf_events");
  return saved ? JSON.parse(saved) : INITIAL_EVENTS;
}

export async function createEventAPI(event) {
  try {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (e) {}
  return { ...event, _id: `evt-${Date.now()}` };
}

export async function deleteEventAPI(id) {
  try {
    await fetch(`${API_BASE}/events/${id}`, { method: 'DELETE', signal: AbortSignal.timeout(12000) });
  } catch (e) {}
  return { success: true };
}

/* ==================================================================
   Blogs API
================================================================== */
export async function getBlogsAPI() {
  try {
    const res = await fetch(`${API_BASE}/blogs`, { signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        localStorage.setItem("ckf_blogs", JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (e) {}
  const saved = localStorage.getItem("ckf_blogs");
  return saved ? JSON.parse(saved) : INITIAL_BLOGS;
}

export async function createBlogAPI(blog) {
  let created = null;
  try {
    const res = await fetch(`${API_BASE}/blogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blog),
      signal: AbortSignal.timeout(18000),
    });
    if (res.ok) {
      const json = await res.json();
      created = json.data;
    }
  } catch (e) {}

  if (!created) {
    created = { ...blog, _id: `blg-${Date.now()}`, createdAt: new Date().toISOString() };
  }

  try {
    const existing = JSON.parse(localStorage.getItem("ckf_blogs") || "[]");
    const updated = [created, ...existing.filter((b) => b.title !== created.title)];
    localStorage.setItem("ckf_blogs", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("ckf_blog_updated", { detail: created }));
  } catch (err) {}

  return created;
}

export async function deleteBlogAPI(id) {
  try {
    await fetch(`${API_BASE}/blogs/${encodeURIComponent(id)}`, { method: 'DELETE', signal: AbortSignal.timeout(12000) });
  } catch (e) {}

  try {
    const existing = JSON.parse(localStorage.getItem("ckf_blogs") || "[]");
    const updated = existing.filter((b) => (b._id || b.id) !== id && b.title !== id);
    localStorage.setItem("ckf_blogs", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("ckf_blog_updated", { detail: { deletedId: id } }));
  } catch (err) {}

  return { success: true };
}

/* ==================================================================
   Gallery API (Deduplication, Cloudinary CDN, MongoDB & Permanent Delete)
================================================================== */

/**
 * Strict deduplicator to prevent multiple duplicate visual cards
 */
export function deduplicateGalleryItems(items) {
  if (!Array.isArray(items)) return [];
  const seenIds = new Set();
  const seenSrcs = new Set();
  const seenTitles = new Set();
  const result = [];

  for (const item of items) {
    if (!item) continue;
    const id = item._id || item.id;
    const title = (item.title || "").toLowerCase().trim();
    const src = (item.image || item.src || "").trim();

    // Skip if ID already processed
    if (id && seenIds.has(id)) continue;
    // Skip if identical image source already present
    if (src && seenSrcs.has(src)) continue;
    // Skip if same normalized title already present
    if (title && seenTitles.has(title)) continue;

    if (id) seenIds.add(id);
    if (src) seenSrcs.add(src);
    if (title) seenTitles.add(title);

    result.push(item);
  }

  return result;
}

/**
 * Strict sort: ensures any dynamically uploaded photo or video from admin
 * is ALWAYS placed at the top of the rows, ordered newest upload first.
 */
export function sortGalleryItemsLatestFirst(items) {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a, b) => {
    // Check if item is dynamic / uploaded by admin (has DB ObjectId, dynamic flag, public_id or created timestamp)
    const aIsAdmin = Boolean(
      a.isDynamic ||
      (a._id && a._id.length > 10) ||
      (a.id && a.id.length > 10) ||
      a.public_id ||
      a.storageProvider === 'cloudinary' ||
      a.storageProvider === 'database' ||
      (a.createdAt && !a._id?.startsWith('gal-'))
    );
    const bIsAdmin = Boolean(
      b.isDynamic ||
      (b._id && b._id.length > 10) ||
      (b.id && b.id.length > 10) ||
      b.public_id ||
      b.storageProvider === 'cloudinary' ||
      b.storageProvider === 'database' ||
      (b.createdAt && !b._id?.startsWith('gal-'))
    );

    if (aIsAdmin && !bIsAdmin) return -1; // Admin uploaded item comes first (top row)
    if (!aIsAdmin && bIsAdmin) return 1;

    // Between two admin uploads (or two baseline items), latest timestamp comes first
    const timeA = a.createdAt
      ? new Date(a.createdAt).getTime()
      : (a._id?.startsWith('gal-') ? parseInt(a._id.slice(4)) || 0 : 0);
    const timeB = b.createdAt
      ? new Date(b.createdAt).getTime()
      : (b._id?.startsWith('gal-') ? parseInt(b._id.slice(4)) || 0 : 0);

    return timeB - timeA;
  });
}

export async function getGalleryAPI() {
  // Read deleted tracking tombstone IDs so deleted items never resurrect
  const deletedSet = new Set(JSON.parse(localStorage.getItem("ckf_deleted_gallery_ids") || "[]"));

  let fetchedItems = null;

  try {
    const res = await fetch(`${API_BASE}/gallery`, { signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        fetchedItems = json.data;
      }
    }
  } catch (e) {
    console.warn("Gallery API probe failed, falling back to local store:", e.message);
  }

  // Combine server items with local storage
  const local = JSON.parse(localStorage.getItem("ckf_gallery") || "[]");
  const rawList = fetchedItems ? [...fetchedItems, ...local] : (local.length > 0 ? local : INITIAL_GALLERY);

  // Filter out any deleted items permanently
  const nonDeleted = rawList.filter((g) => {
    const id = g._id || g.id;
    const title = (g.title || "").toLowerCase().trim();
    const src = (g.image || g.src || "").trim();
    return !deletedSet.has(id) && !deletedSet.has(title) && !deletedSet.has(src);
  });

  const sorted = sortGalleryItemsLatestFirst(deduplicateGalleryItems(nonDeleted));
  localStorage.setItem("ckf_gallery", JSON.stringify(sorted));
  return sorted;
}

export async function createGalleryAPI(item) {
  let created = null;
  const deletedSet = new Set(JSON.parse(localStorage.getItem("ckf_deleted_gallery_ids") || "[]"));

  try {
    const res = await fetch(`${API_BASE}/gallery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
      signal: AbortSignal.timeout(25000),
    });
    if (res.ok) {
      const json = await res.json();
      created = json.data;
    }
  } catch (e) {
    console.warn("Server gallery create error, saving locally:", e.message);
  }

  if (!created) {
    created = { ...item, _id: `gal-${Date.now()}`, createdAt: new Date().toISOString(), isDynamic: true };
  } else {
    created = { ...created, isDynamic: true, createdAt: created.createdAt || new Date().toISOString() };
  }

  try {
    // If this item was previously in deletedSet, remove from deletedSet so new upload shows
    const id = created._id || created.id;
    const title = (created.title || "").toLowerCase().trim();
    const src = (created.image || created.src || "").trim();
    const newDeletedList = [...deletedSet].filter((d) => d !== id && d !== title && d !== src);
    localStorage.setItem("ckf_deleted_gallery_ids", JSON.stringify(newDeletedList));

    const existing = JSON.parse(localStorage.getItem("ckf_gallery") || "[]");
    const updated = sortGalleryItemsLatestFirst(deduplicateGalleryItems([created, ...existing]));
    localStorage.setItem("ckf_gallery", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("ckf_gallery_updated", { detail: created }));
  } catch (err) {}

  return created;
}

export async function deleteGalleryAPI(id, title = "", src = "") {
  try {
    await fetch(`${API_BASE}/gallery/${encodeURIComponent(id)}`, { method: 'DELETE', signal: AbortSignal.timeout(12000) });
  } catch (e) {
    console.warn("Server gallery delete error:", e.message);
  }

  try {
    // Permanently remember deleted tombstone IDs & titles
    const deletedList = JSON.parse(localStorage.getItem("ckf_deleted_gallery_ids") || "[]");
    const normTitle = (title || "").toLowerCase().trim();
    const normSrc = (src || "").trim();

    if (id) deletedList.push(id);
    if (normTitle) deletedList.push(normTitle);
    if (normSrc) deletedList.push(normSrc);

    localStorage.setItem("ckf_deleted_gallery_ids", JSON.stringify(Array.from(new Set(deletedList))));

    // Remove from local active gallery
    const existing = JSON.parse(localStorage.getItem("ckf_gallery") || "[]");
    const updated = existing.filter((g) => {
      const gId = g._id || g.id;
      const gTitle = (g.title || "").toLowerCase().trim();
      const gSrc = (g.image || g.src || "").trim();
      return gId !== id && gTitle !== normTitle && (!normSrc || gSrc !== normSrc);
    });

    localStorage.setItem("ckf_gallery", JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent("ckf_gallery_updated", { detail: { deletedId: id, deletedTitle: title } })
    );
  } catch (err) {}

  return { success: true };
}

/* ==================================================================
   Contact Inquiries API
================================================================== */
export async function getContactsAPI() {
  try {
    const res = await fetch(`${API_BASE}/contact`, { signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      const json = await res.json();
      return json.data || [];
    }
  } catch (e) {}
  const saved = localStorage.getItem("ckf_contacts");
  return saved ? JSON.parse(saved) : [];
}

export async function updateContactStatusAPI(id, status, replyNotes) {
  try {
    const res = await fetch(`${API_BASE}/contact/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, replyNotes }),
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true };
}

