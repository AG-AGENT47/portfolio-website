import { Section } from '@/components/ui/Section';
import type { SkillsByCategory } from '@/lib/types';
import styles from './Skills.module.css';

const CATEGORY_DISPLAY: Record<string, string> = {
  language:  'Languages',
  framework: 'Frameworks & Libraries',
  tool:      'Tools & Platforms',
  concept:   'Concepts',
};

export function Skills({ skills }: { skills: SkillsByCategory }) {
  const categories = (['language', 'framework', 'tool', 'concept'] as const).filter(
    (c) => skills[c].length > 0
  );

  return (
    <Section
      id="skills"
      label="iv. stack"
      title={<>The tools<br /><em>on my desk.</em></>}
    >
      <div className={styles.grid}>
        {categories.map((cat) => (
          <div key={cat} className={styles.block}>
            <h4>{CATEGORY_DISPLAY[cat]}</h4>
            <div className={styles.tags}>
              {skills[cat].map((s) => (
                <span key={s.id}>{s.name}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
