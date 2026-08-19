import { IMAGES } from "@/lib/images";

export type ProjectCategory = "all" | "frontend" | "backend" | "fullstack" | "database";

export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  category: ProjectCategory;
  github: string;
  demo: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "Full Stack Web Application",
    description: "A modern full-stack web application built with React.js frontend and Spring Boot backend, featuring user authentication, REST APIs, and MySQL database integration.",
    image: IMAGES.projects[1],
    technologies: ["React.js", "Spring Boot", "MySQL", "REST API", "Java"],
    category: "fullstack",
    github: "https://github.com/quelemine",
    demo: "https://queleminetech.info",
    featured: true,
  },
  {
    id: 2,
    title: "Backend REST API System",
    description: "A robust RESTful API system developed with Java and Spring Boot, providing secure endpoints for data management with PostgreSQL database.",
    image: IMAGES.projects[2],
    technologies: ["Java", "Spring Boot", "PostgreSQL", "REST API"],
    category: "backend",
    github: "https://github.com/quelemine",
    demo: "https://queleminetech.info",
    featured: true,
  },
  {
    id: 3,
    title: "Responsive Frontend Interface",
    description: "A modern, responsive web interface built with HTML5, CSS3, and JavaScript featuring clean UI design and smooth user interactions.",
    image: IMAGES.projects[3],
    technologies: ["HTML5", "CSS3", "JavaScript", "Responsive Design"],
    category: "frontend",
    github: "https://github.com/quelemine",
    demo: "https://queleminetech.info",
    featured: false,
  },
  {
    id: 4,
    title: "Database Management System",
    description: "A comprehensive database-driven application with optimized SQL queries, relational database design, and efficient data management using MySQL.",
    image: IMAGES.projects[4],
    technologies: ["MySQL", "SQL", "PHP", "Database Design"],
    category: "database",
    github: "https://github.com/quelemine",
    demo: "https://queleminetech.info",
    featured: false,
  },
  {
    id: 5,
    title: "PHP Web Application",
    description: "A dynamic web application built with PHP backend, featuring server-side rendering, database integration, and user management system.",
    image: IMAGES.projects[5],
    technologies: ["PHP", "MySQL", "HTML5", "CSS3", "JavaScript"],
    category: "fullstack",
    github: "https://github.com/quelemine",
    demo: "https://queleminetech.info",
    featured: true,
  },
  {
    id: 6,
    title: "React.js Portfolio Dashboard",
    description: "An interactive dashboard built with React.js featuring data visualization, component-based architecture, and modern UI/UX design principles.",
    image: IMAGES.projects[6],
    technologies: ["React.js", "JavaScript", "CSS3", "REST API"],
    category: "frontend",
    github: "https://github.com/quelemine",
    demo: "https://queleminetech.info",
    featured: false,
  },
];

export const projectFilters = [
  { id: "all", label: "All Projects" },
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "fullstack", label: "Full Stack" },
  { id: "database", label: "Database" },
];
