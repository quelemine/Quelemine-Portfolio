"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ExternalLink, FolderOpen, Monitor, MessageSquare } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import Image from "next/image";
import { projects, projectFilters, type ProjectCategory } from "@/data/projects";
import SicmIframeModal from "@/components/UI/SicmIframeModal";
import { useChatContext } from "@/context/ChatContext";

function ProjectThumbnail({ project, priority = false }: { project: (typeof projects)[number]; priority?: boolean }) {
  const [imgError, setImgError] = useState(false);
  if (!imgError && project.image) {
    return (
      <Image
        src={project.image}
        alt={project.title}
        fill
        className="object-cover object-top"
        onError={() => setImgError(true)}
        unoptimized
        priority={priority}
      />
    );
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <FolderOpen size={40} className="text-slate-600 mx-auto mb-2" />
        <span className="text-slate-600 text-sm">{project.title}</span>
      </div>
    </div>
  );
}

export default function Projects() {
  const [active, setActive] = useState<ProjectCategory>("all");
  const [sicmOpen, setSicmOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { openWithMessage } = useChatContext();

  const filtered = active === "all" ? projects : projects.filter((p) => p.category === active);

  const isSicm = (id: number) => id === 7;

  const categoryColors: Record<string, string> = {
    frontend: "text-blue-700 bg-blue-50 border-blue-200",
    backend: "text-indigo-700 bg-indigo-50 border-indigo-200",
    fullstack: "text-teal-700 bg-teal-50 border-teal-200",
    database: "text-orange-700 bg-orange-50 border-orange-200",
  };

  return (
    <section id="projects" className="section-padding relative section-alt" ref={ref}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-blue-600 text-sm font-semibold tracking-widest uppercase mb-3 block">What I&apos;ve Built</span>
          <h2 className="text-3xl sm:text-4xl font-bold section-title">Featured Projects</h2>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {projectFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActive(f.id as ProjectCategory)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                active === f.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div layout className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                className="glass-card rounded-2xl overflow-hidden group transition-all duration-300"
              >
                {/* Project image */}
                <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                  <ProjectThumbnail project={project} priority={i === 0} />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-3">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur text-white text-xs hover:bg-white/20 transition-all"
                      >
                        <FaGithub size={14} /> GitHub
                      </a>
                    )}
                    {isSicm(project.id) ? (
                      <button
                        onClick={() => setSicmOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/80 backdrop-blur text-white text-xs hover:bg-blue-600 transition-all"
                      >
                        <Monitor size={14} /> Preview
                      </button>
                    ) : (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/80 backdrop-blur text-white text-xs hover:bg-blue-600 transition-all"
                      >
                        <ExternalLink size={14} /> {project.github ? "Live Demo" : "View Project"}
                      </a>
                    )}
                  </div>
                  {/* Category badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${categoryColors[project.category] || "text-slate-400 bg-slate-500/10 border-slate-500/20"}`}>
                      {project.category}
                    </span>
                  </div>
                  {project.featured && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        ⭐ Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-slate-900 font-bold text-base mb-2">{project.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">{project.description}</p>

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span key={tech} className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium text-slate-400">+{project.technologies.length - 4} more</span>
                    )}
                  </div>

                  {/* Links + Ask AI */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer"
                        aria-label={`View source code for ${project.title} on GitHub`}
                        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                        <FaGithub size={14} /> Code
                      </a>
                    )}
                    {isSicm(project.id) ? (
                      <>
                        <button onClick={() => setSicmOpen(true)}
                          aria-label={`Preview ${project.title}`}
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                          <Monitor size={14} /> Preview
                        </button>
                        <a href={project.demo} target="_blank" rel="noopener noreferrer"
                          aria-label={`Open ${project.title} website`}
                          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                          <ExternalLink size={14} /> Open Site
                        </a>
                      </>
                    ) : (
                      <a href={project.demo} target="_blank" rel="noopener noreferrer"
                        aria-label={`${project.github ? "Live demo" : "View project"} for ${project.title}`}
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                        <ExternalLink size={14} /> {project.github ? "Live Demo" : "View Project"}
                      </a>
                    )}
                    <button
                      onClick={() => openWithMessage(`Tell me about the project: ${project.title}`)}
                      aria-label={`Ask AI about ${project.title}`}
                      className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <MessageSquare size={12} /> Ask AI
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
      <SicmIframeModal open={sicmOpen} onClose={() => setSicmOpen(false)} />
    </section>
  );
}
