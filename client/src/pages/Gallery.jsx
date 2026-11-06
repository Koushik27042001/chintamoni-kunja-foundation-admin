import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Play, X, HeartHandshake, Sparkles, Filter } from 'lucide-react'
import { getGalleryAPI, deduplicateGalleryItems } from '../services/api'

// Foundation Baseline Heritage Media
const INITIAL_ASSETS = [
  {
    _id: "init-1",
    title: "Krishna's Golden Riverside Devotion",
    desc: "Sacred pastimes on the consecrated banks of Bhagirathi river in Nabadwip Dham.",
    src: "/assets/Krishna’s Golden Riverside Devotion.png",
    type: "image",
    category: "River Ghats & Dham",
  },
  {
    _id: "init-2",
    title: "Radha & Krishna by the Riverside",
    desc: "Divine love of Sri Sri Radha-Madhava amidst the lush groves of Bengal.",
    src: "/assets/Radha and Krishna by the Riverside.png",
    type: "image",
    category: "Temple & Altar",
  },
  {
    _id: "init-3",
    title: "Opulent Gaura-Nitai & Madan Mohan Altar",
    desc: "Venerable deities worshipped through centuries in the historic sanctuary.",
    src: "/assets/Opulent Gaura-Nitai and Madan Mohan Altar.png",
    type: "image",
    category: "Temple & Altar",
  },
  {
    _id: "init-4",
    title: "Nabadwip Dham Temple in Sunshine",
    desc: "Architectural heritage of Sri Sri Chintamoni Kunja founded in 1809.",
    src: "/assets/Nabadwip Dham Temple in Sunshine.png",
    type: "image",
    category: "River Ghats & Dham",
  },
  {
    _id: "init-5",
    title: "Golden Kirtan by the Sacred Ghats",
    desc: "Ecstatic chanting of the holy names echoing across the sacred waters.",
    src: "/assets/Golden Kirtan by the Sacred Ghats.png",
    type: "image",
    category: "Devotees & Kirtan",
  },
  {
    _id: "init-6",
    title: "Devotional Procession Before Lord Jagannath",
    desc: "Festive Rath Yatra and sankirtan processions in holy Nabadwip.",
    src: "/assets/Devotional Procession Before Lord Jagannath.png",
    type: "image",
    category: "Festivals & Utsavs",
  },
  {
    _id: "init-7",
    title: "Sacred Temple Interaction & Parikrama",
    desc: "Immersive video capturing devotional interactions and sacred moments at the Kunja.",
    src: "/assets/interaction-video.mp4",
    type: "video",
    category: "Videos",
  },
];

const CATEGORIES = [
  "All",
  "Temple & Altar",
  "Festivals & Utsavs",
  "Anna Daan Seva",
  "River Ghats & Dham",
  "Devotees & Kirtan",
  "Videos",
];

const getInitialCleanAssets = () => {
  try {
    const deletedSet = new Set(JSON.parse(localStorage.getItem("ckf_deleted_gallery_ids") || "[]"));
    const local = JSON.parse(localStorage.getItem("ckf_gallery") || "[]");
    const base = local.length > 0 ? local : INITIAL_ASSETS;
    const clean = base
      .filter((item) => {
        const id = item._id || item.id;
        const title = (item.title || "").toLowerCase().trim();
        const src = (item.image || item.src || "").trim();
        return !deletedSet.has(id) && !deletedSet.has(title) && !deletedSet.has(src);
      })
      .map((item) => ({
        _id: item._id || item.id || item.title,
        title: item.title,
        desc: item.caption || item.desc || "Sacred darshan at Sri Sri Chintamoni Kunja Foundation.",
        src: item.image || item.src,
        category: item.category || "Temple & Altar",
        type: item.type || ((item.image || item.src)?.endsWith(".mp4") ? "video" : "image"),
        isDynamic: Boolean(item.isDynamic || (item._id && item._id.length > 10) || item.public_id),
      }));
    return deduplicateGalleryItems(clean);
  } catch (e) {
    return INITIAL_ASSETS;
  }
};

export default function Gallery() {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaList, setMediaList] = useState(getInitialCleanAssets);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // Load live gallery items from database / API / localStorage
  const loadGalleryItems = async () => {
    try {
      setLoading(true);
      const dynamicItems = await getGalleryAPI();
      const deletedSet = new Set(JSON.parse(localStorage.getItem("ckf_deleted_gallery_ids") || "[]"));

      const sourceList = dynamicItems && Array.isArray(dynamicItems) && dynamicItems.length > 0
        ? dynamicItems
        : INITIAL_ASSETS;

      const normalized = sourceList
        .filter((item) => {
          const id = item._id || item.id;
          const title = (item.title || "").toLowerCase().trim();
          const src = (item.image || item.src || "").trim();
          return !deletedSet.has(id) && !deletedSet.has(title) && !deletedSet.has(src);
        })
        .map((item) => ({
          _id: item._id || item.id || item.title,
          title: item.title,
          desc: item.caption || item.desc || "Sacred darshan at Sri Sri Chintamoni Kunja Foundation.",
          src: item.image || item.src,
          category: item.category || "Temple & Altar",
          type: item.type || ((item.image || item.src)?.endsWith(".mp4") ? "video" : "image"),
          isDynamic: Boolean(item.isDynamic || (item._id && item._id.length > 10) || item.public_id),
        }));

      // Also ensure baseline INITIAL_ASSETS fill any missing baseline photos that haven't been deleted
      const seenTitles = new Set(normalized.map((n) => n.title.toLowerCase().trim()));
      const seenSrcs = new Set(normalized.map((n) => n.src.trim()));
      const missingInitial = INITIAL_ASSETS
        .filter((init) => {
          const id = init._id;
          const title = (init.title || "").toLowerCase().trim();
          const src = (init.src || "").trim();
          return !deletedSet.has(id) && !deletedSet.has(title) && !deletedSet.has(src) && !seenTitles.has(title) && !seenSrcs.has(src);
        })
        .map((init) => ({ ...init, isDynamic: false }));

      const combined = deduplicateGalleryItems([...normalized, ...missingInitial]);
      setMediaList(combined);
    } catch (err) {
      console.warn("Failed to load dynamic gallery items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGalleryItems();

    // Listen for live update events dispatched whenever admin uploads a photo
    const handleGalleryUpdated = () => {
      loadGalleryItems();
    };

    window.addEventListener("ckf_gallery_updated", handleGalleryUpdated);
    window.addEventListener("storage", handleGalleryUpdated);

    return () => {
      window.removeEventListener("ckf_gallery_updated", handleGalleryUpdated);
      window.removeEventListener("storage", handleGalleryUpdated);
    };
  }, []);

  // Filter items by category
  const filteredItems = mediaList.filter((item) => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Videos") return item.type === "video";
    return item.category === activeCategory;
  });

  return (
    <div className="min-h-screen bg-[#FFF9ED] text-[#39251D]">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#39251D] via-[#4A2D23] to-[#39251D] py-20 text-center text-[#FFF9ED]">
        <div className="relative z-10 mx-auto max-w-4xl px-4">
          <span className="inline-block rounded-full border border-[#C59A52]/40 bg-[#C59A52]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[2px] text-[#E3B873]">
            Dham Darshan
          </span>
          <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Sacred Photo &amp; Video Gallery
          </h1>
          <p className="mt-3 font-serif text-xl italic text-[#C59A52] sm:text-2xl">
            Sri Sri Chintamoni Kunja Foundation • Nabadwip Dham
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#EDE0C9]/80 sm:text-base">
            Glimpses of sacred deity worship, historical architecture, vibrant sankirtan festivals, and devotional life in the holy dham.
          </p>

          {/* Active Visual Count Badge */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C59A52]/30 bg-black/40 px-3.5 py-1 text-xs text-[#E8B94F]">
              <Sparkles size={13} className="text-[#E8B94F]" />
              <span>{mediaList.length} Curated Sacred Visuals</span>
            </span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#971010] via-[#C59A52] to-[#971010]" />
      </section>

      {/* Category Filter Pills */}
      <section className="border-b border-[#C59A52]/20 bg-[#FFF4DC]/60 py-4 px-4 sticky top-16 z-20 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#78372B]">
            <Filter size={14} className="text-[#C59A52]" />
            <span>Filter Darshan:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                  activeCategory === cat
                    ? "bg-[#971515] text-white shadow-sm"
                    : "bg-white/80 text-[#54382B] hover:bg-[#78372B] hover:text-white border border-[#C59A52]/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#C59A52]/40 p-12 text-center">
            <p className="font-serif text-lg text-[#78372B]">No sacred visuals found under "{activeCategory}".</p>
            <button
              onClick={() => setActiveCategory("All")}
              className="mt-3 text-xs font-bold text-[#971515] underline"
            >
              View All Photos &amp; Videos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item, idx) => (
              <div
                key={item._id || idx}
                onClick={() => setSelectedMedia(item)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#C59A52]/50 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#C59A52] hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/5">
                  {item.type === 'video' ? (
                    <div className="relative h-full w-full">
                      <video
                        src={item.src}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/20">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D98232] text-white shadow-lg transition-transform group-hover:scale-110">
                          <Play size={24} className="ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.src}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback if local relative image path fails
                        if (!e.target.src.includes("assets")) {
                          e.target.src = "/assets/Opulent Gaura-Nitai and Madan Mohan Altar.png";
                        }
                      }}
                    />
                  )}
                  <span className="absolute left-3 top-3 rounded-md bg-[#39251D]/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#E3B873] backdrop-blur-sm">
                    {item.category}
                  </span>
                  {item.isDynamic && (
                    <span className="absolute right-3 top-3 rounded-md bg-emerald-900/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200 backdrop-blur-sm border border-emerald-500/30">
                      Recent Upload
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-serif text-lg font-bold text-[#78372B] transition-colors group-hover:text-[#971515]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#54382B]/85 line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Row */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[#EDE0C9] pt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#78372B]/30 px-6 py-2.5 text-sm font-semibold text-[#78372B] transition-colors hover:bg-[#78372B] hover:text-[#FFF9ED]"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <Link
            to="/donate"
            className="inline-flex items-center gap-2 rounded-full bg-[#D98232] px-7 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#BD6D22]"
          >
            <HeartHandshake size={18} />
            Support Temple Restoration
          </Link>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-[#C59A52] bg-[#2D1B14] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/90"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="max-h-[70vh] overflow-hidden bg-black flex items-center justify-center">
              {selectedMedia.type === 'video' ? (
                <video
                  src={selectedMedia.src}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[70vh] w-full"
                />
              ) : (
                <img
                  src={selectedMedia.src}
                  alt={selectedMedia.title}
                  className="max-h-[70vh] w-auto object-contain"
                />
              )}
            </div>

            <div className="p-6 text-[#FFF9ED]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#E3B873]">
                {selectedMedia.category}
              </span>
              <h2 className="mt-1 font-serif text-2xl font-bold">
                {selectedMedia.title}
              </h2>
              <p className="mt-2 text-sm text-[#EDE0C9]/85">
                {selectedMedia.desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
