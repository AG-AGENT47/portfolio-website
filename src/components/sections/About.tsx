import { Section } from '@/components/ui/Section';
import { richText } from '@/lib/richText';
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
        {personal.bio && <p>{personal.bio}</p>}
        {personal.about_p2 && <p>{richText(personal.about_p2)}</p>}
      </div>
    </Section>
  );
}
