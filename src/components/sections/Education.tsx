import { Section } from '@/components/ui/Section';
import type { EducationEntry, Achievement } from '@/lib/types';
import styles from './Education.module.css';

interface EducationProps {
  education: EducationEntry[];
  achievements: Achievement[];
}

export function Education({ education, achievements }: EducationProps) {
  return (
    <Section
      id="education"
      label="v. school"
      title={<>Two degrees,<br /><em>and counting.</em></>}
      tideColor="#1f1812"
      tideColor2="#3a2e25"
    >
      <div className={styles.edu}>
        {education.map((e) => (
          <div key={e.id} className={styles.row}>
            <div className={styles.when}>{e.start_date} — {e.end_date ?? 'present'}</div>
            <div>
              <h3>{e.institution}</h3>
              <div className={styles.degree}>
                {e.degree}, {e.field}
                {e.gpa && e.gpa_scale && (
                  <em> — {Number(e.gpa).toFixed(2)}/{Number(e.gpa_scale).toFixed(2)}</em>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className={styles.achTitle}>Honors</div>
        <div className={styles.achList}>
          {achievements.map((a) => (
            <div key={a.id} className={styles.achRow}>
              <span>{a.year ?? ''}</span>
              <span>{a.title} — {a.organization}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
