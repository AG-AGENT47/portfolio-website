import { Section } from '@/components/ui/Section';
import type { PersonalInfo } from '@/lib/types';
import styles from './Contact.module.css';

export function Contact({ personal }: { personal: PersonalInfo }) {
  return (
    <Section
      id="contact"
      label="vii. fin"
      title={<>Say hello.<br /><em>I&apos;ll write back.</em></>}
      tide={false}
    >
      <div className={styles.contact}>
        <a href={`mailto:${personal.email}`} className={styles.mail}>
          {personal.email}
        </a>

        <div className={styles.grid}>
          {personal.phone && (
            <div><label>phone</label>{personal.phone}</div>
          )}
          {personal.linkedin && (
            <div>
              <label>linkedin</label>
              <a href={`https://linkedin.com/in/${personal.linkedin}`} target="_blank" rel="noopener noreferrer">
                {personal.linkedin}
              </a>
            </div>
          )}
          {personal.github && (
            <div>
              <label>github</label>
              <a href={personal.github} target="_blank" rel="noopener noreferrer">
                {personal.github.replace('https://github.com/', 'github.com/')}
              </a>
            </div>
          )}
          {personal.cv_url && (
            <div>
              <label>cv</label>
              <a href={personal.cv_url} download>↓ pdf, single page</a>
            </div>
          )}
        </div>
      </div>

      <footer className={styles.foot}>
        <span>© {new Date().getFullYear()} Avyakt Garg</span>
        <span>set in instrument serif &amp; ibm plex</span>
        <span>built in madison</span>
      </footer>
    </Section>
  );
}
