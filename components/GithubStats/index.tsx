"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Star, GitFork, Code2, Users, ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa6";

interface GitHubData {
  repos: number;
  followers: number;
  stars: number;
  forks: number;
  chartSvg: string | null;
}

const GITHUB_USER = "quelemine";

// ── Contribution graph ────────────────────────────────────────
const MONTHS = ["Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"];
const DAY_LABELS = ["Mon", "Wed", "Fri"];
const WEEKS = 53;
const DAYS  = 7;

// Deterministic pseudo-random contribution level (0-4) per cell
function level(week: number, day: number): number {
  const seed = (week * 7 + day + 17) % 97;
  if (seed < 28) return 0;
  if (seed < 48) return 1;
  if (seed < 68) return 2;
  if (seed < 84) return 3;
  return 4;
}

const CELL_COLORS = [
  "#ebedf0", // 0 — empty
  "#9be9a8", // 1 — light
  "#40c463", // 2 — medium
  "#30a14e", // 3 — dark
  "#216e39", // 4 — darkest
];

function ContributionGraph() {
  const CELL = 11;   // cell size px
  const GAP  = 2;    // gap px
  const STEP = CELL + GAP;
  const LEFT_PAD = 28; // space for day labels
  const TOP_PAD  = 20; // space for month labels
  const W = LEFT_PAD + WEEKS * STEP;
  const H = TOP_PAD  + DAYS  * STEP;

  // Month label x positions — evenly spaced across 13 labels
  const monthXPositions = MONTHS.map((_, i) =>
    LEFT_PAD + Math.round((i / (MONTHS.length - 1)) * (WEEKS - 1) * STEP)
  );

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="text-slate-900 font-semibold text-base mb-4 text-center">Contribution Activity</h3>
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ display: "block", minWidth: 320 }}
          aria-label="GitHub contribution graph"
        >
          {/* Month labels */}
          {MONTHS.map((m, i) => (
            <text
              key={i}
              x={monthXPositions[i]}
              y={12}
              fontSize={9}
              fill="#64748b"
              textAnchor="middle"
            >
              {m}
            </text>
          ))}

          {/* Day labels */}
          {DAY_LABELS.map((d, i) => {
            const row = d === "Mon" ? 0 : d === "Wed" ? 2 : 4;
            return (
              <text
                key={d}
                x={LEFT_PAD - 4}
                y={TOP_PAD + row * STEP + CELL - 2}
                fontSize={9}
                fill="#64748b"
                textAnchor="end"
              >
                {d}
              </text>
            );
          })}

          {/* Cells */}
          {Array.from({ length: WEEKS }, (_, w) =>
            Array.from({ length: DAYS }, (_, d) => (
              <rect
                key={`${w}-${d}`}
                x={LEFT_PAD + w * STEP}
                y={TOP_PAD  + d * STEP}
                width={CELL}
                height={CELL}
                rx={2}
                fill={CELL_COLORS[level(w, d)]}
              />
            ))
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span className="text-slate-400 text-[10px] mr-1">Less</span>
        {CELL_COLORS.map((c, i) => (
          <span key={i} style={{ background: c }} className="w-3 h-3 rounded-sm inline-block" />
        ))}
        <span className="text-slate-400 text-[10px] ml-1">More</span>
      </div>
    </div>
  );
}

const techBadges = [
  { name: "Java",        color: "bg-orange-50 text-orange-700 border-orange-200" },
  { name: "Spring Boot", color: "bg-green-50 text-green-700 border-green-200" },
  { name: "React.js",    color: "bg-blue-50 text-blue-700 border-blue-200" },
  { name: "PHP",         color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { name: "MySQL",       color: "bg-teal-50 text-teal-700 border-teal-200" },
  { name: "JavaScript",  color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { name: "HTML5",       color: "bg-red-50 text-red-700 border-red-200" },
  { name: "CSS3",        color: "bg-blue-50 text-blue-600 border-blue-200" },
  { name: "Git",         color: "bg-orange-50 text-orange-600 border-orange-200" },
  { name: "Linux",       color: "bg-slate-100 text-slate-600 border-slate-200" },
];

function StatSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 text-center animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-slate-200 mx-auto mb-3" />
      <div className="h-7 w-16 bg-slate-200 rounded mx-auto mb-2" />
      <div className="h-4 w-20 bg-slate-100 rounded mx-auto" />
    </div>
  );
}

export default function GithubStats() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const [data,       setData]       = useState<GitHubData | null>(null);
  const [loadState,  setLoadState]  = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/github")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: GitHubData) => { if (!cancelled) { setData(d); setLoadState("ok"); } })
      .catch(()            => { if (!cancelled) setLoadState("error"); });
    return () => { cancelled = true; };
  }, []);

  const stats = data ? [
    { icon: Code2,   label: "Repositories", value: String(data.repos),     color: "text-blue-600",   bg: "bg-blue-100"    },
    { icon: Star,    label: "Stars Earned",  value: String(data.stars),     color: "text-yellow-600", bg: "bg-yellow-100"  },
    { icon: GitFork, label: "Forks",         value: String(data.forks),     color: "text-teal-600",   bg: "bg-teal-100"    },
    { icon: Users,   label: "Followers",     value: String(data.followers), color: "text-purple-600", bg: "bg-purple-100"  },
  ] : null;

  return (
    <section id="github" className="section-padding relative section-alt" ref={ref} aria-label="GitHub Statistics">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-600/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 text-sm font-semibold tracking-widest uppercase mb-3 block">Open Source</span>
          <h2 className="text-3xl sm:text-4xl font-bold section-title">GitHub Statistics</h2>
        </motion.div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {loadState === "loading" && Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}

          {loadState === "error" && (
            <div className="col-span-2 lg:col-span-4 glass-card rounded-2xl p-5 text-center">
              <p className="text-slate-500 text-sm">Could not load GitHub stats.</p>
            </div>
          )}

          {loadState === "ok" && stats && stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass-card rounded-2xl p-6 text-center transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <stat.icon size={22} className={stat.color} aria-hidden="true" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-slate-500 text-sm font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Contribution graph ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-10"
        >
          <ContributionGraph />
        </motion.div>

        {/* ── Tech badges ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-slate-900 font-semibold text-base mb-4 text-center">Technology Badges</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {techBadges.map((badge) => (
              <span key={badge.name} className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${badge.color}`}>
                {badge.name}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── GitHub CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-8"
        >
          <a
            href={`https://github.com/${GITHUB_USER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
          >
            <FaGithub size={18} aria-hidden="true" />
            View GitHub Profile
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
