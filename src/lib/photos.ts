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
  {
    id: 'north-woods-trail',
    src: '/photos/north-woods-trail.jpg',
    alt: 'Placeholder image — a landscape stand-in for a future photo.',
    caption: 'North woods, late light',
    meta: 'placeholder',
  },
  {
    id: 'isthmus-fog',
    src: '/photos/isthmus-fog.jpg',
    alt: 'Placeholder image — a landscape stand-in for a future photo.',
    caption: 'Fog on the isthmus',
    meta: 'placeholder',
  },
  {
    id: 'ridgeline-dusk',
    src: '/photos/ridgeline-dusk.jpg',
    alt: 'Placeholder image — a landscape stand-in for a future photo.',
    caption: 'Ridgeline at dusk',
    meta: 'placeholder',
  },
];
