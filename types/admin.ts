// Admin Settings Types
export interface AdminSettings {
  profile: {
    name: string;
    title: string;
    subtitle: string;
    description: string;
    location: string;
    availableForWork: boolean;
    profileImage: string;
  };
  cv: {
    url: string;
    filename: string;
    uploadDate: string;
  };
  projects: Project[];
  education: Education[];
  colors: ColorTheme;
  siteContent: SiteContent;
  security: {
    password: string;
  };
}

export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  category: "frontend" | "backend" | "fullstack" | "database";
  github?: string;
  demo: string;
  featured: boolean;
  finished: boolean;
}

export interface Education {
  id: number;
  degree: string;
  institution: string;
  location: string;
  period: string;
  status: "Completed" | "In Progress";
  description: string;
  icon: "GraduationCap" | "BookOpen" | "Award";
}

export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  cardBackground: string;
}

export interface SiteContent {
  hero: {
    badge: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    description: string;
    viewProjects: string;
    downloadCV: string;
    contactMe: string;
    availableForWork: string;
  };
  about: {
    sectionLabel: string;
    sectionTitle: string;
    bio1: string;
    bio2: string;
    bio3: string;
    bio4: string;
    tags: string[];
    getInTouch: string;
    downloadCV: string;
    highlights: {
      international: { label: string; desc: string };
      education: { label: string; desc: string };
      stack: { label: string; desc: string };
      location: { label: string; desc: string };
    };
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  social: {
    github: string;
    linkedin: string;
    twitter: string;
  };
}