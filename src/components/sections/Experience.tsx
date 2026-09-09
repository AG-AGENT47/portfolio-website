import { Section } from '@/components/ui/Section';
import type { ExperienceEntry } from '@/lib/types';
import styles from './Experience.module.css';

function formatPeriod(e: ExperienceEntry): string {
  if (e.is_upcoming) return `Starting ${e.start_date}`;
  const end = e.is_current ? 'present' : (e.end_date ?? 'present');
  return `${e.start_date} — ${end}`;
}

export function Experience({ experience }: { experience: ExperienceEntry[] }) {
  return (
    <Section
      id="work"
      label="ii. experience"
      title={<>Where the work<br /><em>actually happened.</em></>}
      tideColor="#1f1812"
      tideColor2="#3a2e25"
    >
      <div className={styles.exp}>
        {experience.map((e) => (
          <div key={e.id} className={styles.row}>
            <div className={styles.when}>
              {formatPeriod(e)}
              {e.is_upcoming && <span className={styles.upcomingBadge}>upcoming</span>}
            </div>
            <div className={styles.body}>
              <h3>{e.company}</h3>
              <div className={styles.role}>{e.role}</div>
              {e.location && <div className={styles.loc}>{e.location}</div>}
              {e.bullets.length > 0 && (
                <ul>
                  {e.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
