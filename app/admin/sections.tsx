"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, X, Save, ChevronUp, ChevronDown } from "lucide-react";
import { skillCategories } from "@/data/skills";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500";
const labelCls = "block text-xs font-medium text-slate-600 mb-1";
const btnPrimary = "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors";
const btnGhost = "flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors";

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {desc && <p className="text-xs text-slate-500 mt-1 mb-4">{desc}</p>}
      {!desc && <div className="mb-4" />}
      {children}
    </div>
  );
}

function SiteDefaultBanner({ onLoad }: { onLoad: () => void }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <p className="text-sm text-blue-800">Showing the items currently on the public site. Load them to edit or delete.</p>
      <button onClick={onLoad} className={btnPrimary}><Plus size={16} />Load current site items</button>
    </div>
  );
}

function OrderEnabled({ item, onChange }: { item: any; onChange: (patch: any) => void }) {
  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
        <input type="checkbox" checked={item.enabled !== false} onChange={(e) => onChange({ enabled: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
        Enabled
      </label>
      <label className="flex items-center gap-1.5 text-xs text-slate-600">
        Order
        <input type="number" value={item.order ?? 0} onChange={(e) => onChange({ order: parseInt(e.target.value) || 0 })} className="w-16 px-2 py-1 border border-slate-200 rounded text-xs" />
      </label>
    </div>
  );
}

function MoveButtons({ index, list, setList }: { index: number; list: any[]; setList: (l: any[]) => void }) {
  const move = (dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    const copy = [...list];
    [copy[index], copy[j]] = [copy[j], copy[index]];
    setList(copy.map((x, i) => ({ ...x, order: i })));
  };
  return (
    <div className="flex flex-col">
      <button onClick={() => move(-1)} className="p-1 text-slate-400 hover:text-blue-600" title="Move up"><ChevronUp size={14} /></button>
      <button onClick={() => move(1)} className="p-1 text-slate-400 hover:text-blue-600" title="Move down"><ChevronDown size={14} /></button>
    </div>
  );
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

// ─── Skills Tab ────────────────────────────────────────────────
const SKILL_ICONS = ["Monitor", "Server", "Database", "Code2", "Wrench"];
const BUILTIN_SKILLS = skillCategories.map((c, i) => ({
  id: c.id, title: c.title, icon: c.icon, tags: c.tags, capabilities: c.capabilities,
  enabled: true, order: i,
}));

export function SkillsTab({ settings, onSave, loading }: any) {
  const isDefault = !settings?.skills?.length;
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings?.skills?.length) setItems(settings.skills);
  }, [settings]);

  const persist = async (list: any[]) => {
    setSaving(true);
    try { await onSave({ skills: list }); } finally { setSaving(false); }
  };
  const saveItem = async () => {
    if (!editing?.title?.trim()) return;
    const tags = (editing.tagsStr || "").split(",").map((t: string) => t.trim()).filter(Boolean);
    const capabilities = (editing.capsStr || "").split(",").map((t: string) => t.trim()).filter(Boolean);
    const item = { ...editing, tags, capabilities, tagsStr: undefined, capsStr: undefined };
    delete item.tagsStr; delete item.capsStr;
    const exists = items.some((x) => x.id === item.id);
    const list = exists ? items.map((x) => (x.id === item.id ? item : x)) : [...items, { ...item, id: item.id || uid(), order: items.length }];
    setItems(list);
    setEditing(null);
    await persist(list);
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this skill category?")) return;
    const list = items.filter((x) => x.id !== id);
    setItems(list);
    await persist(list);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-slate-900">Skills</h2><p className="text-sm text-slate-500">Manage skill categories shown on the public site.</p></div>
        <button onClick={() => setEditing({ title: "", icon: "Monitor", tagsStr: "", capsStr: "", enabled: true, order: items.length })} className={btnPrimary}><Plus size={16} />Add Category</button>
      </div>
      {isDefault && <SiteDefaultBanner onLoad={() => { setItems(BUILTIN_SKILLS); persist(BUILTIN_SKILLS); }} />}
      {editing && (
        <Card title={items.some((x) => x.id === editing.id) ? "Edit Category" : "New Category"}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Title</label><input className={inputCls} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div><label className={labelCls}>Icon</label>
              <select className={inputCls} value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })}>
                {SKILL_ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2"><label className={labelCls}>Tags (comma-separated)</label><input className={inputCls} value={editing.tagsStr ?? (editing.tags || []).join(", ")} onChange={(e) => setEditing({ ...editing, tagsStr: e.target.value })} placeholder="React.js, JavaScript" /></div>
            <div className="sm:col-span-2"><label className={labelCls}>Capabilities (comma-separated)</label><input className={inputCls} value={editing.capsStr ?? (editing.capabilities || []).join(", ")} onChange={(e) => setEditing({ ...editing, capsStr: e.target.value })} /></div>
          </div>
          <OrderEnabled item={editing} onChange={(p) => setEditing({ ...editing, ...p })} />
          <div className="flex gap-3 mt-4">
            <button onClick={saveItem} disabled={saving || !editing.title?.trim()} className={btnPrimary}><Save size={16} />{saving ? "Saving..." : "Save"}</button>
            <button onClick={() => setEditing(null)} className={btnGhost}><X size={16} />Cancel</button>
          </div>
        </Card>
      )}
      <div className="space-y-3">
        {(isDefault ? BUILTIN_SKILLS : items).map((cat: any, i: number) => (
          <div key={cat.id} className={`bg-white rounded-xl border p-4 shadow-sm flex items-start gap-3 ${cat.enabled === false ? "opacity-50" : "border-slate-200"}`}>
            {!isDefault && <MoveButtons index={i} list={items} setList={(l) => { setItems(l); persist(l); }} />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-900">{cat.title}</h3>
                <span className="text-xs text-slate-400">{cat.icon}</span>
                {isDefault && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">Site default</span>}
                {cat.enabled === false && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">Disabled</span>}
              </div>
              <p className="text-xs text-slate-500 mt-1">{(cat.tags || []).join(" · ")}</p>
            </div>
            {!isDefault && (
              <div className="flex gap-1">
                <button onClick={() => setEditing({ ...cat, tagsStr: (cat.tags || []).join(", "), capsStr: (cat.capabilities || []).join(", ") })} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                <button onClick={() => remove(cat.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Communication Tab ─────────────────────────────────────────
const COMM_ICONS = ["MessageSquare", "Users", "Globe", "Mic", "PenTool", "Handshake", "Lightbulb", "HeartHandshake"];
const COMM_COLORS = ["text-blue-400", "text-indigo-400", "text-teal-400", "text-purple-400", "text-orange-400", "text-yellow-400", "text-green-400", "text-pink-400"];
const COMM_BGS = ["bg-blue-500/10", "bg-indigo-500/10", "bg-teal-500/10", "bg-purple-500/10", "bg-orange-500/10", "bg-yellow-500/10", "bg-green-500/10", "bg-pink-500/10"];
const BUILTIN_COMM = [
  { id: "c1", icon: "MessageSquare", title: "Verbal Communication", desc: "Clear and confident verbal communication in professional and technical settings.", color: "text-blue-400", bg: "bg-blue-500/10" },
  { id: "c2", icon: "PenTool", title: "Written Communication", desc: "Strong written skills for documentation, reports, emails, and technical writing.", color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { id: "c3", icon: "Users", title: "Team Collaboration", desc: "Experienced collaborating in diverse, cross-functional development teams.", color: "text-teal-400", bg: "bg-teal-500/10" },
  { id: "c4", icon: "Globe", title: "Cross-Cultural Communication", desc: "Comfortable communicating across cultures, having lived and studied in multiple countries.", color: "text-purple-400", bg: "bg-purple-500/10" },
  { id: "c5", icon: "Mic", title: "Technical Presentations", desc: "Ability to present technical concepts clearly to both technical and non-technical audiences.", color: "text-orange-400", bg: "bg-orange-500/10" },
  { id: "c6", icon: "Lightbulb", title: "Problem-Solving Discussions", desc: "Skilled at facilitating technical discussions to identify and solve complex problems.", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { id: "c7", icon: "Handshake", title: "Teamwork & Cooperation", desc: "Strong team player who values collaboration, mutual respect, and shared goals.", color: "text-green-400", bg: "bg-green-500/10" },
  { id: "c8", icon: "HeartHandshake", title: "Active Listening", desc: "Attentive listener who understands requirements and responds thoughtfully.", color: "text-pink-400", bg: "bg-pink-500/10" },
].map((c, i) => ({ ...c, enabled: true, order: i }));

export function CommunicationTab({ settings, onSave }: any) {
  const isDefault = !settings?.communication?.length;
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (settings?.communication?.length) setItems(settings.communication); }, [settings]);
  const persist = async (list: any[]) => { setSaving(true); try { await onSave({ communication: list }); } finally { setSaving(false); } };
  const saveItem = async () => {
    if (!editing?.title?.trim() || !editing?.desc?.trim()) return;
    const exists = items.some((x) => x.id === editing.id);
    const list = exists ? items.map((x) => (x.id === editing.id ? editing : x)) : [...items, { ...editing, id: editing.id || uid(), order: items.length }];
    setItems(list); setEditing(null); await persist(list);
  };
  const remove = async (id: string) => { if (!confirm("Delete this entry?")) return; const list = items.filter((x) => x.id !== id); setItems(list); await persist(list); };
  const shown = isDefault ? BUILTIN_COMM : items;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-slate-900">Communication Skills</h2><p className="text-sm text-slate-500">Manage the soft-skill cards on the public site.</p></div>
        <button onClick={() => setEditing({ title: "", desc: "", icon: "MessageSquare", color: "text-blue-400", bg: "bg-blue-500/10", enabled: true, order: items.length })} className={btnPrimary}><Plus size={16} />Add Entry</button>
      </div>
      {isDefault && <SiteDefaultBanner onLoad={() => { setItems(BUILTIN_COMM); persist(BUILTIN_COMM); }} />}
      {editing && (
        <Card title="Edit Entry">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Title</label><input className={inputCls} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div><label className={labelCls}>Icon</label>
              <select className={inputCls} value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })}>{COMM_ICONS.map((i) => <option key={i} value={i}>{i}</option>)}</select>
            </div>
            <div className="sm:col-span-2"><label className={labelCls}>Description</label><textarea className={inputCls} rows={2} value={editing.desc} onChange={(e) => setEditing({ ...editing, desc: e.target.value })} /></div>
            <div><label className={labelCls}>Icon Color</label>
              <select className={inputCls} value={editing.color} onChange={(e) => { const i = COMM_COLORS.indexOf(e.target.value); setEditing({ ...editing, color: e.target.value, bg: COMM_BGS[i] ?? editing.bg }); }}>{COMM_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            </div>
          </div>
          <OrderEnabled item={editing} onChange={(p) => setEditing({ ...editing, ...p })} />
          <div className="flex gap-3 mt-4">
            <button onClick={saveItem} disabled={saving || !editing.title?.trim() || !editing.desc?.trim()} className={btnPrimary}><Save size={16} />Save</button>
            <button onClick={() => setEditing(null)} className={btnGhost}><X size={16} />Cancel</button>
          </div>
        </Card>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        {shown.map((c: any, i: number) => (
          <div key={c.id} className={`bg-white rounded-xl border p-4 shadow-sm flex items-start gap-3 ${c.enabled === false ? "opacity-50" : "border-slate-200"}`}>
            {!isDefault && <MoveButtons index={i} list={items} setList={(l) => { setItems(l); persist(l); }} />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap"><h3 className="font-semibold text-slate-900 text-sm">{c.title}</h3>{isDefault && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">Site default</span>}{c.enabled === false && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">Disabled</span>}</div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.desc}</p>
            </div>
            {!isDefault && (
              <div className="flex gap-1">
                <button onClick={() => setEditing({ ...c })} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                <button onClick={() => remove(c.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Languages Tab ─────────────────────────────────────────────
const BUILTIN_LANGS = [
  { id: "l1", name: "English", level: "Professional Fluency", flag: "🇺🇸", proficiency: 95, badge: "Professional", color: "from-blue-500 to-blue-600" },
  { id: "l2", name: "Kpelle", level: "Native Language / Mother Tongue", flag: "🇱🇷", proficiency: 100, badge: "Native", color: "from-red-500 to-red-600" },
  { id: "l3", name: "French", level: "Basic Knowledge", flag: "🇫🇷", proficiency: 30, badge: "Basic", color: "from-indigo-500 to-indigo-600" },
  { id: "l4", name: "Turkish", level: "Basic Knowledge", flag: "🇹🇷", proficiency: 25, badge: "Basic", color: "from-red-600 to-orange-500" },
  { id: "l5", name: "Kinyarwanda", level: "Basic Knowledge", flag: "🇷🇼", proficiency: 25, badge: "Basic", color: "from-teal-500 to-green-500" },
].map((l, i) => ({ ...l, enabled: true, order: i }));
const BADGES = ["Native", "Professional", "Basic"];
const LANG_COLORS = ["from-blue-500 to-blue-600", "from-red-500 to-red-600", "from-indigo-500 to-indigo-600", "from-red-600 to-orange-500", "from-teal-500 to-green-500", "from-purple-500 to-pink-500", "from-green-500 to-emerald-600", "from-slate-500 to-slate-700"];

export function LanguagesTab({ settings, onSave }: any) {
  const isDefault = !settings?.languages?.length;
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (settings?.languages?.length) setItems(settings.languages); }, [settings]);
  const persist = async (list: any[]) => { setSaving(true); try { await onSave({ languages: list }); } finally { setSaving(false); } };
  const saveItem = async () => {
    if (!editing?.name?.trim()) return;
    const exists = items.some((x) => x.id === editing.id);
    const list = exists ? items.map((x) => (x.id === editing.id ? editing : x)) : [...items, { ...editing, id: editing.id || uid(), order: items.length }];
    setItems(list); setEditing(null); await persist(list);
  };
  const remove = async (id: string) => { if (!confirm("Delete this language?")) return; const list = items.filter((x) => x.id !== id); setItems(list); await persist(list); };
  const shown = isDefault ? BUILTIN_LANGS : items;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-slate-900">Languages</h2><p className="text-sm text-slate-500">Spoken languages shown on the public site (not site translations).</p></div>
        <button onClick={() => setEditing({ name: "", level: "", flag: "🏳️", proficiency: 50, badge: "Basic", color: "from-blue-500 to-blue-600", enabled: true, order: items.length })} className={btnPrimary}><Plus size={16} />Add Language</button>
      </div>
      {isDefault && <SiteDefaultBanner onLoad={() => { setItems(BUILTIN_LANGS); persist(BUILTIN_LANGS); }} />}
      {editing && (
        <Card title="Edit Language">
          <div className="grid sm:grid-cols-3 gap-4">
            <div><label className={labelCls}>Name</label><input className={inputCls} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div><label className={labelCls}>Flag emoji</label><input className={inputCls} value={editing.flag} onChange={(e) => setEditing({ ...editing, flag: e.target.value })} /></div>
            <div><label className={labelCls}>Level</label><input className={inputCls} value={editing.level} onChange={(e) => setEditing({ ...editing, level: e.target.value })} placeholder="e.g. Basic Knowledge" /></div>
            <div><label className={labelCls}>Proficiency (0-100)</label><input type="number" min={0} max={100} className={inputCls} value={editing.proficiency} onChange={(e) => setEditing({ ...editing, proficiency: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })} /></div>
            <div><label className={labelCls}>Badge</label>
              <select className={inputCls} value={editing.badge} onChange={(e) => setEditing({ ...editing, badge: e.target.value })}>{BADGES.map((b) => <option key={b} value={b}>{b}</option>)}</select>
            </div>
            <div><label className={labelCls}>Bar color</label>
              <select className={inputCls} value={editing.color} onChange={(e) => setEditing({ ...editing, color: e.target.value })}>{LANG_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            </div>
          </div>
          <OrderEnabled item={editing} onChange={(p) => setEditing({ ...editing, ...p })} />
          <div className="flex gap-3 mt-4">
            <button onClick={saveItem} disabled={saving || !editing.name?.trim()} className={btnPrimary}><Save size={16} />Save</button>
            <button onClick={() => setEditing(null)} className={btnGhost}><X size={16} />Cancel</button>
          </div>
        </Card>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {shown.map((l: any, i: number) => (
          <div key={l.id} className={`bg-white rounded-xl border p-4 shadow-sm flex items-center gap-3 ${l.enabled === false ? "opacity-50" : "border-slate-200"}`}>
            {!isDefault && <MoveButtons index={i} list={items} setList={(l2) => { setItems(l2); persist(l2); }} />}
            <span className="text-2xl">{l.flag}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><h3 className="font-semibold text-slate-900 text-sm">{l.name}</h3>{isDefault && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">Site default</span>}{l.enabled === false && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">Disabled</span>}</div>
              <p className="text-xs text-slate-500">{l.level} · {l.proficiency}%</p>
            </div>
            {!isDefault && (
              <div className="flex gap-1">
                <button onClick={() => setEditing({ ...l })} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                <button onClick={() => remove(l.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Work Together Tab ─────────────────────────────────────────
const BUILTIN_SERVICES = [
  "Full Stack Web Applications", "Backend & REST API Development", "Database Design & Management",
  "Church / School Management Systems", "Frontend UI Development", "Software Engineering Consulting",
].map((t, i) => ({ id: `s${i}`, title: t, enabled: true, order: i }));

export function WorkTogetherTab({ settings, onSave }: any) {
  const wt = settings?.workTogether;
  const isDefault = !wt?.services?.length;
  const [form, setForm] = useState<any>({});
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      label: wt?.label || "Open to Opportunities",
      title: wt?.title || "Let's Work Together",
      description: wt?.description || "I'm available for freelance projects, full-time roles, and collaborations. Whether you need a web application, a backend API, or a complete software solution — let's build something great.",
      availabilityText: wt?.availabilityText || "Available for selected projects",
    });
    if (wt?.services?.length) setItems(wt.services);
  }, [settings]);

  const persistServices = async (list: any[]) => { setSaving(true); try { await onSave({ workTogether: { ...form, services: list } }); } finally { setSaving(false); } };
  const saveText = async () => { setSaving(true); try { await onSave({ workTogether: { ...form, services: items } }); } finally { setSaving(false); } };
  const saveItem = async () => {
    if (!editing?.title?.trim()) return;
    const exists = items.some((x) => x.id === editing.id);
    const list = exists ? items.map((x) => (x.id === editing.id ? editing : x)) : [...items, { ...editing, id: editing.id || uid(), order: items.length }];
    setItems(list); setEditing(null); await persistServices(list);
  };
  const remove = async (id: string) => { if (!confirm("Delete this service?")) return; const list = items.filter((x) => x.id !== id); setItems(list); await persistServices(list); };
  const shown = isDefault ? BUILTIN_SERVICES : items;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Work Together</h2>
      <Card title="Section Text" desc="English text overrides; other languages keep translations.">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Section label</label><input className={inputCls} value={form.label || ""} onChange={(e) => setForm({ ...form, label: e.target.value })} /></div>
          <div><label className={labelCls}>Title</label><input className={inputCls} value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className={labelCls}>Description</label><textarea className={inputCls} rows={2} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className={labelCls}>Availability badge text</label><input className={inputCls} value={form.availabilityText || ""} onChange={(e) => setForm({ ...form, availabilityText: e.target.value })} /></div>
        </div>
        <button onClick={saveText} disabled={saving} className={`${btnPrimary} mt-4`}><Save size={16} />{saving ? "Saving..." : "Save Text"}</button>
      </Card>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Services</h3>
        <button onClick={() => setEditing({ title: "", desc: "", icon: "", enabled: true, order: items.length })} className={btnPrimary}><Plus size={16} />Add Service</button>
      </div>
      {isDefault && <SiteDefaultBanner onLoad={() => { setItems(BUILTIN_SERVICES); persistServices(BUILTIN_SERVICES); }} />}
      {editing && (
        <Card title="Edit Service">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Title</label><input className={inputCls} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div><label className={labelCls}>Description (optional)</label><input className={inputCls} value={editing.desc || ""} onChange={(e) => setEditing({ ...editing, desc: e.target.value })} /></div>
          </div>
          <OrderEnabled item={editing} onChange={(p) => setEditing({ ...editing, ...p })} />
          <div className="flex gap-3 mt-4">
            <button onClick={saveItem} disabled={saving || !editing.title?.trim()} className={btnPrimary}><Save size={16} />Save</button>
            <button onClick={() => setEditing(null)} className={btnGhost}><X size={16} />Cancel</button>
          </div>
        </Card>
      )}
      <div className="flex flex-wrap gap-2">
        {shown.map((s: any, i: number) => (
          <div key={s.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${s.enabled === false ? "opacity-50 border-slate-200 bg-slate-50 text-slate-400" : "border-blue-500/30 bg-blue-500/10 text-blue-700"}`}>
            {!isDefault && <MoveButtons index={i} list={items} setList={(l) => { setItems(l); persistServices(l); }} />}
            <span>{s.title}</span>
            {isDefault && <span className="text-xs text-slate-400">default</span>}
            {!isDefault && (
              <span className="flex gap-1">
                <button onClick={() => setEditing({ ...s })} className="text-slate-400 hover:text-blue-600"><Edit2 size={13} /></button>
                <button onClick={() => remove(s.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={13} /></button>
              </span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── WhatsApp & Map Tab ────────────────────────────────────────
export function ContactChannelsTab({ settings, onSave }: any) {
  const wa = settings?.whatsapp;
  const mp = settings?.map;
  const [waForm, setWaForm] = useState<any>({});
  const [mapForm, setMapForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setWaForm({
      primaryNumber: wa?.primaryNumber || "+231 880 857 969",
      secondaryNumber: wa?.secondaryNumber || "+90 533 872 1736",
      message: wa?.message || "Hi Isaac! I found you through your portfolio.",
      buttonLabel: wa?.buttonLabel || "WhatsApp",
      enabled: wa?.enabled !== false,
    });
    setMapForm({
      address: mp?.address || "Kigali, Rwanda",
      embedUrl: mp?.embedUrl || "",
      enabled: mp?.enabled !== false,
    });
  }, [settings]);

  const save = async () => {
    setSaving(true);
    try {
      await onSave({ whatsapp: waForm, map: mapForm });
    } finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">WhatsApp & Map</h2>
      <Card title="WhatsApp" desc="Numbers are converted to wa.me links automatically. Leave a number empty to hide it.">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Primary number</label><input className={inputCls} value={waForm.primaryNumber || ""} onChange={(e) => setWaForm({ ...waForm, primaryNumber: e.target.value })} placeholder="+231 880 857 969" /></div>
          <div><label className={labelCls}>Secondary number (optional)</label><input className={inputCls} value={waForm.secondaryNumber || ""} onChange={(e) => setWaForm({ ...waForm, secondaryNumber: e.target.value })} placeholder="+90 533 872 1736" /></div>
          <div className="sm:col-span-2"><label className={labelCls}>Default message</label><input className={inputCls} value={waForm.message || ""} onChange={(e) => setWaForm({ ...waForm, message: e.target.value })} /></div>
          <div><label className={labelCls}>Button label</label><input className={inputCls} value={waForm.buttonLabel || ""} onChange={(e) => setWaForm({ ...waForm, buttonLabel: e.target.value })} /></div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={waForm.enabled !== false} onChange={(e) => setWaForm({ ...waForm, enabled: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
              Show WhatsApp buttons
            </label>
          </div>
        </div>
      </Card>
      <Card title="Location Map" desc="Leave the embed URL empty to use the default Kigali map.">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Displayed address</label><input className={inputCls} value={mapForm.address || ""} onChange={(e) => setMapForm({ ...mapForm, address: e.target.value })} /></div>
          <div><label className={labelCls}>Map embed URL (optional)</label><input className={inputCls} value={mapForm.embedUrl || ""} onChange={(e) => setMapForm({ ...mapForm, embedUrl: e.target.value })} placeholder="https://www.google.com/maps/embed?..." /></div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={mapForm.enabled !== false} onChange={(e) => setMapForm({ ...mapForm, enabled: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
              Show map on contact section
            </label>
          </div>
        </div>
      </Card>
      <button onClick={save} disabled={saving} className={btnPrimary}><Save size={16} />{saving ? "Saving..." : "Save WhatsApp & Map"}</button>
    </motion.div>
  );
}
