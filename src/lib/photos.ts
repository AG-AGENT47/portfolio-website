// Hero photo gallery — the single source for the "clicks" the hero portrait
// opens into. Image files live in `public/photos/` (see that folder's README).
//
// Photos are shot on a Canon R6 or an iPhone 13 Pro, exported at 2400px on the
// long edge (JPEG q92) so the lightbox stays sharp on hi-dpi screens.
//
// v2: move this to a `photos` table in portfolio-store (id, src, alt, caption,
// meta, display_order) and fetch it in lib/db.ts — the shape below is what the
// query should return, so the components won't need to change.

export interface Photo {
  id: string;
  /** Path under /public, e.g. "/photos/big-sur-california.jpg". */
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
    id: 'big-sur-california',
    src: '/photos/big-sur-california.jpg',
    alt:
      'The Big Sur coastline under a clear blue sky: rugged tan and grey rocks in the foreground, ' +
      'white surf streaking across deep blue water, and green hills running out to the horizon.',
    caption: 'Big Sur coastline',
    meta: 'Big Sur, California',
  },
  {
    id: 'aero-india-bangalore',
    src: '/photos/aero-india-bangalore.jpg',
    alt:
      'Four red-and-white jets of an air display team banking across a blue sky, ' +
      'each trailing a white smoke line.',
    caption: 'Formation flying at Aero India',
    meta: 'Aero India, Bangalore, India',
  },
  {
    id: 'madison-transit',
    src: '/photos/madison-transit.jpg',
    alt:
      'Looking down the aisle of a city bus in silhouette: a passenger with crossed legs caught in a ' +
      'shaft of sunlight, and stopped traffic and red brake lights visible through the windshield.',
    caption: 'Transit',
    meta: 'Madison, Wisconsin',
  },
  {
    id: 'aurora-madison',
    src: '/photos/aurora-madison.jpg',
    alt:
      'Aurora over a lake at night: tall red and orange columns of light fading into green at the ' +
      'horizon, with stars above and a small pier lit in blue in the foreground.',
    caption: 'Aurora over the lake',
    meta: 'Madison, Wisconsin',
  },
  {
    id: 'golden-hour-madison',
    src: '/photos/golden-hour-madison.jpg',
    alt:
      'Golden hour on a Madison street: a church tower in silhouette against an orange sky, ' +
      'with bare trees, glass buildings and traffic taillights in the foreground.',
    caption: 'Golden hour',
    meta: 'Madison, Wisconsin',
  },
  {
    id: 'star-trails',
    src: '/photos/star-trails.jpg',
    alt:
      'Star trails circling the celestial pole in concentric blue arcs above the silhouettes of bare trees.',
    caption: 'Star trails',
    meta: 'Night sky',
  },
];
