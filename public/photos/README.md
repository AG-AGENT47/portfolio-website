# Hero gallery photos

Image files for the hero portrait gallery. Filenames here must match the `src`
paths in `src/lib/photos.ts`.

## Current state: 5 random placeholders

Every file here is a random landscape from picsum.photos, committed so the
gallery is testable on the live site. Replace each with a real shot (same
filename = no code change) and rewrite its `caption` / `meta` / `alt` in
`src/lib/photos.ts`.

| File | Entry caption |
|------|---------------|
| `golden-hour-lake-wisconsin.jpg` | Golden hour at Lake Wisconsin — **replace with the real photo** |
| `placeholder-2.jpg` | Placeholder 02 |
| `placeholder-3.jpg` | Placeholder 03 |
| `placeholder-4.jpg` | Placeholder 04 |
| `placeholder-5.jpg` | Placeholder 05 |

If a file is missing the hero falls back to the striped placeholder and the
lightbox shows a "photo file not added yet" note.

## Adding / changing photos

1. Put the file here (JPEG or WebP, long edge ~1600–2000px is plenty).
2. Add or edit an entry in `PHOTOS` in `src/lib/photos.ts` with a matching
   `src`, real `alt` text, a `caption`, and an optional `meta` line.

v2: this list should move to a `photos` table in `portfolio-store`.
