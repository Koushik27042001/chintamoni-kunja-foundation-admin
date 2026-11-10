import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Users,
  Layers,
  Truck,
  FileCheck,
  Plus,
  Download,
  UserPlus,
} from 'lucide-react';
import {
  getBatchesAPI,
  createBatchAPI,
  toggleBatchStatusAPI,
  getBooksAPI,
  proposeBooksAPI,
  getAlternativeBookAPI,
  confirmIssueBooksAPI,
  getDispatchesAPI,
  logDispatchAPI,
  getReturnsAPI,
  processReturnAPI,
  getSettlementsAPI,
  getSettlementPreviewAPI,
  confirmSettlementAPI,
  getDevoteesAPI,
  createDevoteeAPI,
  downloadExcelReportAPI,
} from '../../services/devoteeDeskApi';

export default function DevoteeDeskOperations() {
  const [subTab, setSubTab] = useState('devotees'); // 'devotees', 'inventory', 'issue', 'returns', 'settlements', 'dispatch'

  // Devotees state
  const [devotees, setDevotees] = useState([]);
  const [devoteeSearch, setDevoteeSearch] = useState('');
  const [devoteeStatusFilter, setDevoteeStatusFilter] = useState('All');
  const [showCreateDevoteeModal, setShowCreateDevoteeModal] = useState(false);
  const [newDevotee, setNewDevotee] = useState({
    memberId: '',
    name: '',
    gender: 'Male',
    mobile1: '',
    mobile2: '',
    email: '',
    cityVillage: '',
    district: 'Nadia',
    state: 'West Bengal',
    pinCode: '741302',
    nextYearInterest: 'Yes',
    remarks: '',
  });

  // Batches & Books state
  const [batches, setBatches] = useState([]);
  const [books, setBooks] = useState([]);
  const [bookFilterStatus, setBookFilterStatus] = useState('All');
  const [bookSearch, setBookSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Create Batch Form state
  const [showCreateBatchModal, setShowCreateBatchModal] = useState(false);
  const [newBatch, setNewBatch] = useState({
    batchName: '',
    batchPrefix: 'CKF-B1',
    pagesPerBook: 100,
    startBookNumber: 1,
    endBookNumber: 50,
    startBillNumber: 1,
    endBillNumber: 5000,
    remarks: '',
  });

  // Issue Books Form state
  const [issueForm, setIssueForm] = useState({
    memberId: '',
    quantity: 1,
    batchName: '',
  });
  const [proposedData, setProposedData] = useState(null);
  const [selectedBookNumbers, setSelectedBookNumbers] = useState([]);

  // Return Form state
  const [returnMemberId, setReturnMemberId] = useState('');
  const [returnReason, setReturnReason] = useState('Address Not Found');
  const [allocatedDevoteeBooks, setAllocatedDevoteeBooks] = useState([]);
  const [selectedReturnBooks, setSelectedReturnBooks] = useState([]);
  const [returnsHistory, setReturnsHistory] = useState([]);

  // Settlement Form state
  const [settleMemberId, setSettleMemberId] = useState('');
  const [settlementPreview, setSettlementPreview] = useState(null);
  const [usedPages, setUsedPages] = useState('');
  const [nextYearInterest, setNextYearInterest] = useState('Yes');
  const [settlementsHistory, setSettlementsHistory] = useState([]);

  // Dispatch Form state
  const [dispatchForm, setDispatchForm] = useState({
    memberId: '',
    itemDispatched: 'Bill Books',
    dispatchMode: 'Post',
    courierName: 'India Post Speed Post',
    trackingIdOrReceiver: '',
    batchName: '',
    remarks: '',
  });
  const [dispatches, setDispatches] = useState([]);

  useEffect(() => {
    loadDevotees();
    loadBatches();
    loadBooks();
    loadDispatches();
    loadReturns();
    loadSettlements();
  }, [bookFilterStatus, devoteeStatusFilter]);

  const loadDevotees = async () => {
    try {
      const params = {};
      if (devoteeStatusFilter !== 'All') params.status = devoteeStatusFilter;
      if (devoteeSearch.trim()) params.q = devoteeSearch.trim();
      const res = await getDevoteesAPI(params);
      if (res.success) setDevotees(res.data);
    } catch {
      // Non-fatal
    }
  };

  const loadBatches = async () => {
    try {
      const res = await getBatchesAPI();
      if (res.success) setBatches(res.data);
    } catch {
      // Non-fatal
    }
  };

  const loadBooks = async () => {
    try {
      const params = {};
      if (bookFilterStatus !== 'All') params.status = bookFilterStatus;
      if (bookSearch.trim()) params.q = bookSearch.trim();
      const res = await getBooksAPI(params);
      if (res.success) setBooks(res.data);
    } catch {
      // Non-fatal
    }
  };

  const loadDispatches = async () => {
    try {
      const res = await getDispatchesAPI();
      if (res.success) setDispatches(res.data);
    } catch {
      // Non-fatal
    }
  };

  const loadReturns = async () => {
    try {
      const res = await getReturnsAPI();
      if (res.success) setReturnsHistory(res.data);
    } catch {
      // Non-fatal
    }
  };

  const loadSettlements = async () => {
    try {
      const res = await getSettlementsAPI();
      if (res.success) setSettlementsHistory(res.data);
    } catch {
      // Non-fatal
    }
  };

  const handleCreateDevotee = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await createDevoteeAPI(newDevotee);
      if (res.success) {
        setSuccessMsg(`Registered Devotee ${res.data.name} (${res.data.memberId}).`);
        setShowCreateDevoteeModal(false);
        setNewDevotee({
          memberId: '',
          name: '',
          gender: 'Male',
          mobile1: '',
          mobile2: '',
          email: '',
          cityVillage: '',
          district: 'Nadia',
          state: 'West Bengal',
          pinCode: '741302',
          nextYearInterest: 'Yes',
          remarks: '',
        });
        loadDevotees();
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await createBatchAPI(newBatch);
      if (res.success) {
        setSuccessMsg(res.message);
        setShowCreateBatchModal(false);
        loadBatches();
        loadBooks();
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleToggleBatch = async (batchId) => {
    try {
      await toggleBatchStatusAPI(batchId);
      loadBatches();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleProposeBooks = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await proposeBooksAPI(issueForm.memberId, issueForm.quantity, issueForm.batchName);
      if (res.success) {
        setProposedData(res);
        setSelectedBookNumbers(res.proposedBooks.map((b) => b.bookNumber));
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleReplaceBook = async (bookNumberToReplace) => {
    setErrorMsg('');
    try {
      const currentExcluded = selectedBookNumbers.join(',');
      const res = await getAlternativeBookAPI(proposedData.batchName, currentExcluded);
      if (res.success && res.data) {
        setSelectedBookNumbers((prev) =>
          prev.map((b) => (b === bookNumberToReplace ? res.data.bookNumber : b))
        );
      }
    } catch (err) {
      setErrorMsg(`Replacement failed: ${err.message}`);
    }
  };

  const handleConfirmIssue = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await confirmIssueBooksAPI(proposedData.devotee.memberId, selectedBookNumbers);
      if (res.success) {
        setSuccessMsg(res.message);
        setProposedData(null);
        setSelectedBookNumbers([]);
        setIssueForm({ memberId: '', quantity: 1, batchName: '' });
        loadBatches();
        loadBooks();
        loadDevotees();
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleLookupReturnBooks = async () => {
    setErrorMsg('');
    try {
      const res = await getBooksAPI({
        devoteeId: returnMemberId.trim().toUpperCase(),
        status: 'Allocated',
      });
      if (res.success) {
        setAllocatedDevoteeBooks(res.data);
        setSelectedReturnBooks(res.data.map((b) => b.bookNumber));
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleProcessReturn = async () => {
    if (selectedReturnBooks.length === 0) {
      setErrorMsg('Please select at least one book to return.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await processReturnAPI({
        memberId: returnMemberId.trim().toUpperCase(),
        bookNumbers: selectedReturnBooks,
        returnReason,
      });
      if (res.success) {
        setSuccessMsg(res.message);
        setAllocatedDevoteeBooks([]);
        setSelectedReturnBooks([]);
        setReturnMemberId('');
        loadBatches();
        loadBooks();
        loadReturns();
        loadDevotees();
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleLookupSettlement = async () => {
    setErrorMsg('');
    try {
      const res = await getSettlementPreviewAPI(settleMemberId.trim().toUpperCase());
      if (res.success) {
        setSettlementPreview(res);
        setUsedPages('');
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleConfirmSettlement = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await confirmSettlementAPI({
        memberId: settleMemberId.trim().toUpperCase(),
        usedPages: parseInt(usedPages, 10),
        nextYearInterest,
      });
      if (res.success) {
        setSuccessMsg(res.message);
        setSettlementPreview(null);
        setSettleMemberId('');
        loadBatches();
        loadBooks();
        loadSettlements();
        loadDevotees();
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleLogDispatch = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await logDispatchAPI(dispatchForm);
      if (res.success) {
        setSuccessMsg(res.message);
        setDispatchForm({
          memberId: '',
          itemDispatched: 'Bill Books',
          dispatchMode: 'Post',
          courierName: 'India Post Speed Post',
          trackingIdOrReceiver: '',
          batchName: '',
          remarks: '',
        });
        loadDispatches();
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="rounded-2xl border border-[#C59A52]/50 bg-[#09090b] p-5 sm:p-6 shadow-2xl space-y-6 ring-1 ring-inset ring-white/[0.04]">
      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#C59A52]/35 bg-[#18181b] p-2.5 text-xs font-bold">
        {[
          { id: 'devotees', label: 'Devotees Directory', icon: Users },
          { id: 'inventory', label: 'Inventory & Batches', icon: Layers },
          { id: 'issue', label: 'Issue Bill Books', icon: BookOpen },
          { id: 'returns', label: 'Return / Bounce', icon: RotateCcw },
          { id: 'settlements', label: 'Final Settlement (Admin)', icon: FileCheck },
          { id: 'dispatch', label: 'Dispatch Register', icon: Truck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSubTab(tab.id);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition ${
                subTab === tab.id
                  ? 'bg-gradient-to-r from-[#38bdf8] to-[#8b5cf6] text-black shadow-md'
                  : 'text-gray-300 hover:bg-[#27272a] hover:text-white'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-500/50 p-4 text-xs font-semibold text-red-300">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/40 border border-emerald-500/50 p-4 text-xs font-semibold text-emerald-300">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SUBTAB 0: DEVOTEES DIRECTORY */}
      {subTab === 'devotees' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-zinc-600/80 bg-[#18181b] p-5 shadow-xl">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Users size={18} className="text-[#38bdf8]" /> DevoteeDesk Member Registry
              </h3>
              <p className="text-xs text-gray-400">
                Register devotees with unique Member IDs for book allocations, dispatches, returns & settlements.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => downloadExcelReportAPI('devotees')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-600/80 bg-[#27272a] px-3.5 py-2 text-xs font-bold text-gray-200 hover:bg-white hover:text-black transition"
              >
                <Download size={14} /> Export Excel
              </button>
              <button
                type="button"
                onClick={() => setShowCreateDevoteeModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#8b5cf6] px-4 py-2 text-xs font-bold text-black shadow hover:brightness-110"
              >
                <UserPlus size={15} /> Register Devotee
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-600/80 bg-[#18181b] p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-gray-400">Showing {devotees.length} devotee(s)</span>
              <div className="flex items-center gap-2">
                <select
                  value={devoteeStatusFilter}
                  onChange={(e) => setDevoteeStatusFilter(e.target.value)}
                  className="rounded-xl border border-zinc-600/80 bg-[#27272a] px-3 py-1.5 text-xs text-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Deceased">Deceased</option>
                </select>
                <input
                  type="text"
                  placeholder="Search ID, Name or Mobile..."
                  value={devoteeSearch}
                  onChange={(e) => setDevoteeSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadDevotees()}
                  className="rounded-xl border border-zinc-600/80 bg-[#27272a] px-3 py-1.5 text-xs text-white placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={loadDevotees}
                  className="rounded-xl bg-[#3f3f46] px-3 py-1.5 text-xs font-bold text-white hover:bg-white hover:text-black transition"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-600/80">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#27272a] text-gray-100 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Member ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Mobile</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Allocated / Settled</th>
                    <th className="p-3">Next-Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3f3f46]/40">
                  {devotees.map((d) => (
                    <tr key={d._id} className="hover:bg-white/5 transition">
                      <td className="p-3 font-mono font-bold text-[#38bdf8]">{d.memberId}</td>
                      <td className="p-3 font-semibold text-white">{d.name}</td>
                      <td className="p-3 font-mono">{d.mobile1}</td>
                      <td className="p-3">
                        {[d.cityVillage, d.district].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            d.status === 'Active'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : d.status === 'Inactive'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono">
                        <span className="text-amber-400">{d.allocatedBooksCount}</span> /{' '}
                        <span className="text-purple-400">{d.settledBooksCount}</span>
                      </td>
                      <td className="p-3">{d.nextYearInterest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 1: INVENTORY & PRINT BATCHES */}
      {subTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-zinc-600/80 bg-[#18181b] p-5 shadow-xl">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Layers size={18} className="text-[#38bdf8]" /> Print Batches Overview
              </h3>
              <p className="text-xs text-gray-400">
                Each print batch auto-generates physical book serials and printed receipt number ranges.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateBatchModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#8b5cf6] px-4 py-2.5 text-xs font-bold text-black shadow hover:brightness-110"
            >
              <Plus size={16} /> Add New Print Batch
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((b) => (
              <div
                key={b._id}
                className="rounded-2xl border border-zinc-600/80 bg-[#18181b] p-5 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-[#38bdf8]">{b.batchName}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleBatch(b._id)}
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition ${
                      b.isActive
                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {b.isActive ? 'Active (Click to Pause)' : 'Paused (Click to Enable)'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase">Book Range:</span>
                    <p className="font-mono font-semibold">
                      {b.batchPrefix}-{b.startBookNumber} to {b.endBookNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase">Bill Range:</span>
                    <p className="font-mono font-semibold">
                      {b.startBillNumber} – {b.endBillNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase">Available Stock:</span>
                    <p className="font-bold text-[#10b981] text-sm">{b.availableBooks} books</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase">Allocated / Settled:</span>
                    <p className="font-semibold text-gray-300">
                      {b.allocatedBooks} / {b.settledBooks}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-zinc-600/80 bg-[#18181b] p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold text-white text-sm">Physical Bill Books Inventory</h3>
              <div className="flex items-center gap-2">
                <select
                  value={bookFilterStatus}
                  onChange={(e) => setBookFilterStatus(e.target.value)}
                  className="rounded-xl border border-zinc-600/80 bg-[#27272a] px-3 py-1.5 text-xs text-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="Available">Available Only</option>
                  <option value="Allocated">Allocated Only</option>
                  <option value="Settled">Settled Only</option>
                </select>
                <input
                  type="text"
                  placeholder="Search book or devotee ID..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadBooks()}
                  className="rounded-xl border border-zinc-600/80 bg-[#27272a] px-3 py-1.5 text-xs text-white placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={loadBooks}
                  className="rounded-xl bg-[#3f3f46] px-3 py-1.5 text-xs font-bold text-white hover:bg-white hover:text-black transition"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-600/80">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#27272a] text-gray-100 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Book Serial</th>
                    <th className="p-3">Batch</th>
                    <th className="p-3">Receipt Range</th>
                    <th className="p-3">Total Pages</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Current Devotee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3f3f46]/40">
                  {books.map((bk) => (
                    <tr key={bk._id} className="hover:bg-white/5 transition">
                      <td className="p-3 font-mono font-bold text-[#38bdf8]">{bk.bookNumber}</td>
                      <td className="p-3">{bk.batchName}</td>
                      <td className="p-3 font-mono">
                        {bk.startBillNumber} – {bk.endBillNumber}
                      </td>
                      <td className="p-3 font-mono">{bk.totalPages}</td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            bk.status === 'Available'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : bk.status === 'Allocated'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-purple-500/20 text-purple-400'
                          }`}
                        >
                          {bk.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {bk.currentDevoteeId ? (
                          <span className="font-semibold text-white">
                            {bk.currentDevoteeName} ({bk.currentDevoteeId})
                          </span>
                        ) : (
                          <span className="text-gray-500 italic">None (In Office Stock)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ISSUE BOOKS WORKFLOW */}
      {subTab === 'issue' && (
        <div className="rounded-2xl border border-zinc-600/80 bg-[#18181b] p-6 shadow-xl space-y-6 max-w-3xl mx-auto">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <BookOpen size={18} className="text-[#38bdf8]" /> Issue Bill Books to Devotee
            </h3>
            <p className="text-xs text-gray-400">
              Workflow: Devotee check → Stock availability check → Sequential book proposal → Replacement support → Final allocation.
            </p>
          </div>

          <form onSubmit={handleProposeBooks} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300">
                Devotee Member ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. M-1001"
                value={issueForm.memberId}
                onChange={(e) => setIssueForm({ ...issueForm, memberId: e.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-xs text-white uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300">
                Quantity <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={issueForm.quantity}
                onChange={(e) => setIssueForm({ ...issueForm, quantity: e.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300">Batch Filter</label>
              <select
                value={issueForm.batchName}
                onChange={(e) => setIssueForm({ ...issueForm, batchName: e.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-xs text-white"
              >
                <option value="">Auto (Active Batch)</option>
                {batches.map((b) => (
                  <option key={b.batchName} value={b.batchName}>
                    {b.batchName} ({b.availableBooks} Avail)
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#8b5cf6] py-3 text-xs font-bold text-black shadow hover:brightness-110"
              >
                Check Stock & Propose Physical Books
              </button>
            </div>
          </form>

          {proposedData && (
            <div className="rounded-2xl border border-[#38bdf8]/40 bg-[#121215] p-5 space-y-4">
              <div className="border-b border-zinc-600/80 pb-3">
                <span className="text-[10px] uppercase font-bold text-[#38bdf8]">
                  Allocation Proposal for:
                </span>
                <h4 className="text-base font-bold text-white">
                  {proposedData.devotee.name} ({proposedData.devotee.memberId})
                </h4>
                <p className="text-xs text-gray-400">
                  Mobile: {proposedData.devotee.mobile} • Status: {proposedData.devotee.status} • Batch:{' '}
                  {proposedData.batchName}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Proposed Sequential Books (You can replace individual books if needed):
                </label>
                <div className="space-y-2">
                  {selectedBookNumbers.map((num) => (
                    <div
                      key={num}
                      className="flex items-center justify-between rounded-xl bg-[#27272a] p-3 text-xs border border-zinc-600/80"
                    >
                      <span className="font-mono font-bold text-white">{num}</span>
                      <button
                        type="button"
                        onClick={() => handleReplaceBook(num)}
                        className="rounded-lg border border-[#f59e0b] px-2.5 py-1 text-[11px] font-bold text-[#f59e0b] hover:bg-[#f59e0b] hover:text-black transition"
                      >
                        Replace with Next Available
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmIssue}
                className="w-full rounded-xl bg-gradient-to-r from-[#10b981] to-[#38bdf8] py-3 text-xs font-bold text-black shadow hover:brightness-110"
              >
                Confirm Allocation of {selectedBookNumbers.length} Book(s)
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: RETURN / BOUNCE WORKFLOW */}
      {subTab === 'returns' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-600/80 bg-[#18181b] p-6 shadow-xl space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <RotateCcw size={18} className="text-[#f59e0b]" /> Return & Bounce Management
              </h3>
              <p className="text-xs text-gray-400">
                Rule: Deceased reason → Status changed to Deceased; All other reasons → Status changed to Inactive. Books return to Available.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Devotee Member ID..."
                value={returnMemberId}
                onChange={(e) => setReturnMemberId(e.target.value)}
                className="flex-1 rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-xs text-white uppercase font-mono"
              />
              <button
                type="button"
                onClick={handleLookupReturnBooks}
                className="rounded-xl bg-[#38bdf8] px-4 py-2.5 text-xs font-bold text-black hover:brightness-110"
              >
                Lookup Allocated Books
              </button>
            </div>

            {allocatedDevoteeBooks.length > 0 && (
              <div className="space-y-4 rounded-2xl border border-zinc-600/80 bg-[#121215] p-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">
                    Select Books to Return to Office Stock:
                  </label>
                  <div className="space-y-2">
                    {allocatedDevoteeBooks.map((bk) => {
                      const checked = selectedReturnBooks.includes(bk.bookNumber);
                      return (
                        <label
                          key={bk.bookNumber}
                          className="flex items-center gap-3 rounded-xl bg-[#27272a] p-3 text-xs border border-zinc-600/80 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedReturnBooks([...selectedReturnBooks, bk.bookNumber]);
                              } else {
                                setSelectedReturnBooks(selectedReturnBooks.filter((n) => n !== bk.bookNumber));
                              }
                            }}
                            className="rounded text-[#38bdf8]"
                          />
                          <span className="font-mono font-bold text-white">{bk.bookNumber}</span>
                          <span className="text-gray-400">
                            (Bills: {bk.startBillNumber}–{bk.endBillNumber})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300">
                    Return Reason <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-xs text-white"
                  >
                    <option value="Address Not Found">Address Not Found</option>
                    <option value="Mobile Off / Unable to reach">Mobile Off / Unable to reach</option>
                    <option value="Refused to Accept">Refused to Accept</option>
                    <option value="Devotee Deceased">Devotee Deceased</option>
                    <option value="Other Reason">Other Reason</option>
                  </select>
                  <p className="mt-1 text-[11px] text-amber-400">
                    {returnReason === 'Devotee Deceased'
                      ? '⚠️ Devotee status will be transitioned to "Deceased".'
                      : 'Devotee status will be transitioned to "Inactive".'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleProcessReturn}
                  className="w-full rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ef4444] py-3 text-xs font-bold text-black shadow hover:brightness-110"
                >
                  Confirm Return of {selectedReturnBooks.length} Book(s)
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-600/80 bg-[#18181b] p-5 shadow-xl">
            <h4 className="font-bold text-white text-sm mb-3">Recent Return / Bounce Logs</h4>
            <div className="overflow-x-auto rounded-xl border border-zinc-600/80">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#27272a] text-gray-100 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Member ID</th>
                    <th className="p-3">Devotee</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Books</th>
                    <th className="p-3">Status Transition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3f3f46]/40">
                  {returnsHistory.map((r) => (
                    <tr key={r._id} className="hover:bg-white/5 transition">
                      <td className="p-3">{new Date(r.returnDate).toLocaleDateString('en-IN')}</td>
                      <td className="p-3 font-mono font-bold text-[#38bdf8]">{r.memberId}</td>
                      <td className="p-3 text-white font-semibold">{r.devoteeName}</td>
                      <td className="p-3 text-amber-300">{r.returnReason}</td>
                      <td className="p-3 font-mono">{r.returnedBooks?.join(', ')}</td>
                      <td className="p-3">
                        {r.previousDevoteeStatus} → <strong>{r.newDevoteeStatus}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: FINAL SETTLEMENT WORKFLOW */}
      {subTab === 'settlements' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-600/80 bg-[#18181b] p-6 shadow-xl space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FileCheck size={18} className="text-[#8b5cf6]" /> Final Bill Book Settlement (Admin)
              </h3>
              <p className="text-xs text-gray-400">
                Formula: Total Pages = Sum(Bill To - Bill From + 1). Validated 0 ≤ Used Pages ≤ Total Pages. Books mark Settled.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Devotee Member ID..."
                value={settleMemberId}
                onChange={(e) => setSettleMemberId(e.target.value)}
                className="flex-1 rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-xs text-white uppercase font-mono"
              />
              <button
                type="button"
                onClick={handleLookupSettlement}
                className="rounded-xl bg-[#8b5cf6] px-4 py-2.5 text-xs font-bold text-white hover:brightness-110"
              >
                Calculate Pages Preview
              </button>
            </div>

            {settlementPreview && (
              <div className="space-y-4 rounded-2xl border border-[#8b5cf6]/40 bg-[#121215] p-5">
                <div className="border-b border-zinc-600/80 pb-3">
                  <span className="text-[10px] uppercase font-bold text-[#8b5cf6]">Devotee:</span>
                  <h4 className="text-base font-bold text-white">
                    {settlementPreview.devotee.name} ({settlementPreview.devotee.memberId})
                  </h4>
                  <p className="text-xs text-gray-400">
                    Allocated Books: {settlementPreview.booksCount} • Total Calculated Pages:{' '}
                    <strong className="text-white font-mono text-sm">
                      {settlementPreview.totalCalculatedPages} pages
                    </strong>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300">
                      Used Pages (Validated 0 – {settlementPreview.totalCalculatedPages}){' '}
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={settlementPreview.totalCalculatedPages}
                      required
                      value={usedPages}
                      onChange={(e) => setUsedPages(e.target.value)}
                      placeholder="Enter used pages count"
                      className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300">
                      Next-Year Seva Interest <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={nextYearInterest}
                      onChange={(e) => setNextYearInterest(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-xs text-white"
                    >
                      <option value="Yes">Yes (Confirmed)</option>
                      <option value="High Probability">High Probability</option>
                      <option value="Undecided">Undecided</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmSettlement}
                  className="w-full rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] py-3 text-xs font-bold text-white shadow hover:brightness-110"
                >
                  Confirm Final Settlement ({settlementPreview.booksCount} Books → Settled)
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-600/80 bg-[#18181b] p-5 shadow-xl">
            <h4 className="font-bold text-white text-sm mb-3">Completed Settlements Register</h4>
            <div className="overflow-x-auto rounded-xl border border-zinc-600/80">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#27272a] text-gray-100 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Settlement No</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Devotee</th>
                    <th className="p-3">Pages (Used / Total)</th>
                    <th className="p-3">Next-Year Interest</th>
                    <th className="p-3">Approved By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3f3f46]/40">
                  {settlementsHistory.map((s) => (
                    <tr key={s._id} className="hover:bg-white/5 transition">
                      <td className="p-3 font-mono font-bold text-purple-400">{s.settlementNo}</td>
                      <td className="p-3">{new Date(s.settlementDate).toLocaleDateString('en-IN')}</td>
                      <td className="p-3 text-white font-semibold">
                        {s.devoteeName} ({s.memberId})
                      </td>
                      <td className="p-3 font-mono">
                        {s.usedPages} / {s.totalCalculatedPages}
                      </td>
                      <td className="p-3">{s.nextYearInterest}</td>
                      <td className="p-3">{s.approvedByAdmin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: DISPATCH REGISTER */}
      {subTab === 'dispatch' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-600/80 bg-[#18181b] p-6 shadow-xl max-w-3xl mx-auto">
            <h3 className="font-bold text-white text-base flex items-center gap-2 mb-4">
              <Truck size={18} className="text-[#38bdf8]" /> Log Item Dispatch (Post / Courier / Hand)
            </h3>
            <form onSubmit={handleLogDispatch} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300">
                  Member ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M-1001"
                  value={dispatchForm.memberId}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, memberId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-xs text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300">Dispatch Mode</label>
                <select
                  value={dispatchForm.dispatchMode}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, dispatchMode: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-xs text-white"
                >
                  <option value="Post">Post (Speed Post / Regd)</option>
                  <option value="Courier">Courier</option>
                  <option value="Hand">Hand Delivery</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300">
                  Tracking ID or Receiver Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SP-IN123456789 or Receiver Signature"
                  value={dispatchForm.trackingIdOrReceiver}
                  onChange={(e) =>
                    setDispatchForm({ ...dispatchForm, trackingIdOrReceiver: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300">Item Dispatched</label>
                <input
                  type="text"
                  value={dispatchForm.itemDispatched}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, itemDispatched: e.target.value })}
                  placeholder="Bill Books / Invitation Letter"
                  className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-xs text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#10b981] py-3 text-xs font-bold text-black shadow hover:brightness-110"
                >
                  Save Dispatch Record
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-zinc-600/80 bg-[#18181b] p-5 shadow-xl">
            <h4 className="font-bold text-white text-sm mb-3">Recent Dispatches</h4>
            <div className="overflow-x-auto rounded-xl border border-zinc-600/80">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#27272a] text-gray-100 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Member ID</th>
                    <th className="p-3">Devotee Name</th>
                    <th className="p-3">Item</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3">Tracking / Receiver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3f3f46]/40">
                  {dispatches.map((d) => (
                    <tr key={d._id} className="hover:bg-white/5 transition">
                      <td className="p-3">
                        {new Date(d.dispatchDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-3 font-mono font-bold text-[#38bdf8]">{d.memberId}</td>
                      <td className="p-3 font-semibold text-white">{d.devoteeName}</td>
                      <td className="p-3">{d.itemDispatched}</td>
                      <td className="p-3">
                        <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold">
                          {d.dispatchMode}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-gray-300">{d.trackingIdOrReceiver}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Register Devotee */}
      {showCreateDevoteeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-lg w-full rounded-2xl border border-zinc-600/80 bg-[#18181b] p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-600/80 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <UserPlus size={18} className="text-[#38bdf8]" /> Register Devotee Member
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateDevoteeModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateDevotee} className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-300">Member ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M-1001"
                  value={newDevotee.memberId}
                  onChange={(e) => setNewDevotee({ ...newDevotee, memberId: e.target.value.toUpperCase() })}
                  className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-300">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Devotee Full Name"
                  value={newDevotee.name}
                  onChange={(e) => setNewDevotee({ ...newDevotee, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-300">Primary Mobile *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit Mobile"
                  value={newDevotee.mobile1}
                  onChange={(e) => setNewDevotee({ ...newDevotee, mobile1: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-300">Gender</label>
                <select
                  value={newDevotee.gender}
                  onChange={(e) => setNewDevotee({ ...newDevotee, gender: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-gray-300">City / Village</label>
                <input
                  type="text"
                  value={newDevotee.cityVillage}
                  onChange={(e) => setNewDevotee({ ...newDevotee, cityVillage: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-300">District</label>
                <input
                  type="text"
                  value={newDevotee.district}
                  onChange={(e) => setNewDevotee({ ...newDevotee, district: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-white"
                />
              </div>
              <div className="col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#8b5cf6] py-3 text-xs font-bold text-black shadow hover:brightness-110"
                >
                  Save Devotee Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Batch */}
      {showCreateBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-lg w-full rounded-2xl border border-zinc-600/80 bg-[#18181b] p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-600/80 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Plus size={18} className="text-[#38bdf8]" /> Add New Print Batch
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateBatchModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block font-semibold text-gray-300">Batch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026-B1-ANNADAAN"
                  value={newBatch.batchName}
                  onChange={(e) => setNewBatch({ ...newBatch, batchName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-300">Batch Prefix *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B1"
                  value={newBatch.batchPrefix}
                  onChange={(e) => setNewBatch({ ...newBatch, batchPrefix: e.target.value.toUpperCase() })}
                  className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-300">Pages Per Book</label>
                <input
                  type="number"
                  value={newBatch.pagesPerBook}
                  onChange={(e) => setNewBatch({ ...newBatch, pagesPerBook: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-300">Start Book No *</label>
                <input
                  type="number"
                  required
                  value={newBatch.startBookNumber}
                  onChange={(e) => setNewBatch({ ...newBatch, startBookNumber: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-300">End Book No *</label>
                <input
                  type="number"
                  required
                  value={newBatch.endBookNumber}
                  onChange={(e) => setNewBatch({ ...newBatch, endBookNumber: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-300">Start Bill No *</label>
                <input
                  type="number"
                  required
                  value={newBatch.startBillNumber}
                  onChange={(e) => setNewBatch({ ...newBatch, startBillNumber: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-300">End Bill No *</label>
                <input
                  type="number"
                  required
                  value={newBatch.endBillNumber}
                  onChange={(e) => setNewBatch({ ...newBatch, endBillNumber: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-600/80 bg-[#27272a] p-2.5 text-white font-mono"
                />
              </div>
              <div className="col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#8b5cf6] py-3 text-xs font-bold text-black shadow hover:brightness-110"
                >
                  Create Batch & Auto-Generate Books
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
