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
  logo: {
    url: string;
  };
  loginLogo: {
    url: string;
  };
  cv: {
    url: string;
    filename: string;
    uploadDate: string;
  };
  featuredVideo?: {
    url: string;
    filename: string;
    title?: string;
    description?: string;
  };
  projects: Project[];
  education: Education[];
  skills?: SkillCategoryAdmin[];
  communication?: CommunicationItem[];
  languages?: LanguageItem[];
  workTogether?: WorkTogetherSettings;
  whatsapp?: WhatsAppSettings;
  map?: MapSettings;
  colors: ColorTheme;
  typography: TypographySettings;
  siteContent: SiteContent;
  // Legacy field — credentials now live in a separate store and must never
  // appear in public settings responses.
  security?: {
    username: string;
    password: string;
    securityQuestion: string;
    securityAnswer: string;
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
  mutedText?: string;
  borderColor?: string;
}

export interface SkillCategoryAdmin {
  id: string;
  title: string;
  icon: string;
  tags: string[];
  capabilities: string[];
  enabled: boolean;
  order: number;
}

export interface CommunicationItem {
  id: string;
  icon: string;
  title: string;
  desc: string;
  color: string;
  bg: string;
  enabled: boolean;
  order: number;
}

export interface LanguageItem {
  id: string;
  name: string;
  level: string;
  flag: string;
  proficiency: number;
  badge: string;
  color: string;
  enabled: boolean;
  order: number;
}

export interface WorkService {
  id: string;
  title: string;
  desc?: string;
  icon?: string;
  enabled: boolean;
  order: number;
}

export interface WorkTogetherSettings {
  label?: string;
  title?: string;
  description?: string;
  availabilityText?: string;
  services: WorkService[];
}

export interface WhatsAppSettings {
  primaryNumber: string;
  secondaryNumber?: string;
  message: string;
  buttonLabel: string;
  enabled: boolean;
}

export interface MapSettings {
  address: string;
  embedUrl: string;
  enabled: boolean;
}

export interface TypographySettings {
  fontFamily: string;
  fontSize: {
    base: string;
    h1: string;
    h2: string;
    h3: string;
    small: string;
  };
  lineHeight: {
    normal: string;
    relaxed: string;
  };
  textAlign: "left" | "center" | "right";
  fontWeight: {
    normal: string;
    medium: string;
    bold: string;
  };
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
    image: string;
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
