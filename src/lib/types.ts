export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
  bio: string;
  tagline: string;
  cv_url?: string;

  // Website copy — sourced from portfolio-store `personal_info` (see seeds/personal_info.sql).
  // All optional: the UI degrades gracefully when a key is absent.
  hero_eyebrow?: string;
  hero_lede?: string;          // "\n" = line break, *phrase* = emphasis
  hero_pills?: string;         // "|"-separated
  about_p2?: string;
  now_location?: string;
  now_reading?: string;
  now_building?: string;
  now_shooting?: string;
  portrait_caption?: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  /** start_date is in the future — the role hasn't begun yet. */
  is_upcoming: boolean;
  description: string | null;
  bullets: string[];
  display_order: number;
}

export interface Project {
  id: string;
  title: string;
  category: 'research' | 'personal' | 'coursework' | 'professional';
  description: string | null;
  bullets: string[];
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  collaborator: string | null;
  is_featured: boolean;
  display_order: number;
}

export interface Skill {
  id: string;
  name: string;
  category: 'language' | 'framework' | 'tool' | 'concept';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience: number | null;
  display_order: number;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string | null;
  gpa: string | null;
  gpa_scale: string | null;
  courses: string[] | null;
  display_order: number;
}

export interface Achievement {
  id: string;
  title: string;
  organization: string;
  description: string | null;
  date: string | null;
  year?: number | null;
  category: 'scholarship' | 'award' | 'competition' | 'recognition';
  display_order: number;
}

export interface SkillsByCategory {
  language: Skill[];
  framework: Skill[];
  tool: Skill[];
  concept: Skill[];
}

export interface PortfolioData {
  personal: PersonalInfo;
  experience: ExperienceEntry[];
  projects: Project[];
  skills: SkillsByCategory;
  education: EducationEntry[];
  achievements: Achievement[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
