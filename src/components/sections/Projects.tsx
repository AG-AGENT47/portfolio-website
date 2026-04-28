'use client';
import { useState } from 'react';
import { Section } from '@/components/ui/Section';
import type { Project } from '@/lib/types';
import styles from './Projects.module.css';

const CATEGORY_LABELS: Record<Project['category'], string> = {
  research:     'Research',
  personal:     'Personal Project',
  coursework:   'Graduate Work',
  professional: 'Professional',
};

export function Projects({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState(0);
  const p = projects[active];

  return (
    <Section
      id="projects"
      label="iii. projects"
      title={<>Things I&apos;ve shipped,<br /><em>or am shipping now.</em></>}
      dark
    >
      <div className={styles.layout}>
        <ol className={styles.list}>
          {projects.map((proj, i) => (
            <li
              key={proj.id}
              className={i === active ? styles.active : ''}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
            >
              <span className={styles.num}>0{i + 1}</span>
              <span className={styles.name}>{proj.title}</span>
              <span className={styles.stack}>{proj.tech_stack.slice(0, 3).join(' · ')}</span>
            </li>
          ))}
        </ol>

        <div className={styles.detail}>
          <div className={styles.detailBlob} />
          <div className={styles.detailContent} key={active}>
            <div className={styles.tag}>{CATEGORY_LABELS[p.category]}</div>
            <h3>{p.title}</h3>
            <div className={styles.stackLine}>{p.tech_stack.join(' · ')}</div>
            <p>{p.description}</p>
            <div className={styles.links}>
              {p.github_url && (
                <a href={p.github_url} target="_blank" rel="noopener noreferrer" className={styles.cta}>
                  view on github →
                </a>
              )}
              {p.live_url && (
                <a href={p.live_url} target="_blank" rel="noopener noreferrer" className={styles.cta}>
                  live demo →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile accordion */}
      <div className={styles.accordion}>
        {projects.map((proj, i) => (
          <div key={proj.id} className={`${styles.accordionItem}${i === active ? ` ${styles.accordionActive}` : ''}`}>
            <button onClick={() => setActive(active === i ? -1 : i)}>
              <span className={styles.num}>0{i + 1}</span>
              <span>{proj.title}</span>
              <span className={styles.chevron}>{active === i ? '↑' : '↓'}</span>
            </button>
            {active === i && (
              <div className={styles.accordionBody}>
                <div className={styles.tag}>{CATEGORY_LABELS[proj.category]}</div>
                <div className={styles.stackLine}>{proj.tech_stack.join(' · ')}</div>
                <p>{proj.description}</p>
                <div className={styles.links}>
                  {proj.github_url && (
                    <a href={proj.github_url} target="_blank" rel="noopener noreferrer" className={styles.cta}>
                      view on github →
                    </a>
                  )}
                  {proj.live_url && (
                    <a href={proj.live_url} target="_blank" rel="noopener noreferrer" className={styles.cta}>
                      live demo →
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
