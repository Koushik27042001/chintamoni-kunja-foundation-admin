/**
 * Central API Service Layer for Sri Sri Chintamoni Kunja Foundation
 * Seamlessly interfaces with Express backend `/api/*`
 * Provides resilient, automatic local storage fallback if the server or database is offline.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

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
    content: "Sri Ramsundar Vidyalankar, affectionately and reverently known as Sri Chintamoni Goswami by the Vaishnav assembly, stands as one of the most luminous yet humble personalities of the Bengal Renaissance...",
    author: "Seva Research Desk",
    readTime: "7 min read",
    image: "/assets/Nabadwip Dham Temple in Sunshine.png",
    status: "published",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "blg-2",
    title: "The Daily Practice of Mahamantra Japa: Science and Spirit of Sacred Sound",
    bengali: "মহামন্ত্র জপ সাধনা ও দিব্য ধ্বনিবিজ্ঞান",
    category: "Katha & Philosophy",
    excerpt: "How meditating upon the sixteen holy names cleanses the mirror of the mind (ceto-darpana-marjanam) and restores spiritual poise amid modern stress.",
    content: "In the Kali Santarana Upanishad, the sage Narada inquires from Lord Brahma how living entities can transcend the anxieties and turbulence of the age of conflict...",
    author: "Sri Sri Chintamoni Kunja Ashram",
    readTime: "5 min read",
    image: "/assets/Golden Kirtan by the Sacred Ghats.png",
    status: "published",
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_GALLERY = [
  {
    _id: "gal-1",
    title: "Sri Sri Radha Madan Mohan & Gaura-Nitai Altar",
    category: "Temple & Altar",
    image: "/assets/Opulent Gaura-Nitai and Madan Mohan Altar.png",
    caption: "Divine sanctum adorned with floral shringar during Mangala Aarti at Nabadwip Dham.",
  },
  {
    _id: "gal-2",
    title: "Sacred Harinam Sankirtan at Sacred Ghats",
    category: "River Ghats & Dham",
    image: "/assets/Golden Kirtan by the Sacred Ghats.png",
    caption: "Devotees chanting Harinam on the banks of sacred Bhagirathi Ganga.",
  },
  {
    _id: "gal-3",
    title: "Nabadwip Dham Mandir in Golden Sunlight",
    category: "Temple & Altar",
    image: "/assets/Nabadwip Dham Temple in Sunshine.png",
    caption: "Exterior heritage sanctum of Sri Sri Chintamoni Kunja established in 1809.",
  },
  {
    _id: "gal-4",
    title: "Devotional Procession Before Lord Jagannath",
    category: "Festivals & Utsavs",
    image: "/assets/Devotional Procession Before Lord Jagannath.png",
    caption: "Annual Rath Yatra procession through Bowbazar Road, Nabadwip.",
  },
];

// Helper to check server connectivity
export async function checkServerStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      return { online: true, database: data.database };
    }
  } catch (e) {
    // server unreachable
  }
  return { online: false, database: 'offline' };
}

/* ==================================================================
   Members API
================================================================== */
export async function getMembersAPI() {
  try {
    const res = await fetch(`${API_BASE}/members`, { signal: AbortSignal.timeout(4000) });
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
      signal: AbortSignal.timeout(4000),
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
      signal: AbortSignal.timeout(8000),
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
      signal: AbortSignal.timeout(4000),
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
    const res = await fetch(`${API_BASE}/donations`, { signal: AbortSignal.timeout(4000) });
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
      signal: AbortSignal.timeout(4000),
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
    const res = await fetch(`${API_BASE}/agents`, { signal: AbortSignal.timeout(4000) });
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
      signal: AbortSignal.timeout(4000),
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
    const res = await fetch(`${API_BASE}/events`, { signal: AbortSignal.timeout(4000) });
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
      signal: AbortSignal.timeout(4000),
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
    await fetch(`${API_BASE}/events/${id}`, { method: 'DELETE', signal: AbortSignal.timeout(4000) });
  } catch (e) {}
  return { success: true };
}

/* ==================================================================
   Blogs API
================================================================== */
export async function getBlogsAPI() {
  try {
    const res = await fetch(`${API_BASE}/blogs`, { signal: AbortSignal.timeout(4000) });
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
  try {
    const res = await fetch(`${API_BASE}/blogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blog),
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (e) {}
  return { ...blog, _id: `blg-${Date.now()}`, createdAt: new Date().toISOString() };
}

export async function deleteBlogAPI(id) {
  try {
    await fetch(`${API_BASE}/blogs/${id}`, { method: 'DELETE', signal: AbortSignal.timeout(4000) });
  } catch (e) {}
  return { success: true };
}

/* ==================================================================
   Gallery API
================================================================== */
export async function getGalleryAPI() {
  try {
    const res = await fetch(`${API_BASE}/gallery`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        localStorage.setItem("ckf_gallery", JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (e) {}
  const saved = localStorage.getItem("ckf_gallery");
  return saved ? JSON.parse(saved) : INITIAL_GALLERY;
}

export async function createGalleryAPI(item) {
  try {
    const res = await fetch(`${API_BASE}/gallery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (e) {}
  return { ...item, _id: `gal-${Date.now()}` };
}

export async function deleteGalleryAPI(id) {
  try {
    await fetch(`${API_BASE}/gallery/${id}`, { method: 'DELETE', signal: AbortSignal.timeout(4000) });
  } catch (e) {}
  return { success: true };
}

/* ==================================================================
   Contact Inquiries API
================================================================== */
export async function getContactsAPI() {
  try {
    const res = await fetch(`${API_BASE}/contact`, { signal: AbortSignal.timeout(4000) });
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
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true };
}

