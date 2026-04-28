// Shared content for all three directions — Avyakt's actual portfolio data
const DATA = {
  name: "Avyakt Garg",
  tagline: "Builds AI systems. Carries a camera.",
  blurb: "MSCS at UW–Madison. Previously shipped marketplace infra at Uber, automated a biomedical lab at Saskatchewan. Currently writing CUDA kernels and RAG pipelines for fun.",
  contact: {
    email: "garg62@wisc.edu",
    phone: "(608) 259-0543",
    linkedin: "avyakt-garg",
    github: "github",
    location: "Madison, WI",
  },
  experience: [
    {
      role: "Software Intern",
      org: "Uber",
      period: "Jul 2024 — Jun 2025",
      bullets: [
        "Shipped a knowledge-work marketplace across 5+ countries for AI data annotation.",
        "Java SpringBoot rate-card service + gRPC APIs for cross-service integration.",
        "Kafka notification engine with cadence scheduling — 3× retention lift.",
        "Internal debug tool with 7 automated checks — 80% drop in dev pings.",
      ],
    },
    {
      role: "Mitacs Research Intern",
      org: "University of Saskatchewan",
      period: "May 2023 — Aug 2023",
      bullets: [
        "Automated RFID data pipeline for a biomedical lab — saved 3K+ manual hours/year.",
        "Redesigned a 6,600-row PostgreSQL schema around genealogy joins — 90% faster queries.",
      ],
    },
    {
      role: "Research Intern",
      org: "IIT Ropar",
      period: "Jul 2022 — Sept 2022",
      bullets: [
        "Trained ML models on 4K+ IoT health sensor points for real-time behavior prediction.",
      ],
    },
  ],
  projects: [
    {
      title: "RAG-Powered Portfolio Chatbot",
      stack: "Go · PostgreSQL · LLMs",
      body: "3-repo Go system. SSE-streamed LLM responses, pgvector cosine retrieval over Voyage AI embeddings on Neon. Pluggable Gemini/Groq backends, injection guardrails, HyDE retrieval.",
      tag: "Full-Stack AI",
    },
    {
      title: "GPU Vector Search Engine",
      stack: "CUDA · C/C++ · OpenMP",
      body: "IVF-PQ ANN index — the algorithm behind FAISS. Custom CUDA kernels with shared-memory tiling, parallel codebook training, recall@k vs. QPS benchmarks on SIFT1M.",
      tag: "Graduate HPC",
    },
    {
      title: "Graph Learning for Disease Prediction",
      stack: "Python · FastAPI · GraphSAGE",
      body: "Patient Similarity Networks + Bipartite Graphs over clinical data. 83.5% accuracy, 0.913 AUC-ROC with Nested CV. Deployed via FastAPI/Streamlit.",
      tag: "Graduate Project",
    },
    {
      title: "ICP Prediction from OCT Scans",
      stack: "PyTorch · 3D ResNet",
      body: "3D ResNet-18 over 512-frame retinal OCT videos, fine-tuned for safe intracranial-pressure thresholds. Advised by Prof. S. Raman.",
      tag: "Deep Learning",
    },
  ],
  skills: {
    "Languages": ["Python", "Go", "Java", "C/C++", "CUDA", "TypeScript", "SQL"],
    "Frameworks": ["React", "Node.js", "FastAPI", "SpringBoot", "PyTorch", "TensorFlow"],
    "AI / Data": ["LLMs", "RAG", "pgvector", "ANN Search", "PostgreSQL"],
    "Infra": ["Docker", "Kafka", "gRPC", "SSE", "Git", "CMake"],
  },
  education: [
    { school: "University of Wisconsin–Madison", degree: "M.S. Computer Science", period: "Sep 2025 — May 2027", grade: "GPA 4.00 / 4.00" },
    { school: "BITS Pilani", degree: "B.E. CS + M.Sc. Biological Sciences", period: "Nov 2020 — May 2025", grade: "GPA 9.01 / 10" },
  ],
  achievements: [
    { year: "2023", text: "Mitacs Globalink Research Scholarship — 1 of 30k+ applicants." },
    { year: "2022", text: "AWaDH Govt. of India Scholarship — AI for agriculture." },
    { year: "2019", text: "Gold Medalist, DPS R.K. Puram — 9 yrs academic excellence." },
  ],
};

// Mocked chatbot replies — believable, Avyakt-voiced
const CHAT_REPLIES = {
  greeting: [
    "Hey — Avyakt here. Ask me about projects, papers, or which lens I'd take to Madison in fall.",
    "Hi! What do you want to know — work, research, or photography?",
  ],
  project: "I'm proudest of the RAG chatbot — pure Go, three repos, SSE streaming, HyDE for retrieval. Closest I've come to writing systems code that feels like a product.",
  uber: "At Uber I worked on Knowledge Work — basically a marketplace where humans label data for ML teams. Built the rate-card and a Kafka notifier that 3×'d retention. Java SpringBoot on the backend, gRPC across services.",
  cuda: "The CUDA project is IVF-PQ from scratch — same algorithm FAISS uses. I'm tiling shared memory for the search kernel and benchmarking recall@k vs QPS on SIFT1M. Nsight Compute is my new favorite tool.",
  research: "Two stints — Saskatchewan (RFID + Postgres for a biomedical lab) and IIT Ropar (ML on IoT health data). The Postgres redesign cut query time 90% by treating genealogy as a graph.",
  photo: "I shoot mostly 35mm and a Fuji X-T4. Madison winters have been kind — frozen lakes, very flat light.",
  contact: "Best email is garg62@wisc.edu. LinkedIn is avyakt-garg. I read everything.",
  fallback: "Good question. The short answer: I'm an MSCS at UW–Madison, ex-Uber, and I build AI infra. Want me to go deeper on any of that?",
};

function pickReply(text) {
  const t = text.toLowerCase();
  if (/^(hi|hey|hello|yo|sup)/.test(t)) return CHAT_REPLIES.greeting[Math.floor(Math.random() * CHAT_REPLIES.greeting.length)];
  if (/uber|intern|spring|kafka/.test(t)) return CHAT_REPLIES.uber;
  if (/cuda|gpu|faiss|vector|ann/.test(t)) return CHAT_REPLIES.cuda;
  if (/research|mitacs|saskatchewan|iit|ropar/.test(t)) return CHAT_REPLIES.research;
  if (/photo|camera|shoot|film/.test(t)) return CHAT_REPLIES.photo;
  if (/email|contact|reach|hire/.test(t)) return CHAT_REPLIES.contact;
  if (/project|build|made|portfolio|rag|chatbot/.test(t)) return CHAT_REPLIES.project;
  return CHAT_REPLIES.fallback;
}

// Tiny live-ish API status hook — rotates state, generates a request graph
function useApiStatus() {
  const [status, setStatus] = React.useState({
    live: true,
    latency: 42,
    uptime: 99.94,
    history: Array.from({ length: 40 }, () => 30 + Math.random() * 50),
  });
  React.useEffect(() => {
    const id = setInterval(() => {
      setStatus((s) => {
        const blip = Math.random() < 0.04;
        const next = 25 + Math.random() * 60 + (blip ? 80 : 0);
        return {
          ...s,
          live: Math.random() < 0.985,
          latency: Math.round(next * 0.6),
          history: [...s.history.slice(1), next],
        };
      });
    }, 900);
    return () => clearInterval(id);
  }, []);
  return status;
}

window.DATA = DATA;
window.pickReply = pickReply;
window.useApiStatus = useApiStatus;
