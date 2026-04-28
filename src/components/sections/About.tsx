import { Section } from '@/components/ui/Section';
import type { PersonalInfo } from '@/lib/types';
import styles from './About.module.css';

export function About({ personal }: { personal: PersonalInfo }) {
  return (
    <Section
      id="about"
      label="i. about"
      title={<>A software engineer<br /><em>who reads carefully.</em></>}
    >
      <div className={styles.about}>
        <p>{personal.bio}</p>
        <p>I&apos;m a team player you can rely on. I leave the codebase cleaner than I found it. On weekends, I am out searching for frames.</p>
      </div>
    </Section>
  );
}
