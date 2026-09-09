// Hero photo gallery — the single source for the "clicks" the hero portrait
// opens into. Image files live in `public/photos/` (see that folder's README).
//
// NOTE: every image below is currently a random placeholder from picsum.photos
// so the gallery is testable. Replace the files in public/photos/ with real
// shots (keep the same names, or update `src` here) and rewrite the captions.
//
// v2: move this to a `photos` table in portfolio-store (id, src, alt, caption,
// meta, display_order) and fetch it in lib/db.ts — the shape below is what the
// query should return, so the components won't need to change.

export interface Photo {
  id: string;
  /** Path under /public, e.g. "/photos/golden-hour-lake-wisconsin.jpg". */
  src: string;
  /** Meaningful alt text — describe the scene, not "a photo". */
  alt: string;
  /** One line shown under the image in the lightbox. */
  caption: string;
  /** Optional place · date line under the caption. */
  meta?: string;
}

const PLACEHOLDER_ALT = 'Placeholder image — a random landscape standing in for a future photo.';

export const PHOTOS: Photo[] = [
  {
    id: 'golden-hour-lake-wisconsin',
    src: '/photos/golden-hour-lake-wisconsin.jpg',
    alt:
      'Sunset over Lake Wisconsin: a burning orange-and-grey sky mirrored in still water, ' +
      'with a low tree-lined shore and a small pier in silhouette.',
    caption: 'Golden hour at Lake Wisconsin',
    meta: 'Lake Wisconsin · 2025 · placeholder',
  },
  { id: 'placeholder-2', src: '/photos/placeholder-2.jpg', alt: PLACEHOLDER_ALT, caption: 'Placeholder 02', meta: 'swap me' },
  { id: 'placeholder-3', src: '/photos/placeholder-3.jpg', alt: PLACEHOLDER_ALT, caption: 'Placeholder 03', meta: 'swap me' },
  { id: 'placeholder-4', src: '/photos/placeholder-4.jpg', alt: PLACEHOLDER_ALT, caption: 'Placeholder 04', meta: 'swap me' },
  { id: 'placeholder-5', src: '/photos/placeholder-5.jpg', alt: PLACEHOLDER_ALT, caption: 'Placeholder 05', meta: 'swap me' },
];
