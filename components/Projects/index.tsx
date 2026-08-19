"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ExternalLink, FolderOpen } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import Image from "next/image";
import { projects, projectFilters, type ProjectCategory } from "@/data/projects";

function ProjectThumbnail({ project }: { project: (typeof projects)[number] }) {
  const [imgError, setImgError] = useState(false);
  if (!imgError && project.image) {
    return (
      <Image
        src={project.image}
        alt={project.title}
        fill
        className="object-cover object-top"
        onError={() => setImgError(true)}
        unoptimized={project.image.endsWith(".svg")}
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
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const filtered = active === "all" ? projects : projects.filter((p) => p.category === active);

  const categoryColors: Record<string, string> = {
    frontend: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    backend: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    fullstack: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    database: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  };

  return (
    <section id="projects" className="section-padding relative" ref={ref}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-3 block">What I&apos;ve Built</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white section-title">Featured Projects</h2>
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
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "glass text-slate-400 hover:text-white hover:bg-white/5"
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
                className="glass-card rounded-2xl overflow-hidden group hover:border-blue-500/30 transition-all duration-300"
              >
                {/* Project image */}
                <div className="relative h-44 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                  <ProjectThumbnail project={project} />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-3">
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
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/80 backdrop-blur text-white text-xs hover:bg-blue-600 transition-all"
                    >
                      <ExternalLink size={14} /> {project.github ? "Live Demo" : "View Project"}
                    </a>
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
                  <h3 className="text-white font-bold text-base mb-2">{project.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">{project.description}</p>

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span key={tech} className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-300 border border-blue-500/15">
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="px-2 py-0.5 rounded text-xs text-slate-500">+{project.technologies.length - 4}</span>
                    )}
                  </div>

                  {/* Links */}
                  <div className="flex gap-3">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs transition-colors"
                      >
                        <FaGithub size={14} /> Code
                      </a>
                    )}
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs transition-colors"
                    >
                      <ExternalLink size={14} /> {project.github ? "Live Demo" : "View Project"}
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Portfolio CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 glass-card rounded-2xl p-8 text-center"
        >
          <h3 className="text-white font-bold text-xl mb-2">🌐 Full Stack Developer Portfolio</h3>
          <p className="text-slate-400 text-sm mb-4 max-w-xl mx-auto">
            Explore my complete portfolio showcasing software engineering projects, full-stack applications, frontend interfaces, backend APIs, and database systems.
          </p>
          <a
            href="https://queleminetech.info"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium"
          >
            <ExternalLink size={16} />
            Visit queleminetech.info
          </a>
        </motion.div>
      </div>
    </section>
  );
}
