'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useReducedMotion } from '@/lib/useReducedMotion';
import type { Photo } from '@/lib/photos';
import styles from './Lightbox.module.css';

interface LightboxProps {
  photos: Photo[];
  index: number;
  onNavigate: (nextIndex: number) => void;
  onClose: () => void;
}

const EXIT_MS = 170;

export function Lightbox({ photos, index, onNavigate, onClose }: LightboxProps) {
  const reduced = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<Element | null>(null);
  const [entered, setEntered] = useState(false);
  const [closing, setClosing] = useState(false);
  const [errored, setErrored] = useState(false);

  const photo = photos[index];
  const many = photos.length > 1;

  const requestClose = useCallback(() => {
    if (reduced) return onClose();
    setClosing(true);
    setEntered(false);
    window.setTimeout(onClose, EXIT_MS);
  }, [reduced, onClose]);

  const go = useCallback(
    (dir: 1 | -1) => {
      setErrored(false);
      onNavigate((index + dir + photos.length) % photos.length);
    },
    [index, photos.length, onNavigate]
  );

  // Mount: remember the opener, lock body scroll, play the enter transition.
  useEffect(() => {
    openerRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const raf = requestAnimationFrame(() => setEntered(true));
    dialogRef.current?.focus();

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      const opener = openerRef.current;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  // Keyboard: Esc closes, arrows navigate, Tab is trapped inside the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        requestClose();
      } else if (e.key === 'ArrowRight' && many) {
        go(1);
      } else if (e.key === 'ArrowLeft' && many) {
        go(-1);
      } else if (e.key === 'Tab') {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === dialogRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [many, go, requestClose]);

  if (typeof document === 'undefined' || !photo) return null;

  const show = entered && !closing;

  return createPortal(
    <div
      className={`${styles.backdrop}${show ? ` ${styles.show}` : ''}`}
      onClick={requestClose}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={`${photo.caption} — photo ${index + 1} of ${photos.length}`}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.close} onClick={requestClose} aria-label="Close gallery">
          ✕
        </button>

        <div className={styles.stage}>
          {many && (
            <button
              className={`${styles.arrow} ${styles.prev}`}
              onClick={() => go(-1)}
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}

          <figure className={styles.figure}>
            <div className={styles.frame} key={photo.id}>
              {errored ? (
                <div className={styles.missing}>
                  Photo file not added yet
                  <code>public{photo.src}</code>
                </div>
              ) : (
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  priority
                  sizes="100vw"
                  className={styles.img}
                  onError={() => setErrored(true)}
                />
              )}
            </div>
            <figcaption className={styles.caption}>
              <span className={styles.capText}>{photo.caption}</span>
              {photo.meta && <span className={styles.capMeta}>{photo.meta}</span>}
              {many && (
                <span className={styles.count}>
                  {index + 1} / {photos.length}
                </span>
              )}
            </figcaption>
          </figure>

          {many && (
            <button
              className={`${styles.arrow} ${styles.next}`}
              onClick={() => go(1)}
              aria-label="Next photo"
            >
              ›
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
