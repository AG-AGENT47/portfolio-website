import { neon } from '@neondatabase/serverless';
import type { PortfolioData, PersonalInfo, Skill, SkillsByCategory, ExperienceEntry, Project, EducationEntry, Achievement } from './types';

function getDb() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  return neon(process.env.DATABASE_URL);
}

export async function getPortfolioData(): Promise<PortfolioData> {
  if (!process.env.DATABASE_URL) return getDevFallback();

  const sql = getDb();

  const [personalRows, experienceRows, projectRows, skillRows, educationRows, achievementRows] = await Promise.all([
    sql`SELECT key, value FROM personal_info`,
    sql`SELECT id, company, role, location,
               to_char(start_date, 'Mon YYYY') AS start_date,
               to_char(end_date, 'Mon YYYY') AS end_date,
               is_current, description, bullets, display_order
        FROM experience
        ORDER BY display_order ASC`,
    sql`SELECT id, title, category, description, bullets, tech_stack,
               github_url, live_url, collaborator, is_featured, display_order
        FROM projects
        WHERE is_featured = TRUE
        ORDER BY display_order ASC`,
    sql`SELECT id, name, category, proficiency, years_of_experience, display_order
        FROM skills
        ORDER BY category ASC, display_order ASC`,
    sql`SELECT id, institution, degree, field,
               to_char(start_date, 'Mon YYYY') AS start_date,
               to_char(end_date, 'Mon YYYY') AS end_date,
               gpa::text, gpa_scale::text, courses, display_order
        FROM education
        ORDER BY display_order ASC`,
    sql`SELECT id, title, organization, description,
               EXTRACT(YEAR FROM date)::int AS year,
               category, display_order
        FROM achievements
        ORDER BY display_order ASC`,
  ]);

  const personal: PersonalInfo = {
    name: '', email: '', phone: '', linkedin: '', github: '',
    location: '', bio: '', tagline: '', cv_url: undefined,
  };
  for (const row of personalRows) {
    const key = row.key as keyof PersonalInfo;
    (personal as unknown as Record<string, string>)[key] = row.value as string;
  }

  const skills: SkillsByCategory = { language: [], framework: [], tool: [], concept: [] };
  for (const row of skillRows) {
    const s = row as unknown as Skill;
    skills[s.category]?.push(s);
  }

  return {
    personal,
    experience: experienceRows.map((r) => ({
      ...r,
      bullets: Array.isArray(r.bullets) ? r.bullets : (r.bullets ? JSON.parse(r.bullets as string) : []),
    })) as unknown as ExperienceEntry[],
    projects: projectRows.map((r) => ({
      ...r,
      bullets: Array.isArray(r.bullets) ? r.bullets : (r.bullets ? JSON.parse(r.bullets as string) : []),
      tech_stack: (r.tech_stack as string[] | null) ?? [],
    })) as unknown as Project[],
    skills,
    education: educationRows as unknown as EducationEntry[],
    achievements: achievementRows as unknown as Achievement[],
  };
}

function getDevFallback(): PortfolioData {
  return {
    personal: {
      name: 'Avyakt Garg',
      email: 'garg62@wisc.edu',
      phone: '(608) 259-0543',
      linkedin: 'avyakt-garg',
      github: 'https://github.com/AG-AGENT47',
      location: 'Madison, WI',
      bio: 'MS CS student at UW-Madison and ex-Uber SWE intern. I build at the intersection of machine learning and distributed systems — from Kafka-based notification engines at Uber to graph neural networks for clinical disease prediction.',
      tagline: 'Building at the intersection of ML and distributed systems',
    },
    experience: [
      {
        id: '1', company: 'Uber', role: 'Software Engineer Intern', location: 'Hyderabad, India',
        start_date: 'May 2026', end_date: null, is_current: false, description: 'Upcoming Summer 2026.',
        bullets: [], display_order: 1,
      },
      {
        id: '2', company: 'Uber', role: 'Software Engineer Intern', location: 'Hyderabad, India',
        start_date: 'Jul 2024', end_date: 'Jun 2025', is_current: false, description: null,
        bullets: [
          'Developed a knowledge work marketplace for 5+ countries covering data annotation workflows.',
          'Implemented a rate-card system in Java SpringBoot; gRPC APIs for cross-service integration.',
          'Created a Kafka-based notification engine — improved customer retention funnel 3×.',
          'Built a debug tool with 7 automated checks — reduced developer dependency by 80%.',
        ],
        display_order: 2,
      },
      {
        id: '3', company: 'University of Saskatchewan', role: 'Mitacs Research Intern',
        location: 'Saskatoon, SK', start_date: 'May 2023', end_date: 'Aug 2023',
        is_current: false, description: null,
        bullets: [
          'Automated RFID data pipeline for a biomedical lab — saved 3,000+ manual hours/year.',
          'Revamped cattle DB with 6,600+ entries — 90% faster queries via genealogy indexing.',
        ],
        display_order: 3,
      },
    ],
    projects: [
      {
        id: '1', title: 'RAG-Powered Portfolio Chatbot', category: 'personal',
        description: '3-repo Go system powering this portfolio AI chat. SSE-streamed LLM responses, hybrid vector+FTS retrieval with Voyage AI on Neon.',
        bullets: [], tech_stack: ['Go', 'PostgreSQL', 'pgvector', 'Voyage AI', 'Groq', 'SSE'],
        github_url: null, live_url: 'https://rag-chatbot-qge9.onrender.com',
        collaborator: null, is_featured: true, display_order: 0,
      },
      {
        id: '2', title: 'GPU-Accelerated ANN Search with IVF-PQ', category: 'coursework',
        description: 'IVF-PQ ANN index in CUDA C/C++ — the algorithm behind FAISS. Shared-memory tiling, parallel codebook training, benchmarked on SIFT1M.',
        bullets: [], tech_stack: ['CUDA', 'C++', 'OpenMP', 'Thrust', 'CMake'],
        github_url: null, live_url: null, collaborator: null, is_featured: true, display_order: 1,
      },
      {
        id: '3', title: 'Graph Learning for Heart Disease Prediction', category: 'research',
        description: 'GraphSAGE + Node2Vec on Patient Similarity Networks — 83.5% accuracy, 0.913 AUC-ROC. Deployed via FastAPI + Streamlit.',
        bullets: [], tech_stack: ['Python', 'PyTorch', 'GraphSAGE', 'FastAPI', 'Streamlit'],
        github_url: 'https://github.com/AG-AGENT47/heart-disease-gnn',
        live_url: 'https://heart-disease-gnn-veoy8p8y2h6z2ahnszpcnm.streamlit.app',
        collaborator: null, is_featured: true, display_order: 2,
      },
    ],
    skills: {
      language:  [
        { id: '1', name: 'Java',       category: 'language', proficiency: 'expert',       years_of_experience: 3, display_order: 1 },
        { id: '2', name: 'Python',     category: 'language', proficiency: 'expert',       years_of_experience: 4, display_order: 2 },
        { id: '3', name: 'C/C++',      category: 'language', proficiency: 'advanced',     years_of_experience: 3, display_order: 3 },
        { id: '4', name: 'SQL',        category: 'language', proficiency: 'intermediate', years_of_experience: 3, display_order: 4 },
      ],
      framework: [
        { id: '5', name: 'SpringBoot', category: 'framework', proficiency: 'advanced', years_of_experience: 2, display_order: 1 },
        { id: '6', name: 'PyTorch',    category: 'framework', proficiency: 'advanced', years_of_experience: 3, display_order: 2 },
        { id: '7', name: 'CUDA',       category: 'framework', proficiency: 'intermediate', years_of_experience: 1, display_order: 3 },
      ],
      tool: [
        { id: '8', name: 'Kafka',  category: 'tool', proficiency: 'advanced', years_of_experience: 1, display_order: 1 },
        { id: '9', name: 'Docker', category: 'tool', proficiency: 'intermediate', years_of_experience: 2, display_order: 2 },
        { id: '10', name: 'Git',   category: 'tool', proficiency: 'expert', years_of_experience: 4, display_order: 3 },
      ],
      concept: [],
    },
    education: [
      {
        id: '1', institution: 'University of Wisconsin–Madison', degree: 'M.S.', field: 'Computer Science',
        start_date: 'Sep 2025', end_date: 'May 2027', gpa: '4.00', gpa_scale: '4.00',
        courses: null, display_order: 1,
      },
      {
        id: '2', institution: 'BITS Pilani', degree: 'B.E. + M.Sc. (Dual Degree)', field: 'CS + Biological Sciences',
        start_date: 'Nov 2020', end_date: 'May 2025', gpa: '9.01', gpa_scale: '10.00',
        courses: null, display_order: 2,
      },
    ],
    achievements: [
      { id: '1', title: 'Globalink Research Scholarship', organization: 'MITACS, Canada', description: null, date: null, year: 2023, category: 'scholarship', display_order: 1 },
      { id: '2', title: 'Scholarship Awardee', organization: 'AWaDH, Govt. of India', description: null, date: null, year: 2022, category: 'scholarship', display_order: 2 },
      { id: '3', title: 'Gold Medalist', organization: 'DPS R.K. Puram', description: null, date: null, year: 2019, category: 'award', display_order: 3 },
    ],
  };
}
