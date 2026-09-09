'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Lightbox } from './Lightbox';
import type { Photo } from '@/lib/photos';
import styles from './HeroPhoto.module.css';

interface HeroPhotoProps {
  photos: Photo[];
  /** Shown under the frame when there are no photos, or as a backstop caption. */
  fallbackCaption?: string;
}

export function HeroPhoto({ photos, fallbackCaption }: HeroPhotoProps) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  const [imgBroken, setImgBroken] = useState(false);

  const cover = photos[0];
  const count = photos.length;
  const caption = cover?.caption ?? fallbackCaption;

  // No photos wired up yet — keep the original placeholder so nothing regresses.
  if (!cover) {
    return (
      <div className={styles.placeholder}>
        <div className={styles.stripes} />
        {fallbackCaption && <div className={styles.cap}>[ {fallbackCaption} ]</div>}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-label={
          count === 1
            ? `Open photo: ${cover.caption}`
            : `Open photo gallery — ${count} photos`
        }
        onClick={() => setOpenAt(0)}
      >
        {imgBroken ? (
          <div className={styles.stripes} />
        ) : (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            priority
            sizes="(max-width: 879px) 100vw, 360px"
            className={styles.img}
            onError={() => setImgBroken(true)}
          />
        )}

        <span className={styles.badge}>{count === 1 ? '1 photo' : `${count} photos`}</span>
        <span className={styles.hint} aria-hidden="true">
          see more of my clicks →
        </span>
        {caption && <span className={styles.cap}>[ {caption} ]</span>}
      </button>

      {openAt !== null && (
        <Lightbox
          photos={photos}
          index={openAt}
          onNavigate={setOpenAt}
          onClose={() => setOpenAt(null)}
        />
      )}
    </>
  );
}
