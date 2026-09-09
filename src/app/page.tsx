import { getPortfolioData } from '@/lib/db';
import { TideProvider } from '@/components/ui/TideContext';
import { FnDefs } from '@/components/ui/FnDefs';
import { StickyNav } from '@/components/nav/StickyNav';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Experience } from '@/components/sections/Experience';
import { Projects } from '@/components/sections/Projects';
import { Skills } from '@/components/sections/Skills';
import { Education } from '@/components/sections/Education';
import { Chat } from '@/components/sections/Chat';
import { Contact } from '@/components/sections/Contact';
// v2: import { Photography } from '@/components/sections/Photography';

export const revalidate = 3600;

export default async function Home() {
  const data = await getPortfolioData();

  // The chat sidebar describes the service powering it — sourced from the
  // RAG chatbot's own project row so it stays in sync with portfolio-store.
  const chatbotProject =
    data.projects.find((p) => /rag|chatbot/i.test(p.title)) ?? null;

  return (
    <TideProvider>
      <FnDefs />
      <StickyNav />
      <main>
        <Hero personal={data.personal} />
        <About personal={data.personal} />
        <Experience experience={data.experience} />
        <Projects projects={data.projects} />
        <Skills skills={data.skills} />
        <Education education={data.education} achievements={data.achievements} />
        {/* v2: <Photography photos={data.photos} /> */}
        <Chat project={chatbotProject} />
        <Contact personal={data.personal} />
      </main>
    </TideProvider>
  );
}
