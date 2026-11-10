import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  AlertTriangle,
  FileSpreadsheet,
  BarChart3,
  BookOpen,
  Users,
  Package,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Download,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  aiChatAPI,
  getAIAnalyticsAPI,
  getAIInsightsAPI,
  downloadExcelReportAPI,
  executeAIActionAPI,
} from '../../services/devoteeDeskApi';

export default function AIOperationsAssistant({ onNavigateTab }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Namaste! I am your **DevoteeDesk AI Operations Manager & Data Analyst**. I have full visibility into your registered devotees, active print batches, physical bill book inventory, dispatches, and final settlements. How can I assist you with operations today?',
      suggestions: [
        'How many devotees are registered?',
        'How many books are available?',
        'Which print batch has the highest remaining stock?',
        'Show devotees with unsettled books',
        'Identify unusual database records',
        'Generate a complete operational report',
      ],
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [activeView, setActiveView] = useState('chat'); // 'chat', 'analytics', 'insights', 'reports'
  const [downloadingReport, setDownloadingReport] = useState(null);
  const [actionConfirmModal, setActionConfirmModal] = useState(null);
  const [statusBanner, setStatusBanner] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    loadLiveAnalytics();
    loadInsights();
  }, []);

  const loadLiveAnalytics = async () => {
    try {
      const res = await getAIAnalyticsAPI();
      if (res.success) setAnalytics(res.data);
    } catch {
      // Handled gracefully in UI
    }
  };

  const loadInsights = async () => {
    try {
      const res = await getAIInsightsAPI();
      if (res.success) setInsights(res.data);
    } catch {
      // Handled gracefully in UI
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMsg = {
      role: 'user',
      content: query.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await aiChatAPI(query.trim());
      if (res.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.message,
            type: res.type,
            data: res.data,
            table: res.table,
            suggestions: res.suggestions || [],
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${err.message || 'Error communicating with DevoteeDesk AI.'}`,
          isError: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = async (reportType) => {
    setDownloadingReport(reportType);
    setStatusBanner(null);
    try {
      await downloadExcelReportAPI(reportType);
      setStatusBanner({ type: 'success', text: `Downloaded ${reportType} operational Excel report.` });
    } catch (e) {
      setStatusBanner({ type: 'error', text: e.message || 'Failed to download report.' });
    } finally {
      setDownloadingReport(null);
    }
  };

  const handleExecuteAction = async () => {
    if (!actionConfirmModal) return;
    try {
      await executeAIActionAPI(actionConfirmModal.actionType, actionConfirmModal.payload);
      setStatusBanner({
        type: 'success',
        text: `Resolution "${actionConfirmModal.title}" logged. Opening Bill Books & Inventory Ops.`,
      });
      setActionConfirmModal(null);
      loadLiveAnalytics();
      loadInsights();
      if (onNavigateTab) {
        onNavigateTab('devoteedesk-ops');
      }
    } catch (e) {
      setStatusBanner({ type: 'error', text: e.message || 'Failed to execute action.' });
      setActionConfirmModal(null);
    }
  };

  return (
    <div className="rounded-3xl border border-[#3f3f46] bg-[#09090b] text-gray-100 shadow-2xl overflow-hidden min-h-[750px] flex flex-col font-sans">
      {/* Top Header Bar */}
      <div className="border-b border-[#3f3f46] bg-[#18181b] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#38bdf8] via-[#8b5cf6] to-[#ec4899] flex items-center justify-center shadow-lg text-white">
            <Sparkles size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                DevoteeDesk AI Operations Assistant
              </h2>
              <span className="rounded-full border border-[#38bdf8]/40 bg-[#38bdf8]/10 px-2 py-0.5 text-[10px] font-bold text-[#38bdf8] uppercase tracking-wider">
                MERN AI Engine
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Operations Manager, Anomaly Detector & Administrative Data Analyst
            </p>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#3f3f46] bg-[#27272a] p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveView('chat')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              activeView === 'chat'
                ? 'bg-[#38bdf8] text-black shadow-md'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>AI Chat</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('analytics');
              loadLiveAnalytics();
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              activeView === 'analytics'
                ? 'bg-[#38bdf8] text-black shadow-md'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <BarChart3 size={14} />
            <span>Analytics Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('insights');
              loadInsights();
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              activeView === 'insights'
                ? 'bg-[#f59e0b] text-black shadow-md'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <AlertTriangle size={14} />
            <span>AI Insights ({insights.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('reports')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              activeView === 'reports'
                ? 'bg-[#10b981] text-black shadow-md'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <FileSpreadsheet size={14} />
            <span>Excel Reports</span>
          </button>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('devoteedesk-ops')}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[#38bdf8] hover:bg-white/5 transition"
            >
              <span>Manage Ops</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Inline Status Banner */}
      {statusBanner && (
        <div
          className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
            statusBanner.type === 'error'
              ? 'bg-red-950/60 text-red-300 border-red-500/40'
              : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
          }`}
        >
          <span>{statusBanner.text}</span>
          <button type="button" onClick={() => setStatusBanner(null)} className="hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Main Container Views */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#09090b]">
        {/* VIEW 1: AI CHAT */}
        {activeView === 'chat' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {analytics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-3 border-b border-[#27272a] bg-[#121215] text-xs">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#38bdf8]" />
                  <span>
                    Devotees: <strong className="text-white">{analytics.devoteeAnalytics.total}</strong> ({analytics.devoteeAnalytics.active} Active)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-[#10b981]" />
                  <span>
                    Available Books:{' '}
                    <strong className="text-white">{analytics.inventoryAnalytics.available}</strong> / {analytics.inventoryAnalytics.total}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-[#f59e0b]" />
                  <span>
                    Allocated Books:{' '}
                    <strong className="text-white">{analytics.inventoryAnalytics.allocated}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#8b5cf6]" />
                  <span>
                    Settled Books:{' '}
                    <strong className="text-white">{analytics.inventoryAnalytics.settled}</strong>
                  </span>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-4xl ${
                    m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      m.role === 'user'
                        ? 'bg-[#38bdf8] text-black shadow'
                        : 'bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] text-white shadow'
                    }`}
                  >
                    {m.role === 'user' ? 'U' : <Sparkles size={14} />}
                  </div>

                  <div
                    className={`rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${
                      m.role === 'user'
                        ? 'bg-[#1e293b] text-white border border-[#38bdf8]/30'
                        : 'bg-[#27272a] text-gray-200 border border-[#3f3f46]'
                    }`}
                  >
                    <div className="whitespace-pre-line prose prose-invert max-w-none text-xs sm:text-sm">
                      {m.content}
                    </div>

                    {m.table && (
                      <div className="mt-4 overflow-x-auto rounded-xl border border-[#3f3f46] bg-[#18181b]">
                        <table className="w-full text-left text-xs text-gray-300">
                          <thead className="bg-[#27272a] text-gray-100 font-semibold uppercase tracking-wider text-[10px]">
                            <tr>
                              {m.table.headers.map((h, i) => (
                                <th key={i} className="px-3 py-2 border-b border-[#3f3f46]">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#3f3f46]/50">
                            {m.table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-white/5 transition">
                                {row.map((col, cIdx) => (
                                  <td key={cIdx} className="px-3 py-2 font-mono text-[11px]">
                                    {col}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {m.type === 'SEARCH_RESULTS' && m.data && (
                      <div className="mt-4 space-y-2">
                        {m.data.devotees?.map((d) => (
                          <div
                            key={d.memberId}
                            className="flex items-center justify-between rounded-lg bg-[#18181b] p-2.5 text-xs border border-[#3f3f46]"
                          >
                            <div>
                              <strong className="text-[#38bdf8] font-mono">{d.memberId}</strong> — {d.name} ({d.mobile1})
                              <div className="text-[10px] text-gray-400">
                                {d.cityVillage}, {d.district} • Status: {d.status} • Books: {d.allocatedBooksCount}
                              </div>
                            </div>
                            <span className="rounded bg-[#38bdf8]/10 px-2 py-0.5 text-[10px] text-[#38bdf8] font-bold">
                              Devotee
                            </span>
                          </div>
                        ))}
                        {m.data.books?.map((b) => (
                          <div
                            key={b.bookNumber}
                            className="flex items-center justify-between rounded-lg bg-[#18181b] p-2.5 text-xs border border-[#3f3f46]"
                          >
                            <div>
                              <strong className="text-[#10b981] font-mono">{b.bookNumber}</strong> (Batch: {b.batchName})
                              <div className="text-[10px] text-gray-400">
                                Status: {b.status} {b.currentDevoteeName ? `• With: ${b.currentDevoteeName}` : ''}
                              </div>
                            </div>
                            <span className="rounded bg-[#10b981]/10 px-2 py-0.5 text-[10px] text-[#10b981] font-bold">
                              Book
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {m.suggestions && m.suggestions.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-[#3f3f46]/40 flex flex-wrap gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-gray-400 w-full mb-1 flex items-center gap-1">
                          <HelpCircle size={11} /> Suggested Follow-up:
                        </span>
                        {m.suggestions.map((s, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => handleSendMessage(s)}
                            className="rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10 px-3 py-1 text-xs text-[#38bdf8] hover:bg-[#38bdf8] hover:text-black transition"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-gray-400 animate-pulse p-2">
                  <Loader2 size={16} className="animate-spin text-[#38bdf8]" />
                  <span>DevoteeDesk AI is querying real-time database records...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-[#3f3f46] bg-[#18181b] p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask any question about devotees, inventory, dispatches, settlements..."
                  className="flex-1 rounded-xl border border-[#3f3f46] bg-[#27272a] px-4 py-3 text-sm text-white placeholder-gray-400 focus:border-[#38bdf8] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#8b5cf6] px-5 py-3 text-sm font-bold text-black shadow-lg hover:brightness-110 transition disabled:opacity-50"
                >
                  <Send size={16} />
                  <span>Ask AI</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 2: RECHARTS ANALYTICS DASHBOARD */}
        {activeView === 'analytics' && analytics && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-[#3f3f46] bg-[#18181b] p-5 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <Users size={16} className="text-[#38bdf8]" /> Devotee Status Distribution
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: analytics.devoteeAnalytics.active },
                          { name: 'Inactive', value: analytics.devoteeAnalytics.inactive },
                          { name: 'Deceased', value: analytics.devoteeAnalytics.deceased },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-[#3f3f46] bg-[#18181b] p-5 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <BookOpen size={16} className="text-[#10b981]" /> Bill Book Inventory Health
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Available', count: analytics.inventoryAnalytics.available },
                        { name: 'Allocated', count: analytics.inventoryAnalytics.allocated },
                        { name: 'Settled', count: analytics.inventoryAnalytics.settled },
                      ]}
                    >
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46' }} />
                      <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-[#3f3f46] bg-[#18181b] p-5 shadow-xl md:col-span-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-[#8b5cf6]" /> Print Batch Stock Distribution
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.inventoryAnalytics.batches}>
                      <XAxis dataKey="batchName" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46' }} />
                      <Legend />
                      <Bar dataKey="available" fill="#10b981" name="Available" />
                      <Bar dataKey="allocated" fill="#f59e0b" name="Allocated" />
                      <Bar dataKey="settled" fill="#8b5cf6" name="Settled" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: AUTOMATED AI INSIGHTS & ANOMALIES */}
        {activeView === 'insights' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle size={18} className="text-[#f59e0b]" /> Operational Anomalies & Integrity Audit
                </h3>
                <p className="text-xs text-gray-400">
                  Continuous AI monitoring for low inventory thresholds, deceased devotees holding books, and pending settlements.
                </p>
              </div>
              <button
                type="button"
                onClick={loadInsights}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-1.5 text-xs text-gray-300 hover:text-white"
              >
                <RefreshCw size={13} /> Refresh Audit
              </button>
            </div>

            {insights.length === 0 ? (
              <div className="rounded-2xl border border-[#10b981]/30 bg-[#10b981]/10 p-8 text-center text-[#10b981]">
                <CheckCircle2 size={36} className="mx-auto mb-2" />
                <h4 className="font-bold">Zero Anomalies Detected</h4>
                <p className="text-xs text-gray-300 mt-1">
                  All devotee records, inventory transitions, and batch stock levels pass operational consistency checks.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {insights.map((ins) => (
                  <div
                    key={ins.id}
                    className={`rounded-2xl border p-5 shadow-lg transition ${
                      ins.severity === 'Critical'
                        ? 'border-red-500/40 bg-red-950/20'
                        : ins.severity === 'Warning'
                        ? 'border-amber-500/40 bg-amber-950/20'
                        : 'border-blue-500/40 bg-blue-950/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              ins.severity === 'Critical'
                                ? 'bg-red-500/20 text-red-400'
                                : ins.severity === 'Warning'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            {ins.severity} • {ins.category}
                          </span>
                          <h4 className="font-bold text-white text-sm">{ins.title}</h4>
                        </div>
                        <p className="text-xs text-gray-300 mt-2">{ins.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          <strong className="text-gray-300">Operational Impact:</strong> {ins.impact}
                        </p>
                        <div className="mt-3 rounded-lg bg-black/40 p-2.5 text-xs text-[#38bdf8] border border-white/5 flex items-center gap-2">
                          <ArrowRight size={14} className="shrink-0" />
                          <span>
                            <strong>Recommended Action:</strong> {ins.recommendedAction}
                          </span>
                        </div>
                      </div>

                      {ins.actionType && (
                        <button
                          type="button"
                          onClick={() =>
                            setActionConfirmModal({
                              title: ins.title,
                              actionType: ins.actionType,
                              payload: { insightId: ins.id },
                            })
                          }
                          className="shrink-0 rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#8b5cf6] px-4 py-2 text-xs font-bold text-black shadow hover:brightness-110"
                        >
                          Execute Resolution
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: EXCEL OPERATIONAL REPORTS */}
        {activeView === 'reports' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-[#10b981]" /> Operational Excel Report Generator
              </h3>
              <p className="text-xs text-gray-400">
                Download verified, audit-ready operational spreadsheets directly from live MongoDB records.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  type: 'devotees',
                  title: 'Devotees Master Directory',
                  desc: 'Complete records with contact info, district, status & next-year interest.',
                  color: 'border-[#38bdf8]/30 hover:border-[#38bdf8]',
                },
                {
                  type: 'inventory',
                  title: 'Bill Book Inventory Register',
                  desc: 'All books with status, batch reference, devotee allocation and timestamps.',
                  color: 'border-[#10b981]/30 hover:border-[#10b981]',
                },
                {
                  type: 'dispatches',
                  title: 'Dispatches Register',
                  desc: 'Post, Courier and Hand delivery logs with tracking IDs and receiver info.',
                  color: 'border-[#f59e0b]/30 hover:border-[#f59e0b]',
                },
                {
                  type: 'returns',
                  title: 'Returns & Bounces History',
                  desc: 'Reasons, returned physical books, and devotee status transition audit.',
                  color: 'border-[#ec4899]/30 hover:border-[#ec4899]',
                },
                {
                  type: 'settlements',
                  title: 'Final Settlements Register',
                  desc: 'Page calculation (Bill To - Bill From + 1), used pages & admin approvals.',
                  color: 'border-[#8b5cf6]/30 hover:border-[#8b5cf6]',
                },
              ].map((rpt) => (
                <div
                  key={rpt.type}
                  className={`rounded-2xl border bg-[#18181b] p-5 shadow-lg flex flex-col justify-between transition ${rpt.color}`}
                >
                  <div>
                    <h4 className="font-bold text-white text-sm">{rpt.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">{rpt.desc}</p>
                  </div>
                  <button
                    type="button"
                    disabled={downloadingReport === rpt.type}
                    onClick={() => handleDownloadReport(rpt.type)}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#27272a] px-4 py-2.5 text-xs font-bold text-white hover:bg-white hover:text-black transition border border-[#3f3f46] disabled:opacity-50"
                  >
                    {downloadingReport === rpt.type ? (
                      <Loader2 size={14} className="animate-spin text-[#38bdf8]" />
                    ) : (
                      <Download size={14} />
                    )}
                    <span>Download Excel</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Confirmation Modal */}
      {actionConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full rounded-2xl border border-[#3f3f46] bg-[#18181b] p-6 shadow-2xl text-white">
            <div className="flex items-center gap-3 text-[#f59e0b]">
              <ShieldAlert size={28} />
              <h3 className="font-bold text-lg">Confirm Administrative Action</h3>
            </div>
            <p className="text-xs text-gray-300 mt-3 leading-relaxed">
              Are you sure you want to execute resolution for{' '}
              <strong className="text-white">"{actionConfirmModal.title}"</strong>? This will record an audit trail in the Activity Log.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActionConfirmModal(null)}
                className="rounded-xl border border-[#3f3f46] bg-[#27272a] px-4 py-2 text-xs font-bold text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                className="rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#8b5cf6] px-5 py-2 text-xs font-bold text-black shadow hover:brightness-110"
              >
                Confirm & Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
