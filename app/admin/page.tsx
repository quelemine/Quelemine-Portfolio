"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, ChevronUp, LogOut, MessageSquare, User, Clock, Filter } from "lucide-react";
import { getAllSessions, type ChatSession } from "@/lib/chatLogger";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function timeSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminDashboard() {
  const [authed, setAuthed]         = useState(false);
  const [pwInput, setPwInput]       = useState("");
  const [pwError, setPwError]       = useState(false);
  const [sessions, setSessions]     = useState<ChatSession[]>([]);
  const [search, setSearch]         = useState("");
  const [sortAsc, setSortAsc]       = useState(false);
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [filter, setFilter]         = useState<"all" | "recent">("all");

  useEffect(() => {
    if (authed) setSessions(getAllSessions());
  }, [authed]);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwInput === ADMIN_PASSWORD) { setAuthed(true); setPwError(false); }
    else { setPwError(true); setPwInput(""); }
  };

  const filtered = useMemo(() => {
    let list = [...sessions];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) =>
        s.userName.toLowerCase().includes(q) ||
        s.sessionId.includes(q) ||
        s.messages.some((m) => m.text.toLowerCase().includes(q))
      );
    }
    if (filter === "recent") {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      list = list.filter((s) => new Date(s.lastActiveAt).getTime() > cutoff);
    }
    list.sort((a, b) => {
      const diff = new Date(a.lastActiveAt).getTime() - new Date(b.lastActiveAt).getTime();
      return sortAsc ? diff : -diff;
    });
    return list;
  }, [sessions, search, sortAsc, filter]);

  const totalMessages = sessions.reduce((acc, s) => acc + s.messages.length, 0);
  const recentCount   = sessions.filter((s) => Date.now() - new Date(s.lastActiveAt).getTime() < 86400000).length;
  const errorCount    = sessions.reduce((acc, s) => acc + s.messages.filter((m) => m.status === "error").length, 0);

  // Top questions — user messages sorted by frequency
  const questionFreq: Record<string, number> = {};
  sessions.forEach((s) => s.messages.filter((m) => m.role === "user").forEach((m) => {
    const key = m.text.trim().toLowerCase();
    questionFreq[key] = (questionFreq[key] ?? 0) + 1;
  }));
  const topQuestions = Object.entries(questionFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Conversations by day (last 7 days)
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  });
  const dayKeys = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });
  const byDay = dayKeys.map((dk) => sessions.filter((s) => new Date(s.startedAt).toDateString() === dk).length);
  const maxDay = Math.max(...byDay, 1);

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0B1F3A] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-[#0f2847] border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={26} className="text-blue-400" />
            </div>
            <h1 className="text-white font-bold text-xl">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Chat Activity Logs</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
            />
            {pwError && <p className="text-red-400 text-xs">Incorrect password.</p>}
            <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
              Sign In
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-[#0B1F3A] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-lg">Chat Activity Logs</h1>
          <p className="text-slate-400 text-xs">Isaac&apos;s AI Assistant · Admin View</p>
        </div>
        <button onClick={() => setAuthed(false)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <LogOut size={15} /> Sign out
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Sessions",  value: sessions.length,  color: "text-blue-600" },
            { label: "Total Messages",  value: totalMessages,    color: "text-indigo-600" },
            { label: "Active (24h)",    value: recentCount,      color: "text-green-600" },
            { label: "Errors",          value: errorCount,       color: "text-red-500" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-slate-500 text-xs mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Analytics row */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Conversations by day */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-slate-700 font-semibold text-sm mb-4">Conversations — Last 7 Days</p>
            <div className="flex items-end gap-2 h-24">
              {byDay.map((count, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-500">{count > 0 ? count : ""}</span>
                  <div
                    className="w-full rounded-t bg-blue-500 transition-all"
                    style={{ height: `${Math.max((count / maxDay) * 72, count > 0 ? 6 : 2)}px`, opacity: count > 0 ? 1 : 0.2 }}
                  />
                  <span className="text-[9px] text-slate-400 text-center leading-tight">{dayLabels[i].split(",")[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top questions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-slate-700 font-semibold text-sm mb-4">Most Common Questions</p>
            {topQuestions.length === 0 ? (
              <p className="text-slate-400 text-xs">No questions yet.</p>
            ) : (
              <div className="space-y-2">
                {topQuestions.map(([q, count]) => (
                  <div key={q} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 text-xs truncate capitalize">{q}</p>
                      <div className="mt-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(count / (topQuestions[0]?.[1] ?? 1)) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 flex-shrink-0">{count}×</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, message, or session ID..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter(filter === "all" ? "recent" : "all")}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                filter === "recent" ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <Filter size={14} /> {filter === "recent" ? "Last 24h" : "All time"}
            </button>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:border-slate-300 transition-colors"
            >
              {sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {sortAsc ? "Oldest" : "Newest"}
            </button>
          </div>
        </div>

        {/* Session list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No conversations found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((session) => {
              const isOpen = expanded === session.sessionId;
              const hasError = session.messages.some((m) => m.status === "error");
              const isRecent = Date.now() - new Date(session.lastActiveAt).getTime() < 3600000;
              return (
                <div key={session.sessionId} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Session header */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : session.sessionId)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-slate-800 font-semibold text-sm">{session.userName}</p>
                          {isRecent && <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>}
                          {hasError && <span className="text-[10px] font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Error</span>}
                        </div>
                        <p className="text-slate-400 text-xs mt-0.5 font-mono">{session.sessionId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-slate-500 text-xs flex items-center gap-1 justify-end">
                          <Clock size={11} /> {timeSince(session.lastActiveAt)}
                        </p>
                        <p className="text-slate-400 text-xs">{session.messages.length} messages</p>
                      </div>
                      {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </button>

                  {/* Expanded conversation */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-slate-100 px-5 py-4 space-y-1 bg-slate-50">
                          <div className="flex gap-6 text-xs text-slate-500 mb-3">
                            <span>Started: {formatDate(session.startedAt)}</span>
                            <span>Last active: {formatDate(session.lastActiveAt)}</span>
                            <span>Channel: {session.channel}</span>
                          </div>
                          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                            {session.messages.map((msg, i) => (
                              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white ${
                                  msg.role === "bot" ? "bg-blue-500" : "bg-slate-500"
                                }`}>
                                  {msg.role === "bot" ? "AI" : session.userName[0].toUpperCase()}
                                </div>
                                <div className={`max-w-[75%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                                  msg.role === "bot" ? "bg-white border border-slate-200 text-slate-700" : "bg-blue-600 text-white"
                                } ${msg.status === "error" ? "border-red-300 bg-red-50 text-red-700" : ""}`}>
                                  <p>{msg.text}</p>
                                  <p className={`text-[10px] mt-1 ${msg.role === "bot" ? "text-slate-400" : "text-blue-200"}`}>
                                    {formatDate(msg.timestamp)}{msg.status === "error" ? " · error" : ""}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
