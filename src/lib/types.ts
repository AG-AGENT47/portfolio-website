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
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
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
